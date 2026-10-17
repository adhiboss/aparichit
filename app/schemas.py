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


# Community and Anonymous Auth Schemas


class AnonymousAuthResponse(BaseModel):
    """Response payload for /auth/anonymous."""

    user_id: str = Field(..., description="Unique anonymous user identifier")
    display_name: str = Field(..., description="Poetic randomized anonymous name")
    session_token: str = Field(..., description="Secret bearer token for authenticated operations")
    created_at: str = Field(..., description="ISO 8601 creation timestamp")


class CreatePostRequest(BaseModel):
    """Request payload for creating a community post."""

    content: str = Field(..., min_length=1, max_length=10000, description="Dilemma or problem to share")
    session_token: Optional[str] = Field(default=None, description="Optional bearer token if not using header")


class PostReplyResponse(BaseModel):
    """Schema for a reply to a community post."""

    id: str = Field(..., description="Unique reply identifier")
    post_id: str = Field(..., description="Parent post identifier")
    user_id: str = Field(..., description="Author's anonymous user identifier")
    display_name: str = Field(..., description="Author's poetic anonymous name")
    content: str = Field(..., description="Anonymised reply content")
    is_crisis: bool = Field(default=False, description="Flagged for crisis safety review")
    status: str = Field(default="published", description="Reply status: published, pending_review, removed")
    created_at: str = Field(..., description="ISO 8601 timestamp")



class PostResponse(BaseModel):
    """Schema for a published community post."""

    id: str = Field(..., description="Unique post identifier")
    user_id: str = Field(..., description="Author's anonymous user identifier")
    display_name: str = Field(..., description="Author's poetic anonymous name")
    content: str = Field(..., description="Anonymised post content")
    reply_count: int = Field(default=0, description="Number of replies")
    is_crisis: bool = Field(default=False, description="Flagged for crisis/moderator review")
    status: str = Field(default="published", description="Post status: published or pending_review")
    created_at: str = Field(..., description="ISO 8601 timestamp")
    replies: Optional[List[PostReplyResponse]] = Field(
        default=None,
        description="List of replies if fetched with post",
    )


class CreateReplyRequest(BaseModel):
    """Request payload for replying to a community post."""

    content: str = Field(..., min_length=1, max_length=5000, description="Reply content")
    session_token: Optional[str] = Field(default=None, description="Optional bearer token if not using header")


class CreateReportRequest(BaseModel):
    """Request payload for reporting a post or reply."""

    target_type: Literal["post", "reply"] = Field(..., description="Target type: post or reply")
    target_id: str = Field(..., min_length=1, description="Target post or reply identifier")
    reason: str = Field(..., min_length=1, max_length=1000, description="Reason for filing report")
    session_token: Optional[str] = Field(default=None, description="Optional bearer token if not using header")


class ReportResponse(BaseModel):
    """Response payload for a filed report."""

    id: str = Field(..., description="Unique report identifier")
    target_type: str = Field(..., description="Target type: post or reply")
    target_id: str = Field(..., description="Target identifier")
    reason: str = Field(..., description="Report reason")
    status: str = Field(default="pending", description="Report status: pending, resolved, dismissed")
    created_at: str = Field(..., description="ISO 8601 timestamp")


# Moderation Schemas


class ReportActionRequest(BaseModel):
    """Payload for resolving or dismissing a user report."""

    action: Literal["dismiss", "remove", "restore"] = Field(..., description="Moderation action to take")
    note: Optional[str] = Field(default=None, max_length=1000, description="Optional moderator note")


class ReportActionResponse(BaseModel):
    """Response payload after taking action on a report."""

    report_id: str
    action: str
    status: str
    note: Optional[str] = None


class CrisisReviewRequest(BaseModel):
    """Payload for reviewing an item in the crisis queue."""

    action: Literal["approve", "escalate", "dismiss"] = Field(..., description="Review action for crisis item")


class CrisisReviewResponse(BaseModel):
    """Response payload after reviewing a crisis queue item."""

    target_type: str
    target_id: str
    action: str
    status: str


class ModerationReportItem(BaseModel):
    """Report representation including reported content preview."""

    id: str
    target_type: str
    target_id: str
    reason: str
    reporter_id: str
    status: str
    created_at: str
    target_content: Optional[str] = None
    target_status: Optional[str] = None


class CrisisQueueResponse(BaseModel):
    """Representation of the pending crisis moderation queue."""

    posts: List[dict]
    replies: List[dict]
    total_pending: int


# Multi-Tradition Schemas


class TraditionItem(BaseModel):
    """Metadata for a supported scripture and wisdom tradition."""

    id: str = Field(..., description="Unique tradition identifier")
    name: str = Field(..., description="Display name of the tradition")
    translation: str = Field(..., description="Translation edition or translator")
    description: str = Field(..., description="Overview of the tradition's core philosophical focus")



