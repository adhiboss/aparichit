"""Tests for Milestone 9: Moderation, crisis queues, report actions, and admin views."""

import pytest
from fastapi.testclient import TestClient
from app.community.matcher import get_similar_matcher
from app.config import get_settings
from app.main import app

client = TestClient(app)
settings = get_settings()
ADMIN_HEADERS = {"X-Admin-Token": settings.ADMIN_TOKEN}


@pytest.fixture(autouse=True)
def clean_test_environment():
    """Ensure vector matcher is clean before and after tests."""
    matcher = get_similar_matcher()
    matcher.clear()
    yield
    matcher.clear()


def test_admin_endpoints_require_authentication() -> None:
    """Verify that admin endpoints strictly reject unauthenticated or invalid requests."""
    # 1. No token
    resp_no_token = client.get("/admin/reports")
    assert resp_no_token.status_code == 403

    # 2. Invalid token
    resp_bad_token = client.get("/admin/reports", headers={"X-Admin-Token": "invalid_token_xyz"})
    assert resp_bad_token.status_code == 403

    # 3. Valid token
    resp_auth = client.get("/admin/reports", headers=ADMIN_HEADERS)
    assert resp_auth.status_code == 200

    # 4. Crisis queue auth
    resp_crisis_no_auth = client.get("/admin/crisis")
    assert resp_crisis_no_auth.status_code == 403
    resp_crisis_auth = client.get("/admin/crisis", headers=ADMIN_HEADERS)
    assert resp_crisis_auth.status_code == 200


def test_reply_crisis_flagging_and_hiding_from_public() -> None:
    """Verify that replies with crisis content are held in review and omitted from public post view."""
    # 1. Create a public post
    user1 = client.post("/auth/anonymous").json()
    post_resp = client.post(
        "/posts",
        json={"content": "I am looking for practical guidance on daily meditation."},
        headers={"Authorization": f"Bearer {user1['session_token']}"},
    )
    post_id = post_resp.json()["id"]

    # 2. Peer submits a reply with crisis content
    user2 = client.post("/auth/anonymous").json()
    crisis_reply = client.post(
        f"/posts/{post_id}/replies",
        json={"content": "I feel completely hopeless and I want to end my life, please help."},
        headers={"Authorization": f"Bearer {user2['session_token']}"},
    )
    assert crisis_reply.status_code == 200
    reply_data = crisis_reply.json()
    assert reply_data["is_crisis"] is True
    assert reply_data["status"] == "pending_review"

    # 3. Check public post detail
    detail = client.get(f"/posts/{post_id}").json()
    assert detail["reply_count"] == 0, "Crisis reply must not increment public reply count"
    assert len(detail["replies"]) == 0, "Crisis reply must never appear in public replies"

    # 4. Verify crisis reply appears in admin crisis queue
    queue = client.get("/admin/crisis", headers=ADMIN_HEADERS).json()
    assert any(r["id"] == reply_data["id"] for r in queue["replies"])


def test_crisis_queue_approve_and_escalate_actions() -> None:
    """Verify administrator review actions on items in the crisis queue."""
    user = client.post("/auth/anonymous").json()

    # Create post that triggers crisis
    post_resp = client.post(
        "/posts",
        json={"content": "I am feeling suicidal and want to kill myself tonight."},
        headers={"Authorization": f"Bearer {user['session_token']}"},
    )
    post_id = post_resp.json()["id"]

    # 1. Escalate action
    esc_resp = client.post(
        f"/admin/crisis/post/{post_id}/action",
        json={"action": "escalate"},
        headers=ADMIN_HEADERS,
    )
    assert esc_resp.status_code == 200
    assert esc_resp.json()["status"] == "crisis_escalated"

    # Post must remain excluded from public feed
    feed = client.get("/posts").json()
    assert not any(p["id"] == post_id for p in feed)

    # 2. False-positive approve scenario
    post2_resp = client.post(
        "/posts",
        json={"content": "I feel hopeless about passing my calculus class, want to end my despair."},
        headers={"Authorization": f"Bearer {user['session_token']}"},
    )
    post2_id = post2_resp.json()["id"]

    app_resp = client.post(
        f"/admin/crisis/post/{post2_id}/action",
        json={"action": "approve"},
        headers=ADMIN_HEADERS,
    )
    assert app_resp.status_code == 200
    assert app_resp.json()["status"] == "published"

    # Now it should be visible in public feed and similarity index
    feed2 = client.get("/posts").json()
    assert any(p["id"] == post2_id for p in feed2)


