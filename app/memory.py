"""Session conversational memory manager for APARICHIT."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
import threading
from typing import Dict, List, Optional


@dataclass
class MessageTurn:
    """A single conversational message turn."""

    role: str  # "user" or "assistant"
    content: str
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> Dict[str, str]:
        """Convert to standard chat message format."""
        return {"role": self.role, "content": self.content}


class SessionMemory:
    """In-memory thread-safe chat history manager with sliding window retention."""

    def __init__(self, max_turns_per_session: int = 20) -> None:
        self.max_turns = max_turns_per_session
        self._sessions: Dict[str, List[MessageTurn]] = {}
        self._lock = threading.Lock()

    def add_message(self, session_id: str, role: str, content: str) -> None:
        """Add a message turn to the session history."""
        if not session_id or not content.strip():
            return

        with self._lock:
            if session_id not in self._sessions:
                self._sessions[session_id] = []

            self._sessions[session_id].append(MessageTurn(role=role, content=content.strip()))

            # Enforce sliding window to prevent unbounded memory growth
            if len(self._sessions[session_id]) > self.max_turns:
                self._sessions[session_id] = self._sessions[session_id][-self.max_turns:]

    def get_history(
        self,
        session_id: str,
        max_messages: Optional[int] = None,
    ) -> List[Dict[str, str]]:
        """Retrieve recent message history formatted for LLM context."""
        with self._lock:
            turns = self._sessions.get(session_id, [])
            limit = max_messages or self.max_turns
            recent_turns = turns[-limit:] if turns else []
            return [t.to_dict() for t in recent_turns]

    def get_session_details(self, session_id: str) -> Dict[str, object]:
        """Get full details of a session including turn count and message objects."""
        with self._lock:
            turns = self._sessions.get(session_id, [])
            return {
                "session_id": session_id,
                "total_messages": len(turns),
                "messages": [
                    {
                        "role": t.role,
                        "content": t.content,
                        "timestamp": t.timestamp,
                    }
                    for t in turns
                ],
            }

    def clear_session(self, session_id: str) -> bool:
        """Clear all messages for a session."""
        with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                return True
            return False

    def list_sessions(self) -> List[str]:
        """List all active session identifiers."""
        with self._lock:
            return list(self._sessions.keys())


# Global singleton instance for memory retention across requests
_GLOBAL_MEMORY = SessionMemory()


def get_session_memory() -> SessionMemory:
    """Return application global session memory instance."""
    return _GLOBAL_MEMORY
