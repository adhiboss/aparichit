"""LLM provider base interface and protocol definition."""

from typing import Any, Dict, Iterator, List, Protocol, Union, runtime_checkable


@runtime_checkable
class LLMProvider(Protocol):
    """Protocol defining the standard interface for LLM providers.

    All LLM backends (hosted APIs, local Ollama, mock/testing) must implement
    this protocol, allowing provider swaps via configuration only.
    """

    def generate(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False,
        **kw: Any,
    ) -> Union[str, Iterator[str]]:
        """Generate a response given a list of chat message dictionaries.

        Args:
            messages: List of message dictionaries, each containing 'role' and 'content'.
            stream: Whether to stream the response chunks.
            **kw: Additional generation parameters (temperature, max_tokens, etc.).

        Returns:
            A string response when stream is False, or an iterator of string chunks when stream is True.
        """
        ...
