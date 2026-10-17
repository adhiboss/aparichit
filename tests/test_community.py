"""Tests for Milestone 7: Anonymous accounts, PII anonymisation, and community forum."""

import pytest
from fastapi.testclient import TestClient
from app.community.anonymise import anonymise_text
from app.main import app

client = TestClient(app)


def test_anonymise_text_pii_scrubbing() -> None:
    """Verify that sensitive PII (emails, phones, URLs, workplaces, schools, names) is scrubbed."""
    raw_text = (
        "Hello, my name is Priya Sharma. I am studying at Stanford University "
        "and working at Google. You can reach me at priya.s@example.com or "
        "+1 (555) 234-5678. Also visit https://myportfolio.io/priya."
    )
    scrubbed = anonymise_text(raw_text)

    # Asserts
    assert "priya.s@example.com" not in scrubbed
    assert "[email redacted]" in scrubbed

    assert "555" not in scrubbed
    assert "[phone redacted]" in scrubbed

    assert "https://myportfolio.io/priya" not in scrubbed
    assert "[link redacted]" in scrubbed

    assert "Google" not in scrubbed
    assert "[workplace redacted]" in scrubbed

    assert "Stanford University" not in scrubbed
    assert "[school redacted]" in scrubbed

    assert "Priya Sharma" not in scrubbed
    assert "[name redacted]" in scrubbed


def test_anonymous_auth_endpoint() -> None:
    """Verify POST /auth/anonymous generates anonymous user and session token."""
    response = client.post("/auth/anonymous")
    assert response.status_code == 200
    data = response.json()

    assert data["user_id"].startswith("anon_")
    assert " " in data["display_name"]  # Adjective Noun format
    assert len(data["session_token"]) >= 32
    assert "created_at" in data


