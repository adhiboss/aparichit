"""SQLite database management for APARICHIT community and anonymous auth."""

from pathlib import Path
import sqlite3
from typing import Optional
from app.config import Settings, get_settings


def parse_sqlite_path(db_url: str) -> str:
    """Extract filesystem path from SQLite database URL."""
    if db_url.startswith("sqlite:///"):
        raw_path = db_url[10:]
        return str(Path(raw_path).resolve())
    return str(Path("./aparichit.db").resolve())


class Database:
    """Manages SQLite schema creation and connection pooling."""

    def __init__(self, settings: Optional[Settings] = None) -> None:
        self.settings = settings or get_settings()
        self.db_path = parse_sqlite_path(self.settings.DATABASE_URL)
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self.init_schema()

    def get_connection(self) -> sqlite3.Connection:
        """Get a thread-safe connection to SQLite with row dictionary access."""
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def init_schema(self) -> None:
        """Create tables for accounts, posts, replies, and reports if not existing."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Anonymous Accounts
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounts (
                    user_id TEXT PRIMARY KEY,
                    display_name TEXT NOT NULL,
                    session_token TEXT UNIQUE NOT NULL,
                    created_at TEXT NOT NULL
                );
            """)

            # Community Posts
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS posts (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    display_name TEXT NOT NULL,
                    raw_content TEXT NOT NULL,
                    anonymised_content TEXT NOT NULL,
                    reply_count INTEGER DEFAULT 0,
                    is_crisis INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'published',
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES accounts (user_id) ON DELETE CASCADE
                );
            """)

            # Community Replies
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS replies (
                    id TEXT PRIMARY KEY,
                    post_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    display_name TEXT NOT NULL,
                    content TEXT NOT NULL,
                    is_crisis INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'published',
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES accounts (user_id) ON DELETE CASCADE
                );
            """)

            # Reports
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS reports (
                    id TEXT PRIMARY KEY,
                    target_type TEXT NOT NULL, -- 'post' or 'reply'
                    target_id TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    reporter_id TEXT NOT NULL,
                    status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
                    created_at TEXT NOT NULL
                );
            """)

            # Schema migrations for existing database files
            cursor.execute("PRAGMA table_info(replies);")
            reply_cols = [row[1] for row in cursor.fetchall()]
            if "is_crisis" not in reply_cols:
                cursor.execute("ALTER TABLE replies ADD COLUMN is_crisis INTEGER DEFAULT 0;")
            if "status" not in reply_cols:
                cursor.execute("ALTER TABLE replies ADD COLUMN status TEXT DEFAULT 'published';")

            conn.commit()



_GLOBAL_DB: Optional[Database] = None


def get_db() -> Database:
    """Return application global database instance."""
    global _GLOBAL_DB
    if _GLOBAL_DB is None:
        _GLOBAL_DB = Database()
    return _GLOBAL_DB
