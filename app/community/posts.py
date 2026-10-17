"""Community posts, replies, and reporting service."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid
from app.auth.anon_accounts import AuthManager, get_auth_manager
from app.community.anonymise import anonymise_text
from app.community.db import Database, get_db
from app.community.matcher import SimilarProblemMatcher, get_similar_matcher
from app.pipeline.classify import SafetyClassifier


class PostManager:
    """Manages community forum posts, peer replies, and safety review."""

    def __init__(
        self,
        db: Optional[Database] = None,
        auth: Optional[AuthManager] = None,
        safety_classifier: Optional[SafetyClassifier] = None,
        matcher: Optional[SimilarProblemMatcher] = None,
    ) -> None:
        self.db = db or get_db()
        self.auth = auth or get_auth_manager()
        self.safety = safety_classifier or SafetyClassifier()
        self.matcher = matcher or get_similar_matcher()


    def create_post(self, user_id: str, content: str) -> Dict[str, Any]:
        """Create and publish an anonymised community post.

        If crisis is detected, flags for moderator review and excludes from public view.
        """
        account = self.auth.get_account_by_id(user_id)
        if not account:
            raise ValueError(f"Account not found for user_id: {user_id}")

        clean_content = content.strip()
        if not clean_content:
            raise ValueError("Post content cannot be empty")

        # 1. Safety check
        classification = self.safety.classify(clean_content)
        is_crisis = 1 if classification.flag == "crisis" else 0
        status = "pending_review" if is_crisis else "published"

        # 2. PII Scrubbing
        anonymised = anonymise_text(clean_content)

        post_id = f"post_{uuid.uuid4().hex[:12]}"
        created_at = datetime.now(timezone.utc).isoformat()

        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO posts (id, user_id, display_name, raw_content, anonymised_content, reply_count, is_crisis, status, created_at)
                VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
                """,
                (post_id, user_id, account.display_name, clean_content, anonymised, is_crisis, status, created_at),
            )
            conn.commit()

        # 3. Vector Embedding & Indexing (Strict exclusion of crisis posts)
        if not is_crisis:
            self.matcher.index_post(
                post_id=post_id,
                content=anonymised,
                display_name=account.display_name,
                reply_count=0,
            )


        return {
            "id": post_id,
            "user_id": user_id,
            "display_name": account.display_name,
            "content": anonymised,
            "reply_count": 0,
            "is_crisis": bool(is_crisis),
            "status": status,
            "created_at": created_at,
        }

    def get_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a post and its community replies by post ID."""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, user_id, display_name, anonymised_content, reply_count, is_crisis, status, created_at
                FROM posts WHERE id = ?
                """,
                (post_id,),
            )
            post_row = cursor.fetchone()
            if not post_row:
                return None

            # Fetch replies
            cursor.execute(
                """
                SELECT id, post_id, user_id, display_name, content, created_at
                FROM replies WHERE post_id = ?
                ORDER BY created_at ASC
                """,
                (post_id,),
            )
            reply_rows = cursor.fetchall()
            replies = [dict(r) for r in reply_rows]

            return {
                "id": post_row["id"],
                "user_id": post_row["user_id"],
                "display_name": post_row["display_name"],
                "content": post_row["anonymised_content"],
                "reply_count": post_row["reply_count"],
                "is_crisis": bool(post_row["is_crisis"]),
                "status": post_row["status"],
                "created_at": post_row["created_at"],
                "replies": replies,
            }

    def list_public_posts(self, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """List published, non-crisis posts for the community feed."""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, user_id, display_name, anonymised_content, reply_count, created_at
                FROM posts
                WHERE status = 'published' AND is_crisis = 0
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
                """,
                (limit, offset),
            )
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "user_id": r["user_id"],
                    "display_name": r["display_name"],
                    "content": r["anonymised_content"],
                    "reply_count": r["reply_count"],
                    "created_at": r["created_at"],
                }
                for r in rows
            ]

    def add_reply(self, post_id: str, user_id: str, content: str) -> Dict[str, Any]:
        """Add a reply to an existing public post."""
        clean_content = content.strip()
        if not clean_content:
            raise ValueError("Reply content cannot be empty")

        account = self.auth.get_account_by_id(user_id)
        if not account:
            raise ValueError(f"Account not found for user_id: {user_id}")

        with self.db.get_connection() as conn:
            cursor = conn.cursor()

            # Verify post exists
            cursor.execute("SELECT id, status, is_crisis FROM posts WHERE id = ?", (post_id,))
            post = cursor.fetchone()
            if not post:
                raise ValueError(f"Post not found: {post_id}")
            if post["is_crisis"] or post["status"] != "published":
                raise ValueError("Cannot reply to a post that is under safety review")

            reply_id = f"reply_{uuid.uuid4().hex[:12]}"
            created_at = datetime.now(timezone.utc).isoformat()
            anonymised = anonymise_text(clean_content)

            cursor.execute(
                """
                INSERT INTO replies (id, post_id, user_id, display_name, content, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (reply_id, post_id, user_id, account.display_name, anonymised, created_at),
            )

            # Increment post reply count
            cursor.execute(
                "UPDATE posts SET reply_count = reply_count + 1 WHERE id = ?",
                (post_id,),
            )
            cursor.execute("SELECT reply_count FROM posts WHERE id = ?", (post_id,))
            updated_count = cursor.fetchone()["reply_count"]
            conn.commit()

        # Update reply count in similarity index
        self.matcher.update_reply_count(post_id=post_id, reply_count=updated_count)

        return {
            "id": reply_id,
            "post_id": post_id,
            "user_id": user_id,
            "display_name": account.display_name,
            "content": anonymised,
            "created_at": created_at,
        }


    def create_report(
        self,
        target_type: str,
        target_id: str,
        reason: str,
        reporter_id: str,
    ) -> Dict[str, Any]:
        """Submit a report against a post or reply."""
        clean_reason = reason.strip()
        if not clean_reason:
            raise ValueError("Report reason cannot be empty")
        if target_type not in ("post", "reply"):
            raise ValueError("target_type must be 'post' or 'reply'")

        report_id = f"rep_{uuid.uuid4().hex[:12]}"
        created_at = datetime.now(timezone.utc).isoformat()

        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO reports (id, target_type, target_id, reason, reporter_id, status, created_at)
                VALUES (?, ?, ?, ?, ?, 'pending', ?)
                """,
                (report_id, target_type, target_id, clean_reason, reporter_id, created_at),
            )
            conn.commit()

        return {
            "id": report_id,
            "target_type": target_type,
            "target_id": target_id,
            "reason": clean_reason,
            "status": "pending",
            "created_at": created_at,
        }


_GLOBAL_POST_MANAGER: Optional[PostManager] = None


def get_post_manager() -> PostManager:
    """Return application global post manager instance."""
    global _GLOBAL_POST_MANAGER
    if _GLOBAL_POST_MANAGER is None:
        _GLOBAL_POST_MANAGER = PostManager()
    return _GLOBAL_POST_MANAGER
