"""Tests for Milestone 10: Multi-tradition wisdom collections and faith toggle routing."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.rag.retriever import PassageRetriever

client = TestClient(app)


def test_list_traditions_endpoint() -> None:
    """Verify GET /traditions lists all supported scripture and philosophy traditions."""
    response = client.get("/traditions")
    assert response.status_code == 200
    data = response.json()

    tradition_ids = [t["id"] for t in data]
    assert "garuda_purana" in tradition_ids
    assert "bhagavad_gita" in tradition_ids
    assert "dhammapada" in tradition_ids
    assert "stoicism" in tradition_ids

    # Check structure
    bg = next(t for t in data if t["id"] == "bhagavad_gita")
    assert bg["name"] == "Bhagavad Gita"
    assert "Arnold" in bg["translation"]
    assert len(bg["description"]) > 10


def test_retriever_multi_tradition_collections() -> None:
    """Verify PassageRetriever routes to distinct ChromaDB collections by tradition."""
    retriever = PassageRetriever()

    # 1. Bhagavad Gita retrieval
    bg_passages = retriever.retrieve(
        query="duty action without attachment to fruits of labor",
        top_k=2,
        tradition="bhagavad_gita",
    )
    assert len(bg_passages) >= 1
    assert any(p.source == "Bhagavad Gita" for p in bg_passages)
    assert any("2" in p.chapter or "3" in p.chapter for p in bg_passages)

    # 2. Dhammapada retrieval
    dp_passages = retriever.retrieve(
        query="hatred ceases by love not by hatred",
        top_k=2,
        tradition="dhammapada",
    )
    assert len(dp_passages) >= 1
    assert any(p.source == "Dhammapada" for p in dp_passages)
    assert any("Chapter 1" in p.chapter for p in dp_passages)

    # 3. Stoicism retrieval
    stoic_passages = retriever.retrieve(
        query="external things cannot disturb you but your own judgment",
        top_k=2,
        tradition="stoicism",
    )
    assert len(stoic_passages) >= 1
    assert any(p.source == "Meditations" for p in stoic_passages)


def test_chat_with_bhagavad_gita_tradition() -> None:
    """Verify /chat returns verified Bhagavad Gita citations when tradition='bhagavad_gita'."""
    response = client.post(
        "/chat",
        json={
            "session_id": "test_bg_chat",
            "message": "I feel anxious about the fruits of my actions and performing my duty.",
            "faith_on": True,
            "tradition": "bhagavad_gita",
        },
    )
    assert response.status_code == 200
    data = response.json()

    assert data["mode"] == "grounded"
    assert len(data["citations"]) >= 1
    citation = data["citations"][0]
    assert citation["source"] == "Bhagavad Gita"
    assert "Arnold" in citation["translation"]
    assert "scripture" in data["source_labels"]


def test_chat_with_dhammapada_tradition() -> None:
    """Verify /chat returns verified Dhammapada citations when tradition='dhammapada'."""
    response = client.post(
        "/chat",
        json={
            "session_id": "test_dp_chat",
            "message": "How do I deal with someone I deeply hate and resent for their actions?",
            "faith_on": True,
            "tradition": "dhammapada",
        },
    )
    assert response.status_code == 200
    data = response.json()

    assert data["mode"] == "grounded"
    assert len(data["citations"]) >= 1
    citation = data["citations"][0]
    assert citation["source"] == "Dhammapada"
    assert "Müller" in citation["translation"] or "Muller" in citation["translation"]


def test_chat_with_stoicism_tradition() -> None:
    """Verify /chat returns verified Meditations citations when tradition='stoicism'."""
    response = client.post(
        "/chat",
        json={
            "session_id": "test_stoic_chat",
            "message": "People around me are rude, ungrateful, and meddling in my business.",
            "faith_on": True,
            "tradition": "stoicism",
        },
    )
    assert response.status_code == 200
    data = response.json()

    assert data["mode"] == "grounded"
    assert len(data["citations"]) >= 1
    citation = data["citations"][0]
    assert citation["source"] == "Meditations"
    assert "Long" in citation["translation"]


def test_faith_toggle_disabled_never_cites_any_tradition() -> None:
    """Verify that when faith_on is False, scripture citations are strictly omitted regardless of tradition."""
    response = client.post(
        "/chat",
        json={
            "session_id": "test_faith_off_bg",
            "message": "I am struggling with anxiety about the results of my hard work.",
            "faith_on": False,
            "tradition": "bhagavad_gita",
        },
    )
    assert response.status_code == 200
    data = response.json()

    assert data["citations"] == []
    assert data["mode"] == "inspired"
    assert "scripture" not in data["source_labels"]
