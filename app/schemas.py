"""Pydantic schemas for APARICHIT API request and response models."""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class Citation(BaseModel):
    """Citation metadata for verified scripture passages."""

    source: str = Field(..., description="Name of the source text")
    translation: str = Field(..., description="Translator or edition")
    chapter: str = Field(..., description="Chapter or section identifier")
    verse: Optional[str] = Field(default=None, description="Verse number if known")
    excerpt: str = Field(..., description="Exact quoted excerpt from verified passage")


class SimilarProblem(BaseModel):
    """Anonymised similar problem card from the community index."""

    post_id: str = Field(..., description="Anonymised post ID")
    display_name: str = Field(..., description="Randomised anonymous display name")
    snippet: str = Field(..., description="Short preview of the shared problem")
    reply_count: int = Field(default=0, description="Number of community replies")
    similarity: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")


ResponseMode = Literal["grounded", "inspired", "playful"]


class ChatRequest(BaseModel):
    """Request payload for /chat and /chat/stream."""

    session_id: str = Field(..., min_length=1, max_length=128, description="Client session identifier")
    message: str = Field(..., min_length=1, max_length=5000, description="User's question or dilemma")
    faith_on: bool = Field(default=False, description="Enable spiritual guidance and scripture retrieval")
    tradition: str = Field(default="garuda_purana", description="Chosen philosophical or scripture tradition")


class ChatResponse(BaseModel):
    """Response payload for /chat."""

    answer: str = Field(..., description="Advisor's response text")
    mode: ResponseMode = Field(..., description="Response mode: grounded, inspired, or playful")
    citations: List[Citation] = Field(default_factory=list, description="Verified scripture citations")
    source_labels: List[str] = Field(
        default_factory=lambda: ["ai_suggestion"],
        description="Source labels: scripture, community_experience, ai_suggestion",
    )
    similar: List[SimilarProblem] = Field(
        default_factory=list,
        description="Anonymous similar problems (empty if none meet threshold)",
    )
    safety_flag: Optional[str] = Field(
        default=None,
        description="Triggered safety category if any (crisis, harmful, etc.)",
    )


class HealthResponse(BaseModel):
    """Response payload for /health."""

    status: str = Field(default="ok", description="Service health status")
    app_name: str = Field(..., description="Application name")
    version: str = Field(..., description="Application version")
    llm_provider: str = Field(..., description="Configured LLM provider")
