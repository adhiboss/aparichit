"""Advice generation pipeline orchestrator with RAG, safety classifier, and citation verifier."""

from pathlib import Path
import re
from typing import Dict, List, Optional, Set
from app.config import Settings, get_settings
from app.llm.base import LLMProvider
from app.pipeline.classify import (
    CRISIS_FALLBACK_RESPONSE,
    HARMFUL_REFUSAL_RESPONSE,
    SafetyClassifier,
)
from app.pipeline.verify import CitationVerifier
from app.rag.retriever import PassageRetriever, RetrievedPassage
from app.schemas import ChatRequest, ChatResponse, Citation, ResponseMode

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

COMMON_STOPWORDS: Set[str] = {
    "i", "me", "my", "myself", "we", "our", "ours", "you", "your", "yours",
    "he", "him", "his", "she", "her", "hers", "it", "its", "they", "them",
    "what", "which", "who", "whom", "this", "that", "these", "those",
    "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "having", "do", "does", "did", "doing",
    "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
    "while", "of", "at", "by", "for", "with", "about", "against", "between",
    "into", "through", "during", "before", "after", "above", "below", "to",
    "from", "up", "down", "in", "out", "on", "off", "over", "under", "again",
    "further", "then", "once", "here", "there", "when", "where", "why", "how",
    "all", "any", "both", "each", "few", "more", "most", "other", "some",
    "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too",
    "very", "s", "t", "can", "will", "just", "don", "should", "now",
    "want", "would", "could", "tell", "please",
}


def load_prompt_file(filename: str) -> str:
    """Load text content of a prompt file from app/prompts."""
    file_path = PROMPTS_DIR / filename
    if file_path.exists():
        return file_path.read_text(encoding="utf-8").strip()
    return ""


def extract_keywords_query(message: str) -> str:
    """Extract content words for fallback search when raw conversational query has low recall."""
    words = re.findall(r"\b[a-zA-Z]{3,}\b", message.lower())
    content_words = [w for w in words if w not in COMMON_STOPWORDS]
    return " ".join(content_words) if content_words else message


def is_playful_query(message: str) -> bool:
    """Check if query is casual, humorous, technical, or off-topic."""
    msg_lower = message.lower().strip()
    words = msg_lower.split()

    if len(words) <= 2:
        return True

    playful_keywords = [
        "joke", "funny", "lol", "haha", "meme", "pizza", "burger", "coffee",
        "python", "javascript", "code", "bug", "math", "calculate", "2+2",
        "movie", "song", "game", "minecraft", "superhero", "cat", "dog",
        "who are you", "what are you", "alien", "dinosaur", "recipe",
    ]
    return any(kw in msg_lower for kw in playful_keywords)


def classify_mode(
    message: str,
    faith_on: bool,
    passages: List[RetrievedPassage],
) -> ResponseMode:
    """Determine response mode: 'playful', 'grounded', or 'inspired'.

    Rules:
    - 'playful': Casual, humorous, short, or coding/math queries.
    - 'grounded': Only when faith_on is True AND at least one verified passage meets threshold.
    - 'inspired': When faith_on is False, or when no passage meets retrieval threshold.
    """
    if is_playful_query(message):
        return "playful"

    if faith_on and len(passages) > 0:
        return "grounded"

    return "inspired"


def build_system_prompt(
    faith_on: bool,
    tradition: str = "garuda_purana",
    mode: ResponseMode = "inspired",
    passages: Optional[List[RetrievedPassage]] = None,
    safety_flag: Optional[str] = None,
) -> str:
    """Build the system prompt combining persona, rules, mode instructions, and retrieved passages."""
    system_base = load_prompt_file("system.md")
    format_base = load_prompt_file("advice_format.md")

    safety_directive = ""
    if safety_flag == "medical":
        safety_directive = (
            "\nIMPORTANT: The user asks regarding medical symptoms/treatment. "
            "You are NOT a doctor. Do not diagnose or prescribe. Provide general compassionate support "
            "and explicitly urge consulting a qualified physician."
        )
    elif safety_flag == "legal":
        safety_directive = (
            "\nIMPORTANT: The user asks regarding legal matters. "
            "You are NOT an attorney. Do not provide formal legal counsel. "
            "Direct the user to seek licensed legal assistance."
        )

    if not faith_on:
        faith_instruction = (
            "Spiritual Guidance: DISABLED.\n"
            "Provide grounded, practical, compassionate life advice without quoting scripture, "
            "religious texts, or invoking supernatural concepts. Focus on psychology, human relationships, "
            "and constructive daily action."
        )
    elif mode == "playful":
        faith_instruction = (
            f"Spiritual Guidance: ENABLED (Tradition: {tradition}).\n"
            "Mode: PLAYFUL.\n"
            "The user's query is lighthearted, casual, humorous, or technical. "
            "Give a direct, accurate, and witty answer (2 to 5 sentences). "
            "Connect lightly to a timeless virtue (moderation, truth, karma, or detachment) with gentle good humor."
        )
    elif mode == "grounded" and passages:
        passages_text = "\n\n".join(
            f"[Passage {i+1}]\n"
            f"Source: {p.source} ({p.translation})\n"
            f"Section/Chapter: {p.section} - {p.chapter}\n"
            f"Verse: {p.verse}\n"
            f"Text: \"{p.text}\""
            for i, p in enumerate(passages)
        )
        faith_instruction = (
            f"Spiritual Guidance: ENABLED (Tradition: {tradition}).\n"
            "Mode: GROUNDED.\n"
            "Verified scripture passages are provided below. In your 'What the Garuda Purana says' section, "
            "you MUST base your scriptural reflection directly on these verified passage(s), specifically "
            "citing the chapter and verse. DO NOT invent, hallucinate, or cite any passage outside of these.\n\n"
            f"--- VERIFIED SCRIPTURE PASSAGES ---\n{passages_text}\n-----------------------------------"
        )
    else:  # inspired
        faith_instruction = (
            f"Spiritual Guidance: ENABLED (Tradition: {tradition}).\n"
            "Mode: INSPIRED.\n"
            "No direct scripture verse was retrieved for this specific dilemma. "
            "DO NOT fabricate or invent a verse, quote, or chapter number. "
            "Instead, frame your advice around general Garuda Purana ethical principles "
            "(such as karma, self-examination, truthfulness, and duty) and clearly present it as an inspired reflection."
        )

    return f"{system_base}\n\n{faith_instruction}{safety_directive}\n\n{format_base}".strip()


