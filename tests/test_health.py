"""Tests for /health endpoint."""

from starlette.testclient import TestClient


def test_health_check(client: TestClient) -> None:
    """Verify /health returns status ok and correct metadata."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app_name"] == "APARICHIT"
    assert "version" in data
    assert data["llm_provider"] == "mock"
