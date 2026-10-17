"""FastAPI application entry point for APARICHIT backend service (reloaded)."""

from typing import Any, Dict, List, Optional
from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.auth.anon_accounts import AnonymousAccount, AuthManager, get_auth_manager
from app.community.matcher import SimilarProblemMatcher, get_similar_matcher
from app.community.moderation import ModerationManager, get_moderation_manager
from app.community.posts import PostManager, get_post_manager
from app.config import Settings, get_settings
from app.llm import get_llm_provider
from app.llm.base import LLMProvider
from app.memory import SessionMemory, get_session_memory
from app.pipeline.advise import AdvicePipeline
from app.rag.retriever import PassageRetriever
from app.schemas import (
    AnonymousAuthResponse,
    ChatRequest,
    ChatResponse,
    CreatePostRequest,
    CreateReplyRequest,
    CreateReportRequest,
    CrisisQueueResponse,
    CrisisReviewRequest,
    CrisisReviewResponse,
    HealthResponse,
    ModerationReportItem,
    PostReplyResponse,
    PostResponse,
    ReportActionRequest,
    ReportActionResponse,
    ReportResponse,
    SimilarProblem,
    TraditionItem,
)




app = FastAPI(
    title="APARICHIT Backend API",
    description="AI-powered advice platform inspired by the Garuda Purana",
    version="0.1.0",
)

