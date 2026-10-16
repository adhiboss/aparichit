"""Tests for /chat endpoint and request validation."""

from starlette.testclient import TestClient


def test_chat_basic_success(client: TestClient) -> None:
    """Verify /chat returns structured answer adhering to API schema."""
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

    # In Milestone 1, no passages exist, so mode is 'inspired'
    assert data["mode"] in ("grounded", "inspired", "playful")
    assert data["mode"] == "inspired"

    # Hard rule: citations must strictly be empty when no passages retrieved
    assert data["citations"] == []

    # Source labels must contain ai_suggestion
    assert "ai_suggestion" in data["source_labels"]

    # Similar list empty for Milestone 1
    assert data["similar"] == []
    assert data["safety_flag"] is None


def test_chat_playful_query(client: TestClient) -> None:
    """Verify casual/joke queries trigger playful mode."""
    payload = {
        "session_id": "test_session_456",
        "message": "Can you tell me a funny joke about pizza?",
        "faith_on": False,
        "tradition": "garuda_purana",
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "playful"
    assert data["citations"] == []


def test_chat_faith_toggle_enabled(client: TestClient) -> None:
    """Verify faith_on=True returns a valid response."""
    payload = {
        "session_id": "test_session_789",
        "message": "What is the consequence of deceiving someone who trusted you?",
        "faith_on": True,
        "tradition": "garuda_purana",
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] in ("inspired", "playful")
    assert data["citations"] == []


def test_chat_missing_required_fields(client: TestClient) -> None:
    """Verify missing fields yield validation error."""
    # Missing session_id
    response = client.post("/chat", json={"message": "Hello"})
    assert response.status_code == 422

    # Empty message
    response = client.post("/chat", json={"session_id": "123", "message": ""})
    assert response.status_code == 422
