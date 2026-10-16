"""Tests for LLM providers, provider switching, and interface compliance."""

from unittest.mock import MagicMock, patch
import pytest
from app.config import Settings
from app.llm import (
    HostedLLMProvider,
    LLMProvider,
    LocalOllamaProvider,
    MockLLMProvider,
    get_llm_provider,
)


def test_mock_provider_protocol_compliance() -> None:
    """Verify MockLLMProvider conforms to LLMProvider protocol."""
    provider = MockLLMProvider()
    assert isinstance(provider, LLMProvider)


def test_mock_provider_non_streaming() -> None:
    """Verify MockLLMProvider returns standard response."""
    provider = MockLLMProvider()
    messages = [{"role": "user", "content": "Hello"}]
    result = provider.generate(messages, stream=False)
    assert isinstance(result, str)
    assert len(result) > 0
    assert len(provider.call_history) == 1
    assert provider.call_history[0] == messages


def test_mock_provider_streaming() -> None:
    """Verify MockLLMProvider streams tokens properly."""
    provider = MockLLMProvider(default_response="One two three")
    messages = [{"role": "user", "content": "Stream me"}]
    stream = provider.generate(messages, stream=True)
    chunks = list(stream)
    assert "".join(chunks) == "One two three"


def test_provider_factory_switching() -> None:
    """Verify get_llm_provider switches providers via settings without code changes."""
    # Mock
    settings_mock = Settings(LLM_PROVIDER="mock")
    provider_mock = get_llm_provider(settings_mock)
    assert isinstance(provider_mock, MockLLMProvider)

    # Hosted
    settings_hosted = Settings(LLM_PROVIDER="hosted", LLM_API_KEY="sk-test-123")
    provider_hosted = get_llm_provider(settings_hosted)
    assert isinstance(provider_hosted, HostedLLMProvider)
    assert provider_hosted.api_key == "sk-test-123"

    # Local / Ollama
    settings_local = Settings(LLM_PROVIDER="local")
    provider_local = get_llm_provider(settings_local)
    assert isinstance(provider_local, LocalOllamaProvider)

    # Invalid provider
    settings_invalid = Settings(LLM_PROVIDER="unsupported_provider")
    with pytest.raises(ValueError, match="Unsupported LLM provider"):
        get_llm_provider(settings_invalid)


def test_hosted_provider_missing_key() -> None:
    """Verify HostedLLMProvider raises ValueError if api_key is missing."""
    provider = HostedLLMProvider(api_key="")
    with pytest.raises(ValueError, match="Hosted LLM provider requires LLM_API_KEY"):
        provider.generate([{"role": "user", "content": "Hi"}])


def test_hosted_provider_generate_with_mock_client() -> None:
    """Verify HostedLLMProvider formats request correctly and handles response."""
    provider = HostedLLMProvider(api_key="test-key", model="gpt-4o-mini")

    mock_resp = MagicMock()
    mock_resp.json.return_value = {
        "choices": [{"message": {"content": "Wisdom speaks gently."}}]
    }
    mock_resp.raise_for_status.return_value = None

    with patch("httpx.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_client.post.return_value = mock_resp
        mock_client_cls.return_value.__enter__.return_value = mock_client

        output = provider.generate([{"role": "user", "content": "What is duty?"}])
        assert output == "Wisdom speaks gently."
        mock_client.post.assert_called_once()
        call_kwargs = mock_client.post.call_args[1]
        assert call_kwargs["json"]["model"] == "gpt-4o-mini"
        assert call_kwargs["headers"]["Authorization"] == "Bearer test-key"