# Configure CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_pipeline(
    current_settings: Settings = Depends(get_settings),
) -> AdvicePipeline:
    """Dependency injector for AdvicePipeline with configured LLM provider and retriever."""
    provider: LLMProvider = get_llm_provider(current_settings)
    retriever: PassageRetriever = PassageRetriever(settings=current_settings)
    return AdvicePipeline(
        provider=provider,
        retriever=retriever,
        settings=current_settings,
    )


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    tags=["System"],
)
def health_check(current_settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Check service health and active configuration."""
    return HealthResponse(
        status="ok",
        app_name=current_settings.APP_NAME,
        version=current_settings.APP_VERSION,
        llm_provider=current_settings.LLM_PROVIDER,
    )


@app.get(
    "/traditions",
    response_model=List[TraditionItem],
    summary="List supported scripture and wisdom traditions",
    tags=["System"],
)
def list_traditions() -> List[TraditionItem]:
    """Return all available wisdom traditions supported under the faith toggle."""
    from app.rag.ingest import TRADITIONS

    return [
        TraditionItem(
            id=key,
            name=val["name"],
            translation=val["translation"],
            description=val["description"],
        )
        for key, val in TRADITIONS.items()
    ]



@app.post(
    "/chat",
    response_model=ChatResponse,
    summary="Generate advice response",
    tags=["Chat"],
)
def chat_endpoint(
    request: ChatRequest,
    pipeline: AdvicePipeline = Depends(get_pipeline),
) -> ChatResponse:
    """Generate advice for a user query through the APARICHIT persona pipeline."""
    try:
        return pipeline.generate_advice(request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Downstream LLM service failure: {e}",
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the advice request.",
        ) from e


@app.post(
    "/chat/stream",
    summary="Generate streaming advice response (SSE)",
    tags=["Chat"],
)
def chat_stream_endpoint(
    request: ChatRequest,
    pipeline: AdvicePipeline = Depends(get_pipeline),
) -> StreamingResponse:
    """Generate advice streamed as Server-Sent Events (SSE)."""
    try:
        return StreamingResponse(
            pipeline.generate_advice_stream(request),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Streaming error: {e}",
        ) from e


@app.get(
    "/sessions/{session_id}",
    summary="Get session chat history",
    tags=["Sessions"],
)
def get_session(
    session_id: str,
    memory: SessionMemory = Depends(get_session_memory),
) -> Dict[str, Any]:
    """Retrieve conversation history for a specific session."""
    return memory.get_session_details(session_id)


@app.delete(
    "/sessions/{session_id}",
    summary="Clear session chat history",
    tags=["Sessions"],
)
def clear_session(
    session_id: str,
    memory: SessionMemory = Depends(get_session_memory),
) -> Dict[str, Any]:
    """Clear all stored messages for a specific session."""
    cleared = memory.clear_session(session_id)
    return {"session_id": session_id, "cleared": cleared}


# Community and Anonymous Authentication Endpoints


def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    x_session_token: Optional[str] = Header(None),
    auth_manager: AuthManager = Depends(get_auth_manager),
) -> Optional[AnonymousAccount]:
    """Extract account from Bearer Authorization or X-Session-Token header."""
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    elif x_session_token:
        token = x_session_token.strip()

    if not token:
        return None
    return auth_manager.get_account_by_token(token)


@app.post(
    "/auth/anonymous",
    response_model=AnonymousAuthResponse,
    summary="Create anonymous account",
    tags=["Community"],
)
def create_anonymous_account(
    auth_manager: AuthManager = Depends(get_auth_manager),
) -> AnonymousAuthResponse:
    """Generate a poetic anonymous name and session token without requiring emails or passwords."""
    account = auth_manager.create_anonymous_account()
    return AnonymousAuthResponse(
        user_id=account.user_id,
        display_name=account.display_name,
        session_token=account.session_token,
        created_at=account.created_at,
    )


@app.post(
    "/posts",
    response_model=PostResponse,
    summary="Create a community post",
    tags=["Community"],
)
def create_post(
    request: CreatePostRequest,
    current_user: Optional[AnonymousAccount] = Depends(get_current_user_optional),
    auth_manager: AuthManager = Depends(get_auth_manager),
    post_manager: PostManager = Depends(get_post_manager),
) -> PostResponse:
    """Share an anonymised dilemma or problem to the community."""
    account = current_user
    if not account and request.session_token:
        account = auth_manager.get_account_by_token(request.session_token.strip())

    if not account:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide a valid session token via Bearer header or session_token field.",
        )

    try:
        post_data = post_manager.create_post(
            user_id=account.user_id,
            content=request.content,
        )
        return PostResponse(**post_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Post creation error: {type(e).__name__}: {str(e)}") from e


@app.get(
    "/posts",
    response_model=List[PostResponse],
    summary="List community posts",
    tags=["Community"],
)
def list_posts(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    post_manager: PostManager = Depends(get_post_manager),
) -> List[PostResponse]:
    """Retrieve public feed of published, non-crisis community posts."""
    posts = post_manager.list_public_posts(limit=limit, offset=offset)
    return [PostResponse(**p) for p in posts]


@app.get(
    "/posts/{post_id}",
    response_model=PostResponse,
    summary="Get community post with replies",
    tags=["Community"],
)
def get_post(
    post_id: str,
    post_manager: PostManager = Depends(get_post_manager),
) -> PostResponse:
    """Retrieve an anonymised community post and its replies."""
    post = post_manager.get_post(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post '{post_id}' not found",
        )
    return PostResponse(**post)


@app.post(
    "/posts/{post_id}/replies",
    response_model=PostReplyResponse,
    summary="Add reply to a community post",
    tags=["Community"],
)
def add_reply(
    post_id: str,
    request: CreateReplyRequest,
    current_user: Optional[AnonymousAccount] = Depends(get_current_user_optional),
    auth_manager: AuthManager = Depends(get_auth_manager),
    post_manager: PostManager = Depends(get_post_manager),
) -> PostReplyResponse:
    """Add a supportive reply to a community post."""
    account = current_user
    if not account and request.session_token:
        account = auth_manager.get_account_by_token(request.session_token.strip())

    if not account:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide a valid session token via Bearer header or session_token field.",
        )

    try:
        reply_data = post_manager.add_reply(
            post_id=post_id,
            user_id=account.user_id,
            content=request.content,
        )
        return PostReplyResponse(**reply_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@app.post(
    "/reports",
    response_model=ReportResponse,
    summary="Report a post or reply",
    tags=["Community"],
)
def create_report(
    request: CreateReportRequest,
    current_user: Optional[AnonymousAccount] = Depends(get_current_user_optional),
    auth_manager: AuthManager = Depends(get_auth_manager),
    post_manager: PostManager = Depends(get_post_manager),
) -> ReportResponse:
    """Flag abusive or harmful community content for moderator review."""
    account = current_user
    if not account and request.session_token:
        account = auth_manager.get_account_by_token(request.session_token.strip())

    reporter_id = account.user_id if account else "anon_guest"

    try:
        report_data = post_manager.create_report(
            target_type=request.target_type,
            target_id=request.target_id,
            reason=request.reason,
            reporter_id=reporter_id,
        )
        return ReportResponse(**report_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@app.get(
    "/similar",
    response_model=List[SimilarProblem],
    summary="Find similar community problems",
    tags=["Community"],
)
def get_similar_problems(
    post_id: Optional[str] = Query(default=None, description="Target post ID to find matches for"),
    query: Optional[str] = Query(default=None, description="Query text to find matches for"),
    limit: int = Query(default=3, ge=1, le=10, description="Max matches to return"),
    threshold: Optional[float] = Query(default=None, ge=0.0, le=1.0, description="Minimum cosine similarity threshold"),
    post_manager: PostManager = Depends(get_post_manager),
    matcher: SimilarProblemMatcher = Depends(get_similar_matcher),
) -> List[SimilarProblem]:
    """Search for semantically similar community posts."""
    search_text = ""
    exclude_id = None

    if post_id:
        post = post_manager.get_post(post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Post '{post_id}' not found",
            )
        search_text = post["content"]
        exclude_id = post_id
    elif query:
        search_text = query.strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'post_id' or 'query' parameter must be provided.",
        )

    return matcher.find_similar(
        query_text=search_text,
        top_k=limit,
        threshold=threshold,
        exclude_post_id=exclude_id,
    )


# Moderation & Admin Security and Endpoints


def verify_admin_access(
    x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token"),
    authorization: Optional[str] = Header(None),
    settings: Settings = Depends(get_settings),
) -> None:
    """Validate administrator credentials for moderation endpoints."""
    token = None
    if x_admin_token:
        token = x_admin_token.strip()
    elif authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()

    if not token or token != settings.ADMIN_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access denied. Invalid or missing administrator credentials.",
        )


@app.get(
    "/admin/reports",
    response_model=List[ModerationReportItem],
    summary="List moderation reports",
    tags=["Moderation"],
)
def list_reports(
    status_filter: Optional[str] = Query(default="pending", alias="status", description="Filter by report status"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    moderator: ModerationManager = Depends(get_moderation_manager),
    _: None = Depends(verify_admin_access),
) -> List[ModerationReportItem]:
    """List filed user reports with attached content preview."""
    reports = moderator.list_reports(status=status_filter, limit=limit, offset=offset)
    return [ModerationReportItem(**r) for r in reports]


@app.get(
    "/admin/reports/{report_id}",
    response_model=ModerationReportItem,
    summary="Get report details",
    tags=["Moderation"],
)
def get_report(
    report_id: str,
    moderator: ModerationManager = Depends(get_moderation_manager),
    _: None = Depends(verify_admin_access),
) -> ModerationReportItem:
    """Retrieve details for a single moderation report."""
    report = moderator.get_report(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found",
        )
    return ModerationReportItem(**report)


@app.post(
    "/admin/reports/{report_id}/action",
    response_model=ReportActionResponse,
    summary="Take action on report",
    tags=["Moderation"],
)
def resolve_report(
    report_id: str,
    request: ReportActionRequest,
    moderator: ModerationManager = Depends(get_moderation_manager),
    _: None = Depends(verify_admin_access),
) -> ReportActionResponse:
    """Apply resolution action (remove, dismiss, or restore) to reported content."""
    try:
        result = moderator.resolve_report(
            report_id=report_id,
            action=request.action,
            note=request.note,
        )
        return ReportActionResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@app.get(
    "/admin/crisis",
    response_model=CrisisQueueResponse,
    summary="List crisis moderation queue",
    tags=["Moderation"],
)
def list_crisis_queue(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    moderator: ModerationManager = Depends(get_moderation_manager),
    _: None = Depends(verify_admin_access),
) -> CrisisQueueResponse:
    """View posts and replies pending review in the crisis safety queue."""
    queue = moderator.list_crisis_queue(limit=limit, offset=offset)
    return CrisisQueueResponse(**queue)


@app.post(
    "/admin/crisis/{target_type}/{target_id}/action",
    response_model=CrisisReviewResponse,
    summary="Review crisis queue item",
    tags=["Moderation"],
)
def review_crisis_item(
    target_type: str,
    target_id: str,
    request: CrisisReviewRequest,
    moderator: ModerationManager = Depends(get_moderation_manager),
    _: None = Depends(verify_admin_access),
) -> CrisisReviewResponse:
    """Approve (publish), escalate, or dismiss a crisis-flagged item."""
    try:
        result = moderator.review_crisis_item(
            target_type=target_type,
            target_id=target_id,
            action=request.action,
        )
        return CrisisReviewResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e



