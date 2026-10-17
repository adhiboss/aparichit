"""Vector database storage manager using ChromaDB."""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import chromadb
from chromadb.api.models.Collection import Collection
from app.rag.embeddings import EmbeddingService


class VectorStore:
    """Persistent vector store for passages and community embeddings using ChromaDB."""

    def __init__(
        self,
        db_path: str = "./data/chroma",
        collection_name: str = "garuda_purana",
        embedding_service: Optional[EmbeddingService] = None,
    ) -> None:
        self.db_path = str(Path(db_path).resolve())
        os.makedirs(self.db_path, exist_ok=True)
        self.embedding_service = embedding_service or EmbeddingService()
        self.client = chromadb.PersistentClient(path=self.db_path)
        self.collection_name = collection_name
        self.collection: Collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    def add_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """Add chunks to the collection with embeddings and metadata.

        Args:
            chunks: List of chunk dictionaries with 'id', 'text', and metadata fields.

        Returns:
            Number of chunks added.
        """
        if not chunks:
            return 0

        ids = [chunk["id"] for chunk in chunks]
        texts = [chunk["text"] for chunk in chunks]
        
        # Flatten complex metadata (e.g. lists into comma-separated strings for Chroma)
        metadatas = []
        for c in chunks:
            meta = {
                "source": str(c.get("source", "Garuda Purana")),
                "translation": str(c.get("translation", "Wood & Subrahmanyam 1911")),
                "section": str(c.get("section", "Preta Kanda / Saroddhara")),
                "chapter": str(c.get("chapter", "")),
                "chapter_title": str(c.get("chapter_title", "")),
                "verse": str(c.get("verse", "")),
                "topics": ",".join(c.get("topics", [])) if isinstance(c.get("topics"), list) else str(c.get("topics", "")),
                "language": str(c.get("language", "en")),
            }
            metadatas.append(meta)

        embeddings = self.embedding_service.embed_texts(texts)

        # Chroma upsert ensures idempotency
        self.collection.upsert(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        return len(chunks)

    def query(
        self,
        query_text: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Query the vector store for semantic matches.

        Args:
            query_text: Text query to search for.
            n_results: Maximum number of results to retrieve.
            where: Optional metadata filter.

        Returns:
            List of matching results with id, document, metadata, and similarity score.
        """
        if not query_text.strip() or self.count() == 0:
            return []

        query_embedding = self.embedding_service.embed_query(query_text)

        kwargs: Dict[str, Any] = {
            "query_embeddings": [query_embedding],
            "n_results": min(n_results, max(1, self.count())),
            "include": ["documents", "metadatas", "distances"],
        }
        if where:
            kwargs["where"] = where

        results = self.collection.query(**kwargs)

        output: List[Dict[str, Any]] = []
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]
        ids = results.get("ids", [[]])[0]

        for doc_id, doc, meta, dist in zip(ids, docs, metas, distances):
            # Cosine distance in Chroma: dist in [0, 2], similarity = 1 - dist
            similarity = max(0.0, min(1.0, 1.0 - float(dist)))
            
            # Reconstruct topics as list
            topics_str = meta.get("topics", "") if meta else ""
            topics = [t.strip() for t in topics_str.split(",") if t.strip()]

            output.append({
                "id": doc_id,
                "text": doc,
                "metadata": meta,
                "topics": topics,
                "similarity": similarity,
                "distance": float(dist),
            })

        # Sort by similarity descending
        output.sort(key=lambda x: x["similarity"], reverse=True)
        return output

    def count(self) -> int:
        """Return total number of items in the collection."""
        return self.collection.count()

    def clear(self) -> None:
        """Clear all entries in the collection."""
        self.client.delete_collection(self.collection_name)
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"},
        )
