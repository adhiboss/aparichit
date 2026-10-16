"""Advice generation pipeline orchestrator."""

from pathlib import Path
from typing import Dict, List, Optional
from app.config import Settings
from app.llm.base import LLMProvider
from app.schemas import ChatRequest, ChatResponse, ResponseMode

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


def load_prompt_file(filename: str) -> str:
    """Load text content of a prompt file from app/prompts."""
    file_path = PROMPTS_DIR / filename
    if file_path.exists():
        return file_path.read_text(encoding="utf-8").strip()
    return ""


def build_system_prompt(faith_on: bool, tradition: str = "garuda_purana") -> str:
    """Build the system prompt combining persona, rules, and faith toggle instructions."""
    system_base = load_prompt_file("system.md")
    format_base = load_prompt_file("advice_format.md")

    faith_instruction = (
        f"Spiritual Guidance: ENABLED (Tradition: {tradition}). "
        "Weave in philosophical and traditional wisdom without claiming divine command. "
        "Distinguish practical wisdom from traditional teachings."
        if faith_on
        else "Spiritual Guidance: DISABLED. Provide grounded, practical, compassionate life advice "
        "without quoting scripture, religious texts, or invoking supernatural concepts."
    )

    combined_prompt = f"{system_base}\n\n{faith_instruction}\n\n{format_base}"
    return combined_prompt.strip()


def classify_initial_mode(message: str) -> ResponseMode:
    """Initial heuristic mode classification for Milestone 1 prior to RAG integration.

    Returns 'playful' for casual, humorous, or coding/math queries; defaults to 'inspired'
    when no retrieved passages are present. Never returns 'grounded' without actual passages.
    """
    msg_lower = message.lower().strip()
    playful_keywords = [
        "joke", "funny", "lol", "haha", "meme", "pizza", "burger", "coffee",
        "python", "javascript", "code", "bug", "math", "calculate", "2+2",
    ]
    if any(kw in msg_lower for kw in playful_keywords) or len(msg_lower.split()) <= 3:
        return "playful"
    return "inspired"


class AdvicePipeline:
    """Pipeline for processing chat requests and producing APARICHIT advice responses."""

    def __init__(self, provider: LLMProvider, settings: Optional[Settings] = None) -> None:
        self.provider = provider
        self.settings = settings

    def generate_advice(self, request: ChatRequest) -> ChatResponse:
        """Process a user chat request and generate an advice response.

        In Milestone 1, this runs the persona prompt through the configured LLM provider
        without retrieval or citations.
        """
        system_content = build_system_prompt(
            faith_on=request.faith_on,
            tradition=request.tradition,
        )

        messages: List[Dict[str, str]] = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": request.message},
        ]

        raw_response = self.provider.generate(messages, stream=False)
        answer_text = str(raw_response).strip()

        mode = classify_initial_mode(request.message)

        # In Milestone 1, no retrieval exists yet, so citations are strictly empty
        # and source label is 'ai_suggestion'.
        return ChatResponse(
            answer=answer_text,
            mode=mode,
            citations=[],
            source_labels=["ai_suggestion"],
            similar=[],
            safety_flag=None,
        )
