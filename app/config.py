"""Configuration settings for APARICHIT backend application."""

from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment and .env."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application Info
    APP_NAME: str = "APARICHIT"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # LLM Settings
    LLM_PROVIDER: str = "hosted"  # Options: "hosted", "local", "mock"
    LLM_API_KEY: str = ""
    LLM_API_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_TIMEOUT: float = 60.0

    # Local LLM (Ollama)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    # Vector Database & Embeddings
    EMBEDDING_MODEL: str = "intfloat/multilingual-e5-small"
    VECTOR_DB_PATH: str = "./data/chroma"

    # Relational Database
    DATABASE_URL: str = "sqlite:///./aparichit.db"

    # Security & CORS
    CORS_ORIGINS: str = "http://localhost:3000"
    ADMIN_TOKEN: str = "aparichit_admin_secret"


    # Thresholds & Limits
    SIMILARITY_THRESHOLD: float = 0.80
    RETRIEVAL_THRESHOLD: float = 0.35
    DAILY_FREE_MESSAGES: int = 20

    @property
    def cors_origins_list(self) -> List[str]:
        """Return CORS origins as a list of trimmed strings."""
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    """Return cached application settings instance."""
    return Settings()
