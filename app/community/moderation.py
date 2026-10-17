"""Moderation service for review queues, crisis escalation, and content reports."""

from typing import Any, Dict, List, Optional
from app.community.db import Database, get_db
from app.community.matcher import SimilarProblemMatcher, get_similar_matcher


class ModerationManager:
    """Manages content moderation queues, user reports, and crisis reviews."""

    def __init__(
        self,
        db: Optional[Database] = None,
        matcher: Optional[SimilarProblemMatcher] = None,
    ) -> None:
        self.db = db or get_db()
        self.matcher = matcher or get_similar_matcher()

    def list_reports(
        self,
        status: Optional[str] = "pending",
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """List user-filed moderation reports with attached target content."""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            if status:
                cursor.execute(
                    """
                    SELECT id, target_type, target_id, reason, reporter_id, status, created_at
                    FROM reports
                    WHERE status = ?
                    ORDER BY created_at DESC
                    LIMIT ? OFFSET ?
                    """,
                    (status, limit, offset),
                )
            else:
                cursor.execute(
                    """
                    SELECT id, target_type, target_id, reason, reporter_id, status, created_at
                    FROM reports
                    ORDER BY created_at DESC
                    LIMIT ? OFFSET ?
                    """,
                    (limit, offset),
                )
            rows = cursor.fetchall()
            reports: List[Dict[str, Any]] = []

            for r in rows:
                report = dict(r)
                target_type = report["target_type"]
                target_id = report["target_id"]
                target_content = None
                target_status = None

                if target_type == "post":
                    cursor.execute("SELECT anonymised_content, status FROM posts WHERE id = ?", (target_id,))
                    p_row = cursor.fetchone()
                    if p_row:
                        target_content = p_row["anonymised_content"]
                        target_status = p_row["status"]
                elif target_type == "reply":
                    cursor.execute("SELECT content, status FROM replies WHERE id = ?", (target_id,))
                    rep_row = cursor.fetchone()
                    if rep_row:
                        target_content = rep_row["content"]
                        target_status = rep_row["status"]

                report["target_content"] = target_content
                report["target_status"] = target_status
                reports.append(report)

            return reports

    def get_report(self, report_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve single report by ID."""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, target_type, target_id, reason, reporter_id, status, created_at FROM reports WHERE id = ?",
                (report_id,),
            )
            row = cursor.fetchone()
            if not row:
                return None
            report = dict(row)
            target_type = report["target_type"]
            target_id = report["target_id"]

            if target_type == "post":
                cursor.execute("SELECT anonymised_content, status FROM posts WHERE id = ?", (target_id,))
                p_row = cursor.fetchone()
                if p_row:
                    report["target_content"] = p_row["anonymised_content"]
                    report["target_status"] = p_row["status"]
            elif target_type == "reply":
                cursor.execute("SELECT content, status FROM replies WHERE id = ?", (target_id,))
                rep_row = cursor.fetchone()
                if rep_row:
                    report["target_content"] = rep_row["content"]
                    report["target_status"] = rep_row["status"]

            return report

    def resolve_report(
        self,
        report_id: str,
        action: str,
        note: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Apply a moderation decision to a reported post or reply.

        Actions:
        - 'remove': hides content from community feed and deletes it from similarity index.
        - 'dismiss': ignores the report, keeping content published.
        - 'restore': un-removes previously removed content and restores similarity indexing.
        """
        valid_actions = ("remove", "dismiss", "restore")
        if action not in valid_actions:
            raise ValueError(f"Action '{action}' is invalid. Must be one of: {valid_actions}")

        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, target_type, target_id, status FROM reports WHERE id = ?",
                (report_id,),
            )
            report = cursor.fetchone()
            if not report:
                raise ValueError(f"Report '{report_id}' not found")

            target_type = report["target_type"]
            target_id = report["target_id"]

            if action == "remove":
                if target_type == "post":
                    cursor.execute("UPDATE posts SET status = 'removed' WHERE id = ?", (target_id,))
                    self.matcher.remove_post(target_id)
                elif target_type == "reply":
                    cursor.execute("SELECT post_id, status FROM replies WHERE id = ?", (target_id,))
                    reply_row = cursor.fetchone()
                    if reply_row and reply_row["status"] == "published":
                        post_id = reply_row["post_id"]
                        cursor.execute("UPDATE replies SET status = 'removed' WHERE id = ?", (target_id,))
                        cursor.execute("UPDATE posts SET reply_count = MAX(0, reply_count - 1) WHERE id = ?", (post_id,))
                        cursor.execute("SELECT reply_count FROM posts WHERE id = ?", (post_id,))
                        new_count = cursor.fetchone()["reply_count"]
                        self.matcher.update_reply_count(post_id, new_count)
                    else:
                        cursor.execute("UPDATE replies SET status = 'removed' WHERE id = ?", (target_id,))

                cursor.execute("UPDATE reports SET status = 'resolved' WHERE id = ?", (report_id,))

            elif action == "dismiss":
                cursor.execute("UPDATE reports SET status = 'dismissed' WHERE id = ?", (report_id,))

            elif action == "restore":
                if target_type == "post":
                    cursor.execute(
                        "SELECT anonymised_content, display_name, reply_count FROM posts WHERE id = ?",
                        (target_id,),
                    )
                    post_row = cursor.fetchone()
                    if post_row:
                        cursor.execute("UPDATE posts SET status = 'published' WHERE id = ?", (target_id,))
                        self.matcher.index_post(
                            post_id=target_id,
                            content=post_row["anonymised_content"],
                            display_name=post_row["display_name"],
                            reply_count=post_row["reply_count"],
                        )
                elif target_type == "reply":
                    cursor.execute("SELECT post_id, status FROM replies WHERE id = ?", (target_id,))
                    reply_row = cursor.fetchone()
                    if reply_row and reply_row["status"] != "published":
                        post_id = reply_row["post_id"]
                        cursor.execute("UPDATE replies SET status = 'published' WHERE id = ?", (target_id,))
                        cursor.execute("UPDATE posts SET reply_count = reply_count + 1 WHERE id = ?", (post_id,))
                        cursor.execute("SELECT reply_count FROM posts WHERE id = ?", (post_id,))
                        new_count = cursor.fetchone()["reply_count"]
                        self.matcher.update_reply_count(post_id, new_count)

                cursor.execute("UPDATE reports SET status = 'resolved' WHERE id = ?", (report_id,))

            conn.commit()

        return {
            "report_id": report_id,
            "action": action,
            "status": "dismissed" if action == "dismiss" else "resolved",
            "note": note,
        }

    def list_crisis_queue(self, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """List posts and replies held for crisis moderation review."""
        with self.db.get_connection() as conn:
            cursor = conn.cursor()

            # Pending crisis posts
            cursor.execute(
                """
                SELECT id, user_id, display_name, anonymised_content, status, created_at
                FROM posts
                WHERE is_crisis = 1 AND status = 'pending_review'
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
                """,
                (limit, offset),
            )
            posts = [dict(r) for r in cursor.fetchall()]

            # Pending crisis replies
            cursor.execute(
                """
                SELECT id, post_id, user_id, display_name, content, status, created_at
                FROM replies
                WHERE is_crisis = 1 AND status = 'pending_review'
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
                """,
                (limit, offset),
            )
            replies = [dict(r) for r in cursor.fetchall()]

            return {
                "posts": posts,
                "replies": replies,
                "total_pending": len(posts) + len(replies),
            }

    def review_crisis_item(
        self,
        target_type: str,
        target_id: str,
        action: str,
    ) -> Dict[str, Any]:
        """Apply human moderator review decision to a crisis-flagged post or reply.

        Actions:
        - 'approve': deemed a false-positive; published to community and indexed.
        - 'escalate': confirmed genuine crisis; kept hidden from public and flagged for support.
        - 'dismiss': dismissed/rejected without publishing.
        """
        valid_types = ("post", "reply")
        valid_actions = ("approve", "escalate", "dismiss")

        if target_type not in valid_types:
            raise ValueError(f"target_type must be one of {valid_types}")
        if action not in valid_actions:
            raise ValueError(f"action must be one of {valid_actions}")

        with self.db.get_connection() as conn:
            cursor = conn.cursor()

            if target_type == "post":
                cursor.execute(
                    "SELECT id, anonymised_content, display_name, reply_count, status FROM posts WHERE id = ?",
                    (target_id,),
                )
                post = cursor.fetchone()
                if not post:
                    raise ValueError(f"Post '{target_id}' not found")

                if action == "approve":
                    cursor.execute(
                        "UPDATE posts SET is_crisis = 0, status = 'published' WHERE id = ?",
                        (target_id,),
                    )
                    # Safe to index in similarity vector store now
                    self.matcher.index_post(
                        post_id=target_id,
                        content=post["anonymised_content"],
                        display_name=post["display_name"],
                        reply_count=post["reply_count"],
                    )
                elif action == "escalate":
                    cursor.execute(
                        "UPDATE posts SET status = 'crisis_escalated' WHERE id = ?",
                        (target_id,),
                    )
                elif action == "dismiss":
                    cursor.execute(
                        "UPDATE posts SET status = 'dismissed' WHERE id = ?",
                        (target_id,),
                    )

            elif target_type == "reply":
                cursor.execute(
                    "SELECT id, post_id, content, display_name, status FROM replies WHERE id = ?",
                    (target_id,),
                )
                reply = cursor.fetchone()
                if not reply:
                    raise ValueError(f"Reply '{target_id}' not found")

                if action == "approve":
                    cursor.execute(
                        "UPDATE replies SET is_crisis = 0, status = 'published' WHERE id = ?",
                        (target_id,),
                    )
                    post_id = reply["post_id"]
                    cursor.execute("UPDATE posts SET reply_count = reply_count + 1 WHERE id = ?", (post_id,))
                    cursor.execute("SELECT reply_count FROM posts WHERE id = ?", (post_id,))
                    new_count = cursor.fetchone()["reply_count"]
                    self.matcher.update_reply_count(post_id, new_count)
                elif action == "escalate":
                    cursor.execute(
                        "UPDATE replies SET status = 'crisis_escalated' WHERE id = ?",
                        (target_id,),
                    )
                elif action == "dismiss":
                    cursor.execute(
                        "UPDATE replies SET status = 'dismissed' WHERE id = ?",
                        (target_id,),
                    )

            conn.commit()

        return {
            "target_type": target_type,
            "target_id": target_id,
            "action": action,
            "status": "published" if action == "approve" else ("crisis_escalated" if action == "escalate" else "dismissed"),
        }


_GLOBAL_MODERATOR: Optional[ModerationManager] = None


def get_moderation_manager() -> ModerationManager:
    """Return singleton ModerationManager instance."""
    global _GLOBAL_MODERATOR
    if _GLOBAL_MODERATOR is None:
        _GLOBAL_MODERATOR = ModerationManager()
    return _GLOBAL_MODERATOR
