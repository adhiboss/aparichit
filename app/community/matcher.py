"""Vector similarity matching for community problems using ChromaDB."""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import chromadb
from chromadb.api.models.Collection import Collection
from app.config import Settings, get_settings
from app.rag.embeddings import EmbeddingService
from app.schemas import SimilarProblem


def make_snippet(text: str, max_length: int = 150) -> str:
    """Create a clean snippet preview without cutting off mid-word."""
    cleaned = " ".join(text.strip().split())
    if len(cleaned) <= max_length:
        return cleaned
    truncated = cleaned[:max_length].rsplit(" ", 1)[0]
    return f"{truncated}..."


class SimilarProblemMatcher:
    """Indexes anonymised shared community posts and retrieves nearest-neighbor matches."""

    def __init__(
        self,
        settings: Optional[Settings] = None,
        embedding_service: Optional[EmbeddingService] = None,
        collection_name: str = "community_posts",
    ) -> None:
        self.settings = settings or get_settings()
        self.embedding_service = embedding_service or EmbeddingService()
        self.db_path = str(Path(self.settings.VECTOR_DB_PATH).resolve())
        os.makedirs(self.db_path, exist_ok=True)

        self.client = chromadb.PersistentClient(path=self.db_path)
        self.collection_name = collection_name
        self.collection: Collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    def index_post(
        self,
        post_id: str,
        content: str,
        display_name: str,
        reply_count: int = 0,
    ) -> None:
        """Embed and upsert an anonymised community post into the vector index."""
        clean_text = content.strip()
        if not clean_text:
            return

        embedding = self.embedding_service.embed_texts([clean_text])[0]
        metadata = {
            "display_name": display_name,
            "reply_count": int(reply_count),
        }

        self.collection.upsert(
            ids=[post_id],
            documents=[clean_text],
            embeddings=[embedding],
            metadatas=[metadata],
        )

    def update_reply_count(self, post_id: str, reply_count: int) -> None:
        """Update the reply counter in vector metadata for a post."""
        try:
            existing = self.collection.get(ids=[post_id], include=["metadatas"])
            if existing and existing.get("metadatas") and len(existing["metadatas"]) > 0:
                meta = dict(existing["metadatas"][0])
                meta["reply_count"] = int(reply_count)
                self.collection.update(ids=[post_id], metadatas=[meta])
        except Exception:
            # Non-blocking if post not indexed (e.g. crisis post)
            pass

    def remove_post(self, post_id: str) -> None:
        """Remove a post from the similarity index (e.g. if reported or flagged)."""
        try:
            self.collection.delete(ids=[post_id])
        except Exception:
            pass

    def find_similar(
        self,
        query_text: str,
        top_k: int = 3,
        threshold: Optional[float] = None,
        exclude_post_id: Optional[str] = None,
    ) -> List[SimilarProblem]:
        """Search for semantically similar community posts above the similarity threshold."""
        clean_query = query_text.strip()
        if not clean_query or self.count() == 0:
            return []

        min_sim = threshold if threshold is not None else self.settings.SIMILARITY_THRESHOLD
        query_embedding = self.embedding_service.embed_query(clean_query)

        # Retrieve a broader pool in case of exclusions or score filtering
        n_query = min(max(top_k * 5, 20), self.count())
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_query,
            include=["documents", "metadatas", "distances"],
        )


        matches: List[SimilarProblem] = []
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]
        ids = results.get("ids", [[]])[0]

        for doc_id, doc, meta, dist in zip(ids, docs, metas, distances):
            if exclude_post_id and doc_id == exclude_post_id:
                continue

            similarity = max(0.0, min(1.0, 1.0 - float(dist)))
            if similarity >= min_sim:
                display_name = str(meta.get("display_name", "Anonymous"))
                reply_count = int(meta.get("reply_count", 0))
                matches.append(
                    SimilarProblem(
                        post_id=doc_id,
                        display_name=display_name,
                        snippet=make_snippet(doc),
                        reply_count=reply_count,
                        similarity=round(similarity, 3),
                    )
                )

            if len(matches) >= top_k:
                break

        return matches

    def count(self) -> int:
        """Return number of indexed community posts."""
        return self.collection.count()

    def clear(self) -> None:
        """Clear all entries in the collection."""
        self.client.delete_collection(self.collection_name)
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"},
        )


_GLOBAL_MATCHER: Optional[SimilarProblemMatcher] = None


def get_similar_matcher() -> SimilarProblemMatcher:
    """Return singleton instance of SimilarProblemMatcher."""
    global _GLOBAL_MATCHER
    if _GLOBAL_MATCHER is None:
        _GLOBAL_MATCHER = SimilarProblemMatcher()
    return _GLOBAL_MATCHER
