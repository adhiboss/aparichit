"""Tests for Milestone 8: Similar-problem matching with ChromaDB vector search."""

import json
from fastapi.testclient import TestClient
import pytest
from app.community.matcher import SimilarProblemMatcher, get_similar_matcher
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_community_posts():
    """Isolate tests with a fresh community posts vector collection."""
    matcher = get_similar_matcher()
    matcher.clear()
    yield
    matcher.clear()


def test_similar_matcher_direct_indexing_and_query() -> None:
    """Verify that SimilarProblemMatcher embeds, indexes, and filters by similarity threshold."""
    matcher = get_similar_matcher()


    matcher.index_post(
        post_id="test_p1",
        content="I feel deep guilt because I lied to my parents about failing my college exams.",
        display_name="Gentle River",
        reply_count=2,
    )
    matcher.index_post(
        post_id="test_p2",
        content="Best recipe for baking chocolate fudge cookies at home with butter and sugar.",
        display_name="Silent Peak",
        reply_count=0,
    )

    # 1. Query for similar moral problem
    query = "I feel deep guilt because I lied to my parents about failing exams."
    matches = matcher.find_similar(query, top_k=3, threshold=0.75)

    assert len(matches) >= 1
    match_ids = [m.post_id for m in matches]
    assert "test_p1" in match_ids
    assert "test_p2" not in match_ids

    p1_match = next(m for m in matches if m.post_id == "test_p1")
    assert p1_match.display_name == "Gentle River"
    assert p1_match.reply_count == 2
    assert p1_match.similarity >= 0.75
    assert "guilt" in p1_match.snippet.lower() or "parents" in p1_match.snippet.lower()

    # Clean up test posts
    matcher.remove_post("test_p1")
    matcher.remove_post("test_p2")


def test_post_creation_indexes_in_vector_db_and_increments_reply_count() -> None:
    """Verify that creating a post indexes it, and adding a reply updates the reply counter in vector metadata."""
    # 1. Create author and post
    author = client.post("/auth/anonymous").json()
    post_content = "I broke a sacred promise to my friend and now our friendship is ruined."
    post_resp = client.post(
        "/posts",
        json={"content": post_content},
        headers={"Authorization": f"Bearer {author['session_token']}"},
    )
    assert post_resp.status_code == 200
    post_id = post_resp.json()["id"]

    # 2. Query /similar by text
    sim_resp = client.get("/similar", params={"query": "I broke a promise to my friend and ruined our friendship."})
    assert sim_resp.status_code == 200
    similar_posts = sim_resp.json()
    assert any(p["post_id"] == post_id for p in similar_posts)
    initial_match = next(p for p in similar_posts if p["post_id"] == post_id)
    assert initial_match["reply_count"] == 0

    # 3. Add a community reply
    peer = client.post("/auth/anonymous").json()
    reply_resp = client.post(
        f"/posts/{post_id}/replies",
        json={"content": "Reach out to them in humility, acknowledge your failure, and rebuild trust over time."},
        headers={"Authorization": f"Bearer {peer['session_token']}"},
    )
    assert reply_resp.status_code == 200

    # 4. Check that /similar metadata has updated reply_count = 1
    sim_resp2 = client.get("/similar", params={"query": "I broke a promise to my friend and ruined our friendship."})
    assert sim_resp2.status_code == 200
    similar_posts2 = sim_resp2.json()
    updated_match = next(p for p in similar_posts2 if p["post_id"] == post_id)
    assert updated_match["reply_count"] == 1


def test_crisis_posts_are_never_indexed_or_matched() -> None:
    """Verify acceptance criterion: Crisis-flagged posts are never shown as matches."""
    user = client.post("/auth/anonymous").json()

    crisis_resp = client.post(
        "/posts",
        json={"content": "I feel completely hopeless and I want to end my life tonight."},
        headers={"Authorization": f"Bearer {user['session_token']}"},
    )
    assert crisis_resp.status_code == 200
    crisis_id = crisis_resp.json()["id"]
    assert crisis_resp.json()["is_crisis"] is True

    # Search /similar
    sim_resp = client.get("/similar", params={"query": "I want to end my life and feel hopeless."})
    assert sim_resp.status_code == 200
    matches = sim_resp.json()
    assert not any(m["post_id"] == crisis_id for m in matches), "Crisis posts must never be indexed or matched"


