"""Tests for /chat endpoint, RAG retrieval, mode selection, and citations."""

from starlette.testclient import TestClient


def test_chat_basic_success(client: TestClient) -> None:
    """Verify /chat returns structured answer adhering to API schema when faith_on=False."""
    payload = {
        "session_id": "test_session_123",
        "message": "I feel immense guilt because I hid my exam failure from my parents.",
        "faith_on": False,
        "tradition": "garuda_purana",
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "answer" in data
    assert isinstance(data["answer"], str)
    assert len(data["answer"]) > 0

    # When faith_on is False, mode must be inspired (practical advice)
    assert data["mode"] == "inspired"

    # Hard rule: citations must strictly be empty when faith_on is False
    assert data["citations"] == []

    # Source labels must contain ai_suggestion
    assert data["source_labels"] == ["ai_suggestion"]

    # Similar list empty for Milestone 3
    assert data["similar"] == []
    assert data["safety_flag"] is None


def test_chat_playful_query(client: TestClient) -> None:
    """Verify casual/joke queries trigger playful mode with empty citations."""
    payload = {
        "session_id": "test_session_456",
        "message": "Can you tell me a funny joke about pizza?",
        "faith_on": True,
        "tradition": "garuda_purana",
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "playful"
    assert data["citations"] == []


def test_chat_grounded_mode_with_faith_on(client: TestClient) -> None:
    """Verify faith_on=True with strong passage match returns grounded mode with structured citations."""
    payload = {
        "session_id": "test_session_789",
        "message": "What does the text say about betrayal of a friend and breaking trust?",
        "faith_on": True,
        "tradition": "garuda_purana",
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["mode"] == "grounded"
    assert len(data["citations"]) > 0

    first_citation = data["citations"][0]
    assert first_citation["source"] == "Garuda Purana"
    assert first_citation["translation"] == "Wood & Subrahmanyam 1911"
    assert "chapter" in first_citation and len(first_citation["chapter"]) > 0
    assert "verse" in first_citation and len(first_citation["verse"]) > 0
    assert "excerpt" in first_citation and len(first_citation["excerpt"]) > 0

    # Source labels must include scripture and ai_suggestion
    assert "scripture" in data["source_labels"]
    assert "ai_suggestion" in data["source_labels"]


def test_chat_inspired_mode_when_no_passages_meet_threshold(client: TestClient) -> None:
    """Verify faith_on=True with an unrelated query returns inspired mode without citations."""
    payload = {
        "session_id": "test_session_101",
        "message": "I am deeply conflicted about whether to purchase a laptop with an OLED or LCD screen.",
        "faith_on": True,
        "tradition": "garuda_purana",
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["mode"] == "inspired"
    assert data["citations"] == []
    assert data["source_labels"] == ["ai_suggestion"]


def test_chat_faith_toggle_disabled_never_cites_scripture(client: TestClient) -> None:
    """Verify that when faith_on=False, scripture is never cited even if query mentions scripture themes."""
    payload = {
        "session_id": "test_session_102",
        "message": "I betrayed my friend and broke their trust.",
        "faith_on": False,
        "tradition": "garuda_purana",
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["mode"] == "inspired"
    assert data["citations"] == []
    assert data["source_labels"] == ["ai_suggestion"]


def test_chat_missing_required_fields(client: TestClient) -> None:
    """Verify missing fields yield validation error."""
    # Missing session_id
    response = client.post("/chat", json={"message": "Hello"})
    assert response.status_code == 422

    # Empty message
    response = client.post("/chat", json={"session_id": "123", "message": ""})
    assert response.status_code == 422
