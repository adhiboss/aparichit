"""Hosted LLM provider using OpenAI-compatible HTTP API."""

import json
from typing import Any, Dict, Iterator, List, Union
import httpx


class HostedLLMProvider:
    """Provider for hosted LLM APIs using the standard OpenAI-compatible completions format.

    Compatible with OpenAI, Groq, OpenRouter, DeepSeek, Mistral, and self-hosted vLLM.
    """

    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4o-mini",
        base_url: str = "https://api.openai.com/v1",
        timeout: float = 60.0,
    ) -> None:
        self.api_key = api_key.strip() if api_key else ""
        cleaned_model = model.strip().strip("'\"") if model else ""
        self.model = cleaned_model or "gemini-flash-lite-latest"
        self.base_url = base_url.strip().rstrip("/") if base_url else "https://generativelanguage.googleapis.com/v1beta/openai"
        self.timeout = timeout

    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def generate(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False,
        **kw: Any,
    ) -> Union[str, Iterator[str]]:
        """Generate response from hosted LLM provider.

        Args:
            messages: List of chat messages with 'role' and 'content'.
            stream: Whether to stream the response.
            **kw: Extra parameters such as temperature, max_tokens, etc.

        Returns:
            String response if stream is False, or Iterator of text tokens if stream is True.

        Raises:
            ValueError: If API key is missing.
            RuntimeError: If API call fails.
        """
        if not self.api_key:
            raise ValueError(
                "Hosted LLM provider requires LLM_API_KEY. "
                "Set LLM_API_KEY in .env or switch LLM_PROVIDER to 'mock' or 'local'."
            )

        payload = {
            "model": self.model,
            "messages": messages,
            "stream": stream,
            **kw,
        }

        endpoint = f"{self.base_url}/chat/completions"

        if not stream:
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    resp = client.post(endpoint, headers=self._get_headers(), json=payload)
                    resp.raise_for_status()
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"]
                    return content or ""
            except httpx.HTTPStatusError as e:
                raise RuntimeError(
                    f"Hosted LLM returned status {e.response.status_code}: {e.response.text}"
                ) from e
            except Exception as e:
                raise RuntimeError(f"Hosted LLM request failed: {e}") from e

        return self._stream_generator(endpoint, payload)

    def _stream_generator(self, endpoint: str, payload: Dict[str, Any]) -> Iterator[str]:
        try:
            with httpx.Client(timeout=self.timeout) as client:
                with client.stream(
                    "POST", endpoint, headers=self._get_headers(), json=payload
                ) as response:
                    response.raise_for_status()
                    for line in response.iter_lines():
                        if not line:
                            continue
                        line_str = line.strip()
                        if line_str.startswith("data: "):
                            data_content = line_str[6:].strip()
                            if data_content == "[DONE]":
                                break
                            try:
                                chunk_json = json.loads(data_content)
                                delta = chunk_json.get("choices", [{}])[0].get("delta", {})
                                chunk_text = delta.get("content", "")
                                if chunk_text:
                                    yield chunk_text
                            except json.JSONDecodeError:
                                continue
        except Exception as e:
            raise RuntimeError(f"Error streaming from hosted LLM: {e}") from e