class AdvicePipeline:
    """Pipeline for processing chat requests and producing APARICHIT advice responses."""

    def __init__(
        self,
        provider: LLMProvider,
        retriever: Optional[PassageRetriever] = None,
        safety_classifier: Optional[SafetyClassifier] = None,
        citation_verifier: Optional[CitationVerifier] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        self.provider = provider
        self.settings = settings or get_settings()
        self.retriever = retriever
        self.safety_classifier = safety_classifier or SafetyClassifier()
        self.citation_verifier = citation_verifier or CitationVerifier()

    def retrieve_passages(self, query: str) -> List[RetrievedPassage]:
        """Perform two-pass retrieval (direct query first, then content-keywords fallback)."""
        if not self.retriever:
            return []

        # First pass: direct query
        passages = self.retriever.retrieve(
            query=query,
            top_k=3,
            min_similarity=self.settings.RETRIEVAL_THRESHOLD,
        )
        if passages:
            return passages

        # Second pass: keyword fallback
        kw_query = extract_keywords_query(query)
        if kw_query and kw_query != query:
            passages = self.retriever.retrieve(
                query=kw_query,
                top_k=3,
                min_similarity=self.settings.RETRIEVAL_THRESHOLD,
            )

        return passages

    def generate_advice(self, request: ChatRequest) -> ChatResponse:
        """Process a user chat request with safety classification, RAG, and citation verification."""
        # 1. Safety Classification
        classification = self.safety_classifier.classify(request.message)

        # 1.1 Crisis Path: Instant bypass with helpline resources, dropping all persona & scripture
        if classification.flag == "crisis":
            return ChatResponse(
                answer=classification.crisis_response or CRISIS_FALLBACK_RESPONSE,
                mode="inspired",
                citations=[],
                source_labels=["crisis_support"],
                similar=[],
                safety_flag="crisis",
            )

        # 1.2 Harmful Path: Immediate peaceful refusal
        if classification.flag == "harmful":
            return ChatResponse(
                answer=classification.crisis_response or HARMFUL_REFUSAL_RESPONSE,
                mode="inspired",
                citations=[],
                source_labels=["ai_suggestion"],
                similar=[],
                safety_flag="harmful",
            )

        # 2. Retrieve scripture if faith_on is enabled
        passages: List[RetrievedPassage] = []
        if request.faith_on:
            passages = self.retrieve_passages(request.message)

        # 3. Determine response mode
        mode = classify_mode(
            message=request.message,
            faith_on=request.faith_on,
            passages=passages,
        )

        # 4. Preliminary citations and source labels
        citations: List[Citation] = []
        if mode == "grounded" and passages:
            citations = [p.to_citation() for p in passages]

        # 5. Construct system prompt
        system_content = build_system_prompt(
            faith_on=request.faith_on,
            tradition=request.tradition,
            mode=mode,
            passages=passages if mode == "grounded" else [],
            safety_flag=classification.flag,
        )

        messages: List[Dict[str, str]] = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": request.message},
        ]

        # 6. Generate LLM response
        raw_response = self.provider.generate(messages, stream=False)
        answer_text = str(raw_response).strip()

        # 7. Citation Verification & Anti-Hallucination Filtering
        verified_answer, verified_citations = self.citation_verifier.verify(
            answer=answer_text,
            retrieved_passages=passages,
            citations=citations,
        )

        # If citation verification dropped all citations, fallback mode to inspired
        if mode == "grounded" and not verified_citations:
            mode = "inspired"

        source_labels = ["scripture", "ai_suggestion"] if verified_citations else ["ai_suggestion"]

        return ChatResponse(
            answer=verified_answer,
            mode=mode,
            citations=verified_citations,
            source_labels=source_labels,
            similar=[],
            safety_flag=classification.flag,
        )
