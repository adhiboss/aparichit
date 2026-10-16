"""LLM provider package and factory."""

from typing import Optional
from app.config import Settings, get_settings
from app.llm.base import LLMProvider
from app.llm.hosted import HostedLLMProvider
from app.llm.local import LocalOllamaProvider
from app.llm.mock import MockLLMProvider

__all__ = [
    "LLMProvider",
    "HostedLLMProvider",
    "LocalOllamaProvider",
    "MockLLMProvider",
    "get_llm_provider",
]


def get_llm_provider(settings: Optional[Settings] = None) -> LLMProvider:
    """Instantiate and return the configured LLM provider according to application settings."""
    if settings is None:
        settings = get_settings()

    provider_name = settings.LLM_PROVIDER.strip().lower()

    if provider_name == "hosted":
        return HostedLLMProvider(
            api_key=settings.LLM_API_KEY,
            model=settings.LLM_MODEL,
            base_url=settings.LLM_API_BASE_URL,
            timeout=settings.LLM_TIMEOUT,
        )
    elif provider_name in ("local", "ollama"):
        return LocalOllamaProvider(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.OLLAMA_MODEL,
            timeout=settings.LLM_TIMEOUT,
        )
    elif provider_name in ("mock", "test", "testing"):
        return MockLLMProvider()
    else:
        raise ValueError(
            f"Unsupported LLM provider '{provider_name}'. Must be 'hosted', 'local', or 'mock'."
        )
