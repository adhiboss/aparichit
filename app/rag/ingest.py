"""Knowledge base ingestion and chunking pipeline for APARICHIT multi-tradition scriptures."""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.config import Settings, get_settings
from app.rag.store import VectorStore

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent.parent / "data"
RAW_DIR = DATA_DIR / "raw"
CHUNKS_DIR = DATA_DIR / "chunks"

# Backward compatibility aliases for primary Garuda Purana dataset
RAW_DATA_PATH = RAW_DIR / "garuda_purana_wood_subrahmanyam.json"
CHUNKS_FILE = CHUNKS_DIR / "garuda_purana_chunks.jsonl"

TRADITIONS = {
    "garuda_purana": {
        "id": "garuda_purana",
        "name": "Garuda Purana",
        "source": "Garuda Purana",
        "translation": "Wood & Subrahmanyam 1911",
        "collection_name": "garuda_purana",
        "raw_file": "garuda_purana_wood_subrahmanyam.json",
        "chunks_file": "garuda_purana_chunks.jsonl",
        "id_prefix": "gp",
        "default_section": "Preta Kanda / Saroddhara",
        "description": "Classical Hindu dialogue between Vishnu and Garuda on karma, moral duty, and ethical conduct.",
    },
    "bhagavad_gita": {
        "id": "bhagavad_gita",
        "name": "Bhagavad Gita",
        "source": "Bhagavad Gita",
        "translation": "Edwin Arnold 1885",
        "collection_name": "bhagavad_gita",
        "raw_file": "bhagavad_gita_arnold.json",
        "chunks_file": "bhagavad_gita_chunks.jsonl",
        "id_prefix": "bg",
        "default_section": "The Song Celestial",
        "description": "Dialogue between Krishna and Arjuna on selfless action (karma yoga), equanimity, and overcoming doubt.",
    },
    "dhammapada": {
        "id": "dhammapada",
        "name": "Dhammapada",
        "source": "Dhammapada",
        "translation": "Max Müller 1881",
        "collection_name": "dhammapada",
        "raw_file": "dhammapada_muller.json",
        "chunks_file": "dhammapada_chunks.jsonl",
        "id_prefix": "dp",
        "default_section": "Verses of Wisdom",
        "description": "Early Buddhist verses of wisdom on mental discipline, non-attachment, and conquering hatred with love.",
    },
    "stoicism": {
        "id": "stoicism",
        "name": "Meditations (Stoicism)",
        "source": "Meditations",
        "translation": "George Long 1862",
        "collection_name": "stoicism",
        "raw_file": "stoicism_meditations_long.json",
        "chunks_file": "stoicism_chunks.jsonl",
        "id_prefix": "stoic",
        "default_section": "Twelve Books",
        "description": "Marcus Aurelius's reflections on personal virtue, distinguishing internal control from external circumstances.",
    },
}


def create_chunks_from_raw_json(
    raw_path: Path,
    source: str = "Garuda Purana",
    translation: str = "Wood & Subrahmanyam 1911",
    id_prefix: str = "gp",
    default_section: str = "Preta Kanda / Saroddhara",
) -> List[Dict[str, Any]]:
    """Parse raw structured JSON into standardized chunk records."""
    if not raw_path.exists():
        raise FileNotFoundError(f"Source file not found at {raw_path}")

    with open(raw_path, "r", encoding="utf-8") as f:
        chapters = json.load(f)

    chunks: List[Dict[str, Any]] = []

    for ch in chapters:
        chapter_num = ch.get("chapter", 0)
        chapter_title = ch.get("chapter_title", "")
        section = ch.get("section", default_section)

        for v in ch.get("verses", []):
            verse_num = str(v.get("verse", "")).strip()
            text = v.get("text", "").strip()
            topics = v.get("topics", [])

            clean_verse_id = verse_num.replace(" ", "")
            chunk_id = f"{id_prefix}_ch{chapter_num:02d}_v{clean_verse_id}"

            chunk_record = {
                "id": chunk_id,
                "source": source,
                "translation": translation,
                "section": section,
                "chapter": f"Chapter {chapter_num}: {chapter_title}" if "Book" not in chapter_title else chapter_title,
                "chapter_number": chapter_num,
                "chapter_title": chapter_title,
                "verse": verse_num,
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


def ingest_tradition(
    tradition_key: str,
    settings: Optional[Settings] = None,
) -> int:
    """Ingest, chunk, and index a specific scripture tradition into ChromaDB."""
    if tradition_key not in TRADITIONS:
        raise ValueError(f"Unknown tradition '{tradition_key}'. Available: {list(TRADITIONS.keys())}")

    config = TRADITIONS[tradition_key]
    app_settings = settings or get_settings()

    src_path = RAW_DIR / config["raw_file"]
    dst_chunks = CHUNKS_DIR / config["chunks_file"]

    chunks = create_chunks_from_raw_json(
        raw_path=src_path,
        source=config["source"],
        translation=config["translation"],
        id_prefix=config["id_prefix"],
        default_section=config["default_section"],
    )

    save_chunks_to_jsonl(chunks, dst_chunks)

    store = VectorStore(
        db_path=app_settings.VECTOR_DB_PATH,
        collection_name=config["collection_name"],
    )
    indexed_count = store.add_chunks(chunks)
    logger.info(f"Indexed {indexed_count} passages into '{config['collection_name']}'")
    return indexed_count


def ingest_all_traditions(settings: Optional[Settings] = None) -> Dict[str, int]:
    """Ingest all configured wisdom traditions into their respective Chroma collections."""
    results = {}
    for tradition_key in TRADITIONS:
        count = ingest_tradition(tradition_key, settings=settings)
        results[tradition_key] = count
    return results


def ingest_knowledge_base(
    raw_path: Optional[Path] = None,
    chunks_path: Optional[Path] = None,
    settings: Optional[Settings] = None,
) -> int:
    """Backward-compatible ingestion workflow for the default Garuda Purana collection."""
    if raw_path is not None or chunks_path is not None:
        app_settings = settings or get_settings()
        src_path = raw_path or (RAW_DIR / "garuda_purana_wood_subrahmanyam.json")
        dst_chunks = chunks_path or (CHUNKS_DIR / "garuda_purana_chunks.jsonl")
        chunks = create_chunks_from_raw_json(src_path)
        save_chunks_to_jsonl(chunks, dst_chunks)
        store = VectorStore(
            db_path=app_settings.VECTOR_DB_PATH,
            collection_name="garuda_purana",
        )
        return store.add_chunks(chunks)
    return ingest_tradition("garuda_purana", settings=settings)


if __name__ == "__main__":
    results = ingest_all_traditions()
    print("Ingestion complete for all traditions:", results)
