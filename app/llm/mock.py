"""Mock LLM provider for deterministic offline testing and development."""

from typing import Any, Dict, Iterator, List, Optional, Union


class MockLLMProvider:
    """Deterministic mock LLM provider for unit tests and offline development."""

    def __init__(self, default_response: Optional[str] = None) -> None:
        self.default_response = (
            default_response
            or (
                "I hear the distress and weight in your heart. In the reflection of ancient wisdom, "
                "every action carries consequence, yet every dawn brings the capacity for truth and renewal. "
                "Consider opening a conversation with honesty and taking responsibility gently."
            )
        )
        self.call_history: List[List[Dict[str, str]]] = []

    def generate(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False,
        **kw: Any,
    ) -> Union[str, Iterator[str]]:
        """Return the mock response or stream it word by word."""
        self.call_history.append(messages)

        # Allow passing a custom response in kwargs for test cases
        response = kw.get("mock_response", self.default_response)

        if not stream:
            return response

        # Stream words as chunks
        words = response.split(" ")

        def _generator() -> Iterator[str]:
            for i, word in enumerate(words):
                yield word + (" " if i < len(words) - 1 else "")

        return _generator()
