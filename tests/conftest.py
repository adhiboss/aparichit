"""Pytest configuration and shared fixtures for APARICHIT tests."""

import os
from typing import Generator
import pytest
from starlette.testclient import TestClient
from app.config import Settings, get_settings
from app.main import app


@pytest.fixture(autouse=True)
def set_test_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """Ensure environment is set to mock provider for all tests."""
    monkeypatch.setenv("LLM_PROVIDER", "mock")
    monkeypatch.setenv("LLM_API_KEY", "test-mock-key")
    # Clear settings cache so new env takes effect
    get_settings.cache_clear()


@pytest.fixture
def test_settings() -> Settings:
    """Return test-specific settings."""
    return Settings(
        LLM_PROVIDER="mock",
        LLM_API_KEY="test-mock-key",
        CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000",
    )


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """TestClient instance for FastAPI application."""
    with TestClient(app) as test_client:
        yield test_client
