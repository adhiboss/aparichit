"""Automated tests for Milestone 5: Session Memory, Query Rewriting, and Streaming (SSE)."""

import json
from starlette.testclient import TestClient
from app.memory import SessionMemory
from app.pipeline.rewrite import QueryRewriter


def test_session_memory_operations() -> None:
    """Verify SessionMemory adds messages, limits window, and clears properly."""
    mem = SessionMemory(max_turns_per_session=4)
    sess_id = "mem_test_unit"

    # Add 6 messages (exceeding window of 4)
    for i in range(1, 7):
        role = "user" if i % 2 == 1 else "assistant"
        mem.add_message(sess_id, role, f"Message {i}")

    details = mem.get_session_details(sess_id)
    assert details["total_messages"] == 4
    # Sliding window kept last 4
    assert details["messages"][0]["content"] == "Message 3"
    assert details["messages"][-1]["content"] == "Message 6"

    # Test clear
    assert mem.clear_session(sess_id) is True
    assert mem.get_session_details(sess_id)["total_messages"] == 0


def test_query_rewriter_pronoun_resolution() -> None:
    """Verify QueryRewriter contextual expansion for pronoun-laden follow-ups."""
    rewriter = QueryRewriter()
    history = [
        {"role": "user", "content": "I betrayed my close friend and broke his trust."},
        {"role": "assistant", "content": "Trust is sacred and breaking it incurs deep moral sorrow."},
    ]

    follow_up = "How do I apologize to him?"
    rewritten = rewriter.rewrite(follow_up, history)

    # Heuristic fallback or LLM includes the previous context keywords
    assert "betrayed" in rewritten.lower() or "friend" in rewritten.lower()


def test_multi_turn_session_api(client: TestClient) -> None:
    """Verify multi-turn session persistence via /chat and /sessions endpoints."""
    sess_id = "api_session_multi_turn"

    # Turn 1
    res1 = client.post("/chat", json={
        "session_id": sess_id,
        "message": "I lost my temper with my brother today.",
        "faith_on": False,
    })
    assert res1.status_code == 200

    # Verify session details has Turn 1 (user + assistant)
    sess_res = client.get(f"/sessions/{sess_id}")
    assert sess_res.status_code == 200
    details = sess_res.json()
    assert details["total_messages"] == 2
    assert details["messages"][0]["role"] == "user"
    assert details["messages"][1]["role"] == "assistant"

    # Turn 2 (Follow up)
    res2 = client.post("/chat", json={
        "session_id": sess_id,
        "message": "What is the best way to make amends with him?",
        "faith_on": False,
    })
    assert res2.status_code == 200

    # Verify session now has 4 messages
    sess_res2 = client.get(f"/sessions/{sess_id}")
    assert sess_res2.json()["total_messages"] == 4

    # Clear session via DELETE
    del_res = client.delete(f"/sessions/{sess_id}")
    assert del_res.status_code == 200
    assert del_res.json()["cleared"] is True

    # Check cleared
    sess_res3 = client.get(f"/sessions/{sess_id}")
    assert sess_res3.json()["total_messages"] == 0


def test_streaming_endpoint_sse(client: TestClient) -> None:
    """Verify POST /chat/stream emits Server-Sent Events with tokens and final metadata."""
    sess_id = "stream_session_1"
    payload = {
        "session_id": sess_id,
        "message": "What does ancient wisdom say about truthfulness?",
        "faith_on": True,
        "tradition": "garuda_purana",
    }

    response = client.post("/chat/stream", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]

    lines = response.text.strip().split("\n\n")
    assert len(lines) >= 2, "Expected multiple SSE events"

    tokens = []
    done_event = None

    for line in lines:
        if line.startswith("data: "):
            data = json.loads(line[6:])
            if "token" in data:
                tokens.append(data["token"])
            if data.get("done") is True:
                done_event = data

    assert len(tokens) > 0, "Expected streamed tokens"
    assert done_event is not None, "Expected final done event"
    assert "mode" in done_event
    assert done_event["mode"] in ("grounded", "inspired", "playful")
    assert "citations" in done_event
    assert "source_labels" in done_event

    # Verify session memory recorded the turn
    history_res = client.get(f"/sessions/{sess_id}")
    assert history_res.status_code == 200
    assert history_res.json()["total_messages"] == 2


def test_streaming_crisis_bypass(client: TestClient) -> None:
    """Verify crisis query in /chat/stream immediately streams helpline and sets crisis flag."""
    payload = {
        "session_id": "stream_crisis_sess",
        "message": "I want to die, please end my life.",
        "faith_on": True,
    }

    response = client.post("/chat/stream", json=payload)
    assert response.status_code == 200

    lines = response.text.strip().split("\n\n")
    final_event = None
    for line in lines:
        if line.startswith("data: "):
            data = json.loads(line[6:])
            if data.get("done") is True:
                final_event = data

    assert final_event is not None
    assert final_event["safety_flag"] == "crisis"
    assert "Tele-MANAS" in response.text or "14416" in response.text