def test_moderation_report_removal_and_restoration_lifecycle() -> None:
    """Verify reporting content, admin review with content preview, removal from feed/index, and restoration."""
    user1 = client.post("/auth/anonymous").json()
    user2 = client.post("/auth/anonymous").json()

    # 1. Post shared problem
    post_resp = client.post(
        "/posts",
        json={"content": "Join our crypto investment group for guaranteed 500% returns in one day!"},
        headers={"Authorization": f"Bearer {user1['session_token']}"},
    )
    post_id = post_resp.json()["id"]

    # 2. User reports the post
    rep_resp = client.post(
        "/reports",
        json={
            "target_type": "post",
            "target_id": post_id,
            "reason": "Cryptocurrency spam scam",
        },
        headers={"Authorization": f"Bearer {user2['session_token']}"},
    )
    assert rep_resp.status_code == 200
    report_id = rep_resp.json()["id"]

    # 3. Admin lists reports and verifies target preview
    reports = client.get("/admin/reports", headers=ADMIN_HEADERS).json()
    our_report = next((r for r in reports if r["id"] == report_id), None)
    assert our_report is not None
    assert our_report["target_type"] == "post"
    assert "crypto investment" in our_report["target_content"]

    # 4. Admin removes the content
    action_resp = client.post(
        f"/admin/reports/{report_id}/action",
        json={"action": "remove", "note": "Spam scam violating terms"},
        headers=ADMIN_HEADERS,
    )
    assert action_resp.status_code == 200
    assert action_resp.json()["status"] == "resolved"

    # 5. Post is no longer in public feed
    feed = client.get("/posts").json()
    assert not any(p["id"] == post_id for p in feed)

    # 6. Post is no longer in similarity index
    sim = client.get("/similar", params={"query": "crypto investment group returns"}).json()
    assert not any(s["post_id"] == post_id for s in sim)

    # 7. Admin restores content
    restore_resp = client.post(
        f"/admin/reports/{report_id}/action",
        json={"action": "restore", "note": "Mistaken removal"},
        headers=ADMIN_HEADERS,
    )
    assert restore_resp.status_code == 200

    # Post is back in public feed
    feed_restored = client.get("/posts").json()
    assert any(p["id"] == post_id for p in feed_restored)


def test_moderation_report_dismissal() -> None:
    """Verify dismissing a report leaves the content published."""
    user = client.post("/auth/anonymous").json()
    post = client.post(
        "/posts",
        json={"content": "I feel remorse about forgetting my grandmother's birthday."},
        headers={"Authorization": f"Bearer {user['session_token']}"},
    ).json()

    rep = client.post(
        "/reports",
        json={
            "target_type": "post",
            "target_id": post["id"],
            "reason": "I disagree with this advice seeker",
        },
        headers={"Authorization": f"Bearer {user['session_token']}"},
    ).json()

    dismiss_resp = client.post(
        f"/admin/reports/{rep['id']}/action",
        json={"action": "dismiss", "note": "Not a violation"},
        headers=ADMIN_HEADERS,
    )
    assert dismiss_resp.status_code == 200
    assert dismiss_resp.json()["status"] == "dismissed"

    # Content remains in public feed
    feed = client.get("/posts").json()
    assert any(p["id"] == post["id"] for p in feed)
