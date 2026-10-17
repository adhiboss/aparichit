"""Automated tests for Milestone 2: Knowledge Base and Vector Retrieval."""

import json
from pathlib import Path
import pytest
from app.config import get_settings
from app.rag.embeddings import EmbeddingService
from app.rag.ingest import CHUNKS_FILE, RAW_DATA_PATH
from app.rag.retriever import PassageRetriever
from app.rag.store import VectorStore


def test_raw_dataset_exists_and_valid():
    """Verify raw dataset exists and adheres to schema."""
    assert RAW_DATA_PATH.exists(), f"Raw dataset missing at {RAW_DATA_PATH}"
    with open(RAW_DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert isinstance(data, list)
    assert len(data) >= 5, "Expected at least 5 chapters in raw dataset"

    for chapter in data:
        assert "chapter" in chapter
        assert "chapter_title" in chapter
        assert "section" in chapter
        assert "verses" in chapter
        for v in chapter["verses"]:
            assert "verse" in v
            assert "text" in v
            assert len(v["text"]) > 10
            assert "topics" in v
            assert isinstance(v["topics"], list)


def test_chunks_jsonl_created_and_valid():
    """Verify chunks JSONL exists and contains required metadata fields."""
    assert CHUNKS_FILE.exists(), f"Chunks file missing at {CHUNKS_FILE}"

    chunks = []
    with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                chunks.append(json.loads(line))

    assert len(chunks) >= 20, "Expected at least 20 chunk records"

    required_fields = [
        "id", "source", "translation", "section", "chapter",
        "verse", "text", "topics", "language",
    ]

    for c in chunks:
        for field in required_fields:
            assert field in c, f"Missing field '{field}' in chunk {c.get('id')}"
        assert c["source"] == "Garuda Purana"
        assert c["translation"] == "Wood & Subrahmanyam 1911"
        assert c["language"] == "en"


def test_embedding_service_dimensions_and_types():
    """Verify EmbeddingService produces correct vector shapes and native floats."""
    service = EmbeddingService()
    test_texts = ["Truthfulness upholds dharma", "Anger destroys wisdom"]
    embeddings = service.embed_texts(test_texts)

    assert len(embeddings) == 2
    assert len(embeddings[0]) == 384
    assert len(embeddings[1]) == 384
    # Ensure native Python float, not numpy types that cause Chroma validation failures
    assert isinstance(embeddings[0][0], float)

    query_vec = service.embed_query("charity and kindness")
    assert len(query_vec) == 384
    assert isinstance(query_vec[0], float)


def test_vector_store_retrieval_and_similarity():
    """Verify VectorStore queries return valid similarity scores."""
    settings = get_settings()
    store = VectorStore(
        db_path=settings.VECTOR_DB_PATH,
        collection_name="garuda_purana",
    )

    assert store.count() >= 20

    results = store.query("charity and giving food to the hungry", n_results=3)
    assert len(results) > 0

    top = results[0]
    assert "id" in top
    assert "similarity" in top
    assert 0.0 <= top["similarity"] <= 1.0
    assert "charity" in top["topics"] or "food" in top["topics"] or "dana" in top["topics"]


def test_passage_retriever_threshold_filtering():
    """Verify PassageRetriever respects threshold and converts to Citation."""
    retriever = PassageRetriever()

    # Query with semantic keywords
    passages = retriever.retrieve("overcoming anger and wrath", top_k=2, min_similarity=0.30)
    assert len(passages) >= 1

    top = passages[0]
    assert top.similarity >= 0.30
    assert "anger" in top.topics or "speech" in top.topics or "discernment" in top.topics

    citation = top.to_citation()
    assert citation.source == "Garuda Purana"
    assert citation.translation == "Wood & Subrahmanyam 1911"
    assert citation.chapter
    assert citation.excerpt == top.text
