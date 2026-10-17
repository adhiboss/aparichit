"""Advice generation pipeline orchestrator with RAG and structured citations."""

from pathlib import Path
import re
from typing import Dict, List, Optional, Set
from app.config import Settings, get_settings
from app.llm.base import LLMProvider
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
) -> str:
    """Build the system prompt combining persona, rules, mode instructions, and retrieved passages."""
    system_base = load_prompt_file("system.md")
    format_base = load_prompt_file("advice_format.md")

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

    return f"{system_base}\n\n{faith_instruction}\n\n{format_base}".strip()


class AdvicePipeline:
    """Pipeline for processing chat requests and producing APARICHIT advice responses."""

    def __init__(
        self,
        provider: LLMProvider,
        retriever: Optional[PassageRetriever] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        self.provider = provider
        self.settings = settings or get_settings()
        self.retriever = retriever

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
        """Process a user chat request and generate an advice response with RAG and citations."""
        passages: List[RetrievedPassage] = []

        # 1. Retrieve scripture if faith_on is enabled
        if request.faith_on:
            passages = self.retrieve_passages(request.message)

        # 2. Determine response mode
        mode = classify_mode(
            message=request.message,
            faith_on=request.faith_on,
            passages=passages,
        )

        # 3. Build citations and source labels
        citations: List[Citation] = []
        source_labels: List[str] = ["ai_suggestion"]

        if mode == "grounded" and passages:
            citations = [p.to_citation() for p in passages]
            source_labels = ["scripture", "ai_suggestion"]

        # 4. Construct system prompt
        system_content = build_system_prompt(
            faith_on=request.faith_on,
            tradition=request.tradition,
            mode=mode,
            passages=passages if mode == "grounded" else [],
        )

        messages: List[Dict[str, str]] = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": request.message},
        ]

        # 5. Generate LLM response
        raw_response = self.provider.generate(messages, stream=False)
        answer_text = str(raw_response).strip()

        return ChatResponse(
            answer=answer_text,
            mode=mode,
            citations=citations,
            source_labels=source_labels,
            similar=[],
            safety_flag=None,
        )
