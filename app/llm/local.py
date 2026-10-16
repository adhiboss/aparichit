"""Local LLM provider using Ollama's HTTP API."""

import json
from typing import Any, Dict, Iterator, List, Union
import httpx


class LocalOllamaProvider:
    """Provider for locally running LLMs via Ollama."""

    def __init__(
        self,
        base_url: str = "http://localhost:11434",
        model: str = "llama3.2",
        timeout: float = 60.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    def generate(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False,
        **kw: Any,
    ) -> Union[str, Iterator[str]]:
        """Generate a response using Ollama /api/chat.

        Args:
            messages: List of chat message dictionaries.
            stream: Whether to stream the response.
            **kw: Extra parameters (e.g., temperature).

        Returns:
            String response if stream is False, or Iterator of tokens if stream is True.

        Raises:
            RuntimeError: If connecting to Ollama fails.
        """
        endpoint = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": stream,
            "options": kw,
        }

        if not stream:
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    resp = client.post(endpoint, json=payload)
                    resp.raise_for_status()
                    data = resp.json()
                    return data.get("message", {}).get("content", "")
            except httpx.ConnectError as e:
                raise RuntimeError(
                    f"Could not connect to Ollama at {self.base_url}. Ensure Ollama is running."
                ) from e
            except Exception as e:
                raise RuntimeError(f"Ollama generation failed: {e}") from e

        return self._stream_generator(endpoint, payload)

    def _stream_generator(self, endpoint: str, payload: Dict[str, Any]) -> Iterator[str]:
        try:
            with httpx.Client(timeout=self.timeout) as client:
                with client.stream("POST", endpoint, json=payload) as response:
                    response.raise_for_status()
                    for line in response.iter_lines():
                        if not line:
                            continue
                        try:
                            chunk_data = json.loads(line)
                            content = chunk_data.get("message", {}).get("content", "")
                            if content:
                                yield content
                            if chunk_data.get("done", False):
                                break
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            raise RuntimeError(f"Error streaming from Ollama: {e}") from e
