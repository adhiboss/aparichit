"""Advice generation pipeline orchestrator with RAG, safety classifier, memory, and streaming."""

import json
from pathlib import Path
import re
from typing import Any, Dict, Iterator, List, Optional, Set
from app.community.matcher import SimilarProblemMatcher, get_similar_matcher

from app.config import Settings, get_settings
from app.llm.base import LLMProvider
from app.memory import SessionMemory, get_session_memory
from app.pipeline.classify import (
    CRISIS_FALLBACK_RESPONSE,
    HARMFUL_REFUSAL_RESPONSE,
    SafetyClassifier,
)
from app.pipeline.rewrite import QueryRewriter
from app.pipeline.verify import CitationVerifier
from app.rag.retriever import PassageRetriever, RetrievedPassage
from app.schemas import ChatRequest, ChatResponse, Citation, ResponseMode, SimilarProblem


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
    """Pipeline for processing chat requests with memory, RAG, safety, and streaming."""

    def __init__(
        self,
        provider: LLMProvider,
        retriever: Optional[PassageRetriever] = None,
        safety_classifier: Optional[SafetyClassifier] = None,
        citation_verifier: Optional[CitationVerifier] = None,
        memory: Optional[SessionMemory] = None,
        rewriter: Optional[QueryRewriter] = None,
        matcher: Optional[SimilarProblemMatcher] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        self.provider = provider
        self.settings = settings or get_settings()
        self.retriever = retriever
        self.safety_classifier = safety_classifier or SafetyClassifier()
        self.citation_verifier = citation_verifier or CitationVerifier()
        self.memory = memory or get_session_memory()
        self.rewriter = rewriter or QueryRewriter(provider=self.provider)
        self.matcher = matcher or get_similar_matcher()


    def retrieve_passages(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> List[RetrievedPassage]:
        """Perform contextual query-rewritten search with keyword fallback."""
        if not self.retriever:
            return []

        # 1. Formulate standalone search query taking prior conversation turns into account
        search_query = self.rewriter.rewrite(message, history) if history else message

        # 2. First pass: search using standalone query
        passages = self.retriever.retrieve(
            query=search_query,
            top_k=3,
            min_similarity=self.settings.RETRIEVAL_THRESHOLD,
        )
        if passages:
            return passages

        # 3. Second pass: content keyword fallback
        kw_query = extract_keywords_query(search_query)
        if kw_query and kw_query != search_query:
            passages = self.retriever.retrieve(
                query=kw_query,
                top_k=3,
                min_similarity=self.settings.RETRIEVAL_THRESHOLD,
            )

        return passages

    def generate_advice(self, request: ChatRequest) -> ChatResponse:
        """Process a user chat request with memory context, safety, RAG, and citation verification."""
        # 1. Safety Classification
        classification = self.safety_classifier.classify(request.message)

        # 1.1 Crisis Path: Instant bypass with helpline resources
        if classification.flag == "crisis":
            answer = classification.crisis_response or CRISIS_FALLBACK_RESPONSE
            self.memory.add_message(request.session_id, "user", request.message)
            self.memory.add_message(request.session_id, "assistant", answer)
            return ChatResponse(
                answer=answer,
                mode="inspired",
                citations=[],
                source_labels=["crisis_support"],
                similar=[],
                safety_flag="crisis",
            )

        # 1.2 Harmful Path: Immediate peaceful refusal
        if classification.flag == "harmful":
            answer = classification.crisis_response or HARMFUL_REFUSAL_RESPONSE
            self.memory.add_message(request.session_id, "user", request.message)
            self.memory.add_message(request.session_id, "assistant", answer)
            return ChatResponse(
                answer=answer,
                mode="inspired",
                citations=[],
                source_labels=["ai_suggestion"],
                similar=[],
                safety_flag="harmful",
            )

        # 2. Load recent conversational memory turns
        history = self.memory.get_history(request.session_id, max_messages=6)

        # 3. Retrieve scripture if faith_on is enabled
        passages: List[RetrievedPassage] = []
        if request.faith_on:
            passages = self.retrieve_passages(request.message, history)

        # 4. Determine response mode
        mode = classify_mode(
            message=request.message,
            faith_on=request.faith_on,
            passages=passages,
        )

        # 5. Preliminary citations
        citations: List[Citation] = []
        if mode == "grounded" and passages:
            citations = [p.to_citation() for p in passages]

        # 6. Construct prompt
        system_content = build_system_prompt(
            faith_on=request.faith_on,
            tradition=request.tradition,
            mode=mode,
            passages=passages if mode == "grounded" else [],
            safety_flag=classification.flag,
        )

        messages: List[Dict[str, str]] = [
            {"role": "system", "content": system_content},
        ]
        # Include previous conversation turns for multi-turn context
        messages.extend(history)
        messages.append({"role": "user", "content": request.message})

        # 7. Generate LLM response
        raw_response = self.provider.generate(messages, stream=False)
        answer_text = str(raw_response).strip()

        # 8. Citation Verification
        verified_answer, verified_citations = self.citation_verifier.verify(
            answer=answer_text,
            retrieved_passages=passages,
            citations=citations,
        )

        if mode == "grounded" and not verified_citations:
            mode = "inspired"

        source_labels = ["ai_suggestion"]
        if verified_citations:
            source_labels.insert(0, "scripture")

        # 9. Find similar community problems (strictly excluded if crisis/harmful)
        similar_cards: List[SimilarProblem] = []
        if classification.flag not in ("crisis", "harmful"):
            similar_cards = self.matcher.find_similar(
                query_text=request.message,
                top_k=3,
                threshold=self.settings.SIMILARITY_THRESHOLD,
            )

        if similar_cards:
            if "scripture" in source_labels:
                source_labels.insert(1, "community_experience")
            else:
                source_labels.insert(0, "community_experience")

        # 10. Update conversational session memory
        self.memory.add_message(request.session_id, "user", request.message)
        self.memory.add_message(request.session_id, "assistant", verified_answer)

        return ChatResponse(
            answer=verified_answer,
            mode=mode,
            citations=verified_citations,
            source_labels=source_labels,
            similar=similar_cards,
            safety_flag=classification.flag,
        )


    def generate_advice_stream(self, request: ChatRequest) -> Iterator[str]:
        """Stream an advice response as Server-Sent Events (SSE).

        Yields lines formatted as `data: {...}\n\n`.
        """
        # 1. Safety check
        classification = self.safety_classifier.classify(request.message)

        if classification.flag == "crisis":
            answer = classification.crisis_response or CRISIS_FALLBACK_RESPONSE
            self.memory.add_message(request.session_id, "user", request.message)
            self.memory.add_message(request.session_id, "assistant", answer)
            yield f"data: {json.dumps({'token': answer})}\n\n"
            yield f"data: {json.dumps({'done': True, 'mode': 'inspired', 'citations': [], 'source_labels': ['crisis_support'], 'safety_flag': 'crisis'})}\n\n"
            return

        if classification.flag == "harmful":
            answer = classification.crisis_response or HARMFUL_REFUSAL_RESPONSE
            self.memory.add_message(request.session_id, "user", request.message)
            self.memory.add_message(request.session_id, "assistant", answer)
            yield f"data: {json.dumps({'token': answer})}\n\n"
            yield f"data: {json.dumps({'done': True, 'mode': 'inspired', 'citations': [], 'source_labels': ['ai_suggestion'], 'safety_flag': 'harmful'})}\n\n"
            return

        # 2. History & Retrieval
        history = self.memory.get_history(request.session_id, max_messages=6)
        passages: List[RetrievedPassage] = []
        if request.faith_on:
            passages = self.retrieve_passages(request.message, history)

        mode = classify_mode(
            message=request.message,
            faith_on=request.faith_on,
            passages=passages,
        )

        citations = [p.to_citation() for p in passages] if (mode == "grounded" and passages) else []

        system_content = build_system_prompt(
            faith_on=request.faith_on,
            tradition=request.tradition,
            mode=mode,
            passages=passages if mode == "grounded" else [],
            safety_flag=classification.flag,
        )

        messages: List[Dict[str, str]] = [
            {"role": "system", "content": system_content},
        ]
        messages.extend(history)
        messages.append({"role": "user", "content": request.message})

        # 3. Stream from LLM provider
        token_stream = self.provider.generate(messages, stream=True)
        accumulated_text: List[str] = []

        for token in token_stream:
            accumulated_text.append(token)
            yield f"data: {json.dumps({'token': token})}\n\n"

        full_answer = "".join(accumulated_text).strip()

        # 4. Verification & memory update
        verified_answer, verified_citations = self.citation_verifier.verify(
            answer=full_answer,
            retrieved_passages=passages,
            citations=citations,
        )

        if mode == "grounded" and not verified_citations:
            mode = "inspired"

        source_labels = ["ai_suggestion"]
        if verified_citations:
            source_labels.insert(0, "scripture")

        # Find similar community problems (strictly excluded if crisis/harmful)
        similar_cards: List[SimilarProblem] = []
        if classification.flag not in ("crisis", "harmful"):
            similar_cards = self.matcher.find_similar(
                query_text=request.message,
                top_k=3,
                threshold=self.settings.SIMILARITY_THRESHOLD,
            )

        if similar_cards:
            if "scripture" in source_labels:
                source_labels.insert(1, "community_experience")
            else:
                source_labels.insert(0, "community_experience")

        self.memory.add_message(request.session_id, "user", request.message)
        self.memory.add_message(request.session_id, "assistant", verified_answer)

        # 5. Final metadata event
        final_meta = {
            "done": True,
            "mode": mode,
            "citations": [c.model_dump() for c in verified_citations],
            "source_labels": source_labels,
            "similar": [s.model_dump() for s in similar_cards],
            "safety_flag": classification.flag,
        }
        yield f"data: {json.dumps(final_meta)}\n\n"

