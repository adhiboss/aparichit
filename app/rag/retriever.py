"""Passage retriever for querying verified scripture passages."""

from dataclasses import dataclass
from typing import List, Optional
from app.config import Settings, get_settings
from app.rag.store import VectorStore
from app.schemas import Citation


@dataclass
class RetrievedPassage:
    """Structured representation of a retrieved scripture passage."""

    id: str
    source: str
    translation: str
    section: str
    chapter: str
    verse: str
    text: str
    topics: List[str]
    similarity: float

    def to_citation(self) -> Citation:
        """Convert passage to API Citation model."""
        return Citation(
            source=self.source,
            translation=self.translation,
            chapter=self.chapter,
            verse=self.verse if self.verse else None,
            excerpt=self.text,
        )


class PassageRetriever:
    """Retriever for querying and filtering relevant scripture passages."""

    def __init__(
        self,
        store: Optional[VectorStore] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.store = store or VectorStore(
            db_path=self.settings.VECTOR_DB_PATH,
            collection_name="garuda_purana",
        )
        self.retrieval_threshold = self.settings.RETRIEVAL_THRESHOLD

    def retrieve(
        self,
        query: str,
        top_k: int = 3,
        min_similarity: Optional[float] = None,
    ) -> List[RetrievedPassage]:
        """Retrieve relevant passages for a query above the similarity threshold.

        Args:
            query: The user or rewritten search query.
            top_k: Max passages to return.
            min_similarity: Override minimum cosine similarity threshold.

        Returns:
            List of RetrievedPassage objects meeting the threshold.
        """
        threshold = self.retrieval_threshold if min_similarity is None else min_similarity
        raw_results = self.store.query(query_text=query, n_results=top_k)

        passages: List[RetrievedPassage] = []
        for res in raw_results:
            sim = res.get("similarity", 0.0)
            if sim < threshold:
                continue

            meta = res.get("metadata", {})
            passage = RetrievedPassage(
                id=res["id"],
                source=meta.get("source", "Garuda Purana"),
                translation=meta.get("translation", "Wood & Subrahmanyam 1911"),
                section=meta.get("section", "Preta Kanda / Saroddhara"),
                chapter=meta.get("chapter", ""),
                verse=meta.get("verse", ""),
                text=res.get("text", ""),
                topics=res.get("topics", []),
                similarity=sim,
            )
            passages.append(passage)

        return passages