def test_private_chats_are_never_indexed_in_community_index() -> None:
    """Verify acceptance criterion: Private chats never appear in the community index unless shared."""
    private_secret = "PrivateUniqueDilemma9988: I accidentally deleted my boss's critical project database."
    chat_resp = client.post(
        "/chat",
        json={
            "session_id": "private_session_unique",
            "message": private_secret,
            "faith_on": False,
            "tradition": "garuda_purana",
        },
    )
    assert chat_resp.status_code == 200

    # Verify querying /similar for this private chat produces 0 matches
    sim_resp = client.get("/similar", params={"query": "PrivateUniqueDilemma9988 boss project database"})
    assert sim_resp.status_code == 200
    matches = sim_resp.json()
    assert len(matches) == 0, "Private chat sessions must never be added to community vector store"


def test_chat_response_includes_similar_cards_and_label_when_matches_exist() -> None:
    """Verify similar cards appear below the answer when matches exist, with community_experience label."""
    # 1. Share a community problem
    author = client.post("/auth/anonymous").json()
    share_text = "I keep procrastinating on my duties and wasting time scrolling endlessly on my phone."
    post_resp = client.post(
        "/posts",
        json={"content": share_text},
        headers={"Authorization": f"Bearer {author['session_token']}"},
    )
    post_id = post_resp.json()["id"]

    # 2. Chat with an equivalent problem
    chat_resp = client.post(
        "/chat",
        json={
            "session_id": "chat_session_sim_test",
            "message": "I keep procrastinating on my duties and wasting time on my phone.",
            "faith_on": True,
            "tradition": "garuda_purana",
        },
    )
    assert chat_resp.status_code == 200
    data = chat_resp.json()

    # Similar cards should be populated
    assert len(data["similar"]) >= 1
    assert any(s["post_id"] == post_id for s in data["similar"])
    assert "community_experience" in data["source_labels"]


def test_chat_response_hides_similar_when_no_match() -> None:
    """Verify similar cards are empty when no community post meets similarity threshold."""
    chat_resp = client.post(
        "/chat",
        json={
            "session_id": "chat_unrelated_query",
            "message": "Calculate the square root of 1764 plus the integral of sin(x).",
            "faith_on": False,
            "tradition": "garuda_purana",
        },
    )
    assert chat_resp.status_code == 200
    data = chat_resp.json()
    assert data["similar"] == []
    assert "community_experience" not in data["source_labels"]


def test_streaming_endpoint_emits_similar_cards_in_final_event() -> None:
    """Verify POST /chat/stream includes similar community matches in the terminal SSE event."""
    # Share a problem
    author = client.post("/auth/anonymous").json()
    client.post(
        "/posts",
        json={"content": "I feel jealousy seeing my peers achieve wealth and promotion."},
        headers={"Authorization": f"Bearer {author['session_token']}"},
    )

    stream_resp = client.post(
        "/chat/stream",
        json={
            "session_id": "stream_sim_test",
            "message": "I feel bitter jealousy seeing my peers achieve wealth and promotion.",
            "faith_on": True,
            "tradition": "garuda_purana",
        },
    )
    assert stream_resp.status_code == 200

    events = []
    for line in stream_resp.text.strip().split("\n\n"):
        if line.startswith("data: "):
            events.append(json.loads(line[6:]))

    done_events = [e for e in events if e.get("done") is True]
    assert len(done_events) == 1
    final_event = done_events[0]
    assert "similar" in final_event
    assert len(final_event["similar"]) >= 1
    assert "community_experience" in final_event["source_labels"]


def test_get_similar_by_post_id_excludes_self() -> None:
    """Verify GET /similar?post_id=... returns related posts while excluding the post itself."""
    user1 = client.post("/auth/anonymous").json()
    user2 = client.post("/auth/anonymous").json()

    # Create post A
    post_a = client.post(
        "/posts",
        json={"content": "I borrowed money from an elder relative and avoided paying them back on time."},
        headers={"Authorization": f"Bearer {user1['session_token']}"},
    ).json()

    # Create post B (similar)
    post_b = client.post(
        "/posts",
        json={"content": "I borrowed money from an elder relative and did not pay them back."},
        headers={"Authorization": f"Bearer {user2['session_token']}"},
    ).json()

    # Query similar for post A
    sim_resp = client.get(f"/similar?post_id={post_a['id']}")
    assert sim_resp.status_code == 200
    matches = sim_resp.json()

    match_ids = [m["post_id"] for m in matches]
    assert post_a["id"] not in match_ids, "A post must not match itself"
    assert post_b["id"] in match_ids, "Related post B must be matched"
