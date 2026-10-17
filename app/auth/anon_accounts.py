"""Anonymous account creation and session token authentication."""

from dataclasses import dataclass
from datetime import datetime, timezone
import random
import secrets
from typing import Optional
import uuid
from app.community.db import Database, get_db

ADJECTIVES = [
    "Quiet", "Silent", "Calm", "Gentle", "Still", "Patient",
    "Mindful", "Serene", "Thoughtful", "Humble", "Wise", "Peaceful",
    "Steady", "Graceful", "Reflective", "Compassionate",
]

NOUNS = [
    "River", "Peak", "Valley", "Rain", "Breeze", "Forest",
    "Dawn", "Cloud", "Meadow", "Stream", "Stone", "Horizon",
    "Tree", "Flame", "Ocean", "Grove",
]


def generate_display_name() -> str:
    """Generate a poetic, anonymous display name (e.g. 'Quiet River', 'Silent Peak')."""
    adj = random.choice(ADJECTIVES)
    noun = random.choice(NOUNS)
    return f"{adj} {noun}"


@dataclass
class AnonymousAccount:
    """Anonymous user account model."""

    user_id: str
    display_name: str
    session_token: str
    created_at: str


class AuthManager:
    """Manages anonymous account lifecycle and session authentication."""

    def __init__(self, db: Optional[Database] = None) -> None:
        self.db = db or get_db()

    def create_anonymous_account(self) -> AnonymousAccount:
        """Create a new anonymous account with session token and poetic name."""
        user_id = f"anon_{uuid.uuid4().hex[:12]}"
        display_name = generate_display_name()
        session_token = secrets.token_urlsafe(32)
        created_at = datetime.now(timezone.utc).isoformat()

        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO accounts (user_id, display_name, session_token, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (user_id, display_name, session_token, created_at),
            )
            conn.commit()

        return AnonymousAccount(
            user_id=user_id,
            display_name=display_name,
            session_token=session_token,
            created_at=created_at,
        )

    def get_account_by_token(self, token: str) -> Optional[AnonymousAccount]:
        """Look up an anonymous account by its secret session token."""
        if not token:
            return None

        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT user_id, display_name, session_token, created_at FROM accounts WHERE session_token = ?",
                (token.strip(),),
            )
            row = cursor.fetchone()
            if row:
                return AnonymousAccount(
                    user_id=row["user_id"],
                    display_name=row["display_name"],
                    session_token=row["session_token"],
                    created_at=row["created_at"],
                )
        return None

    def get_account_by_id(self, user_id: str) -> Optional[AnonymousAccount]:
        """Look up an anonymous account by its user identifier."""
        if not user_id:
            return None

        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT user_id, display_name, session_token, created_at FROM accounts WHERE user_id = ?",
                (user_id.strip(),),
            )
            row = cursor.fetchone()
            if row:
                return AnonymousAccount(
                    user_id=row["user_id"],
                    display_name=row["display_name"],
                    session_token=row["session_token"],
                    created_at=row["created_at"],
                )
        return None


_GLOBAL_AUTH = AuthManager()


def get_auth_manager() -> AuthManager:
    """Return application global auth manager instance."""
    return _GLOBAL_AUTH
