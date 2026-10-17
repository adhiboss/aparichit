"""RAG (Retrieval-Augmented Generation) package for APARICHIT."""

from app.rag.embeddings import EmbeddingService
from app.rag.ingest import ingest_knowledge_base
from app.rag.retriever import PassageRetriever, RetrievedPassage
from app.rag.store import VectorStore

__all__ = [
    "EmbeddingService",
    "VectorStore",
    "PassageRetriever",
    "RetrievedPassage",
    "ingest_knowledge_base",
]
