"""Knowledge base ingestion and chunking pipeline for APARICHIT."""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.config import Settings, get_settings
from app.rag.store import VectorStore

logger = logging.getLogger(__name__)

RAW_DATA_PATH = Path(__file__).parent.parent.parent / "data" / "raw" / "garuda_purana_wood_subrahmanyam.json"
CHUNKS_DIR = Path(__file__).parent.parent.parent / "data" / "chunks"
CHUNKS_FILE = CHUNKS_DIR / "garuda_purana_chunks.jsonl"


def create_chunks_from_raw_json(raw_path: Path) -> List[Dict[str, Any]]:
    """Parse raw structured JSON into standardized chunk records.

    Each chunk retains source, translation, section, chapter, verse, topics, and text
    as mandated by content.md and building.md.
    """
    if not raw_path.exists():
        raise FileNotFoundError(f"Source file not found at {raw_path}")

    with open(raw_path, "r", encoding="utf-8") as f:
        chapters = json.load(f)

    chunks: List[Dict[str, Any]] = []

    for ch in chapters:
        chapter_num = ch.get("chapter", 0)
        chapter_title = ch.get("chapter_title", "")
        section = ch.get("section", "Preta Kanda / Saroddhara")

        for v in ch.get("verses", []):
            verse_num = v.get("verse", "")
            text = v.get("text", "").strip()
            topics = v.get("topics", [])

            chunk_id = f"gp_ch{chapter_num:02d}_v{verse_num.replace(' ', '')}"

            chunk_record = {
                "id": chunk_id,
                "source": "Garuda Purana",
                "translation": "Wood & Subrahmanyam 1911",
                "section": section,
                "chapter": f"Chapter {chapter_num}: {chapter_title}",
                "chapter_number": chapter_num,
                "chapter_title": chapter_title,
                "verse": str(verse_num),
                "text": text,
                "topics": topics,
                "language": "en",
            }
            chunks.append(chunk_record)

    return chunks


def save_chunks_to_jsonl(chunks: List[Dict[str, Any]], target_file: Path) -> None:
    """Save processed chunks to a JSONL file."""
    target_file.parent.mkdir(parents=True, exist_ok=True)
    with open(target_file, "w", encoding="utf-8") as f:
        for chunk in chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + "\n")


def ingest_knowledge_base(
    raw_path: Optional[Path] = None,
    chunks_path: Optional[Path] = None,
    settings: Optional[Settings] = None,
) -> int:
    """Full ingestion workflow: load raw, chunk, write JSONL, and index into VectorStore.

    Returns:
        Number of chunks indexed into vector storage.
    """
    app_settings = settings or get_settings()
    src_path = raw_path or RAW_DATA_PATH
    dst_chunks = chunks_path or CHUNKS_FILE

    print(f"Loading raw source text from: {src_path}")
    chunks = create_chunks_from_raw_json(src_path)
    print(f"Generated {len(chunks)} verified scripture chunks.")

    print(f"Saving chunk records to JSONL: {dst_chunks}")
    save_chunks_to_jsonl(chunks, dst_chunks)

    print(f"Connecting to vector database at: {app_settings.VECTOR_DB_PATH}")
    store = VectorStore(
        db_path=app_settings.VECTOR_DB_PATH,
        collection_name="garuda_purana",
    )

    print("Generating embeddings and upserting into ChromaDB...")
    indexed_count = store.add_chunks(chunks)
    print(f"Successfully indexed {indexed_count} passages into collection 'garuda_purana'.")

    return indexed_count


if __name__ == "__main__":
    count = ingest_knowledge_base()
    print(f"Ingestion complete! Total passages stored: {count}")
