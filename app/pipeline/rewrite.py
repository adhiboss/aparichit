"""Contextual query rewriting for conversational RAG."""

import re
from typing import Dict, List, Optional
from app.llm.base import LLMProvider

REFERENCE_PATTERNS = [
    r"\b(he|him|his|she|her|hers|it|its|they|them|their)\b",
    r"\b(this|that|these|those|the same)\b",
    r"\b(what about|how about|and what|and how|also|too)\b",
]


class QueryRewriter:
    """Rewrites multi-turn chat messages into standalone search queries for retrieval."""

    def __init__(self, provider: Optional[LLMProvider] = None) -> None:
        self.provider = provider
        self._compiled_refs = [re.compile(p, re.IGNORECASE) for p in REFERENCE_PATTERNS]

    def has_anaphoric_reference(self, message: str) -> bool:
        """Check if message contains pronouns or conversational references to previous turns."""
        return any(pattern.search(message) for pattern in self._compiled_refs)

    def rewrite(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """Rewrite user message + history into a standalone retrieval search query.

        Args:
            message: Current user message.
            history: List of recent message turns [{'role': ..., 'content': ...}].

        Returns:
            Standalone search query string.
        """
        clean_msg = message.strip()
        if not history:
            return clean_msg

        # If message is long and doesn't contain reference words, it is likely already standalone
        if len(clean_msg.split()) >= 8 and not self.has_anaphoric_reference(clean_msg):
            return clean_msg

        # If LLM provider is available, use it for intelligent contextual rewriting
        if self.provider:
            try:
                # Format last 2-4 messages of history
                recent_history = history[-4:]
                formatted_history = "\n".join(
                    f"{turn['role'].capitalize()}: {turn['content'][:250]}"
                    for turn in recent_history
                )

                prompt = (
                    "Given the following conversation history and the user's latest follow-up question, "
                    "rewrite the follow-up question into a single, standalone search query suitable for "
                    "searching an ancient philosophical wisdom knowledge base (Garuda Purana).\n"
                    "Resolve all pronouns (such as he, him, it, they, this) with the specific concepts or persons discussed.\n"
                    "Output ONLY the rewritten search query with no quotes, commentary, or punctuation prefix.\n\n"
                    f"Chat History:\n{formatted_history}\n\n"
                    f"Follow-up Question: {clean_msg}\n\n"
                    "Standalone Search Query:"
                )

                messages = [
                    {
                        "role": "system",
                        "content": (
                            "You are a search query optimizer. Output ONLY the standalone search query text, "
                            "nothing else."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ]

                rewritten = self.provider.generate(messages, stream=False)
                rewritten_str = str(rewritten).strip().strip('"').strip("'")
                if rewritten_str and len(rewritten_str.split()) >= 2:
                    return rewritten_str
            except Exception:
                # Fall back to heuristic concatenation on any LLM failure
                pass

        # Heuristic fallback: combine previous user topic with follow-up query
        last_user_turn = next(
            (t["content"] for t in reversed(history) if t.get("role") == "user"),
            "",
        )
        if last_user_turn:
            # Extract key nouns/words from last turn
            prev_keywords = [
                w for w in re.findall(r"\b[a-zA-Z]{4,}\b", last_user_turn)
                if w.lower() not in {"what", "when", "where", "which", "about", "feel", "help"}
            ]
            merged_context = " ".join(prev_keywords[:4])
            if merged_context:
                return f"{clean_msg} ({merged_context})"

        return clean_msg
