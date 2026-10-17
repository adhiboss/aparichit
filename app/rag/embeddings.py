"""Embedding generation module for APARICHIT knowledge base."""

from typing import List, Optional
import chromadb.utils.embedding_functions as embedding_functions


class EmbeddingService:
    """Service for generating dense vector embeddings on CPU using ONNX."""

    def __init__(self, model_name: Optional[str] = None) -> None:
        self.model_name = model_name or "all-MiniLM-L6-v2"
        # ChromaDB DefaultEmbeddingFunction runs all-MiniLM-L6-v2 via ONNX on CPU
        self._fn = embedding_functions.DefaultEmbeddingFunction()

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of documents/passages."""
        if not texts:
            return []
        raw = self._fn(texts)
        return [[float(x) for x in vec] for vec in raw]

    def embed_query(self, text: str) -> List[float]:
        """Generate embedding vector for a single query."""
        results = self.embed_texts([text])
        return results[0] if results else []