def test_create_post_authentication() -> None:
    """Verify that creating a post requires valid authentication token."""
    # 1. Unauthenticated attempt
    unauth_resp = client.post("/posts", json={"content": "I feel lost and confused about my career."})
    assert unauth_resp.status_code == 401

    # 2. Authenticate
    auth_resp = client.post("/auth/anonymous")
    assert auth_resp.status_code == 200
    auth_data = auth_resp.json()
    token = auth_data["session_token"]
    display_name = auth_data["display_name"]

    # 3. Create post via Authorization Bearer header
    post_resp = client.post(
        "/posts",
        json={"content": "I feel lost and confused about my career."},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert post_resp.status_code == 200
    post_data = post_resp.json()
    assert post_data["id"].startswith("post_")
    assert post_data["display_name"] == display_name
    assert post_data["content"] == "I feel lost and confused about my career."
    assert post_data["reply_count"] == 0
    assert post_data["is_crisis"] is False
    assert post_data["status"] == "published"

    # 4. Create post via payload session_token
    post_resp2 = client.post(
        "/posts",
        json={
            "content": "Another dilemma I am facing.",
            "session_token": token,
        },
    )
    assert post_resp2.status_code == 200
    assert post_resp2.json()["display_name"] == display_name


def test_post_creation_scrubs_pii_automatically() -> None:
    """Verify that posting personal info scrubs the PII before saving to community."""
    auth_resp = client.post("/auth/anonymous")
    token = auth_resp.json()["session_token"]

    raw_problem = "I cheated on an exam. Contact me at cheater99@school.edu or 9876543210 if you have advice."
    resp = client.post(
        "/posts",
        json={"content": raw_problem},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    post = resp.json()
    assert "cheater99@school.edu" not in post["content"]
    assert "[email redacted]" in post["content"]
    assert "9876543210" not in post["content"]
    assert "[phone redacted]" in post["content"]


def test_crisis_post_is_flagged_and_hidden_from_feed() -> None:
    """Verify that crisis posts are marked pending_review and excluded from public feed."""
    auth_resp = client.post("/auth/anonymous")
    token = auth_resp.json()["session_token"]

    # Post with crisis keywords
    crisis_text = "I feel so hopeless and I want to end my life, I cannot take it anymore."
    post_resp = client.post(
        "/posts",
        json={"content": crisis_text},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert post_resp.status_code == 200
    crisis_post = post_resp.json()
    crisis_post_id = crisis_post["id"]
    assert crisis_post["is_crisis"] is True
    assert crisis_post["status"] == "pending_review"

    # Check feed
    feed_resp = client.get("/posts")
    assert feed_resp.status_code == 200
    feed_posts = feed_resp.json()
    feed_ids = [p["id"] for p in feed_posts]
    assert crisis_post_id not in feed_ids, "Crisis post must never appear in public feed"


def test_get_post_and_add_community_replies() -> None:
    """Verify viewing a post with replies and adding replies from other anonymous users."""
    # 1. Author creates post
    user1 = client.post("/auth/anonymous").json()
    post_resp = client.post(
        "/posts",
        json={"content": "How do I forgive myself after speaking harshly to my mother?"},
        headers={"Authorization": f"Bearer {user1['session_token']}"},
    )
    post_id = post_resp.json()["id"]

    # 2. View post initially (0 replies)
    detail_resp = client.get(f"/posts/{post_id}")
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    assert detail_data["reply_count"] == 0
    assert detail_data["replies"] == []

    # 3. Peer creates account and replies
    user2 = client.post("/auth/anonymous").json()
    reply_resp = client.post(
        f"/posts/{post_id}/replies",
        json={"content": "Apologize sincerely with folded hands, actions speak louder than guilt."},
        headers={"Authorization": f"Bearer {user2['session_token']}"},
    )
    assert reply_resp.status_code == 200
    reply_data = reply_resp.json()
    assert reply_data["post_id"] == post_id
    assert reply_data["display_name"] == user2["display_name"]
    assert reply_data["content"] == "Apologize sincerely with folded hands, actions speak louder than guilt."

    # 4. View post again (1 reply)
    detail_resp2 = client.get(f"/posts/{post_id}")
    assert detail_resp2.status_code == 200
    detail_data2 = detail_resp2.json()
    assert detail_data2["reply_count"] == 1
    assert len(detail_data2["replies"]) == 1
    assert detail_data2["replies"][0]["id"] == reply_data["id"]
    assert detail_data2["replies"][0]["display_name"] == user2["display_name"]


def test_cannot_reply_to_crisis_or_nonexistent_post() -> None:
    """Verify that replying to a crisis post or nonexistent post is prevented."""
    user = client.post("/auth/anonymous").json()
    token = user["session_token"]

    # 1. Nonexistent post
    resp_404 = client.post(
        "/posts/nonexistent_999/replies",
        json={"content": "Hello"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp_404.status_code == 400

    # 2. Crisis post
    crisis_post = client.post(
        "/posts",
        json={"content": "I want to kill myself tonight."},
        headers={"Authorization": f"Bearer {token}"},
    ).json()

    crisis_reply = client.post(
        f"/posts/{crisis_post['id']}/replies",
        json={"content": "Please don't."},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert crisis_reply.status_code == 400
    assert "safety review" in crisis_reply.json()["detail"]


def test_create_report_for_post_and_reply() -> None:
    """Verify submitting reports against posts and replies."""
    user = client.post("/auth/anonymous").json()
    token = user["session_token"]

    post = client.post(
        "/posts",
        json={"content": "Some inappropriate or spam content here."},
        headers={"Authorization": f"Bearer {token}"},
    ).json()

    # Report the post
    rep_post = client.post(
        "/reports",
        json={
            "target_type": "post",
            "target_id": post["id"],
            "reason": "Spam or irrelevant advertising",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert rep_post.status_code == 200
    rep_data = rep_post.json()
    assert rep_data["id"].startswith("rep_")
    assert rep_data["target_type"] == "post"
    assert rep_data["target_id"] == post["id"]
    assert rep_data["status"] == "pending"
