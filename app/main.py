"""FastAPI application entry point for APARICHIT backend service."""

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.config import Settings, get_settings
from app.llm import get_llm_provider
from app.llm.base import LLMProvider
from app.pipeline.advise import AdvicePipeline
from app.rag.retriever import PassageRetriever
from app.schemas import ChatRequest, ChatResponse, HealthResponse

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
