"""Tests for application settings and configuration."""

from app.config import Settings


def test_default_settings() -> None:
    """Verify default configuration values."""
    settings = Settings()
    assert settings.APP_NAME == "APARICHIT"
    assert settings.APP_VERSION == "0.1.0"
    assert settings.SIMILARITY_THRESHOLD == 0.80
    assert settings.RETRIEVAL_THRESHOLD == 0.35
    assert settings.DAILY_FREE_MESSAGES == 20


def test_cors_origins_parsing() -> None:
    """Verify CORS origins split and trim."""
    settings = Settings(CORS_ORIGINS="http://localhost:3000, https://aparichit.app ")
    origins = settings.cors_origins_list
    assert len(origins) == 2
    assert origins[0] == "http://localhost:3000"
    assert origins[1] == "https://aparichit.app"


def test_cors_origins_wildcard_fallback() -> None:
    """Verify empty CORS origins fall back to ['*']."""
    settings = Settings(CORS_ORIGINS="")
    assert settings.cors_origins_list == ["*"]
