# APARICHIT (अपरिचित) — Engineering & Wisdom Development Log

> A chronological record of technical architecture, scripture curation, engineering breakthroughs, and lessons learned while building APARICHIT.

---

### Entry #1: Project Vision & Architecture: APARICHIT Core Philosophy
- **Category**: `Architecture`
- **Milestone**: docs(update): initialize project update log and architectural vision
- **Summary & Insights**:
  APARICHIT is conceived as an anonymous, AI-guided contemplation sanctuary rooted in classical philosophical traditions. Instead of generic AI responses, every conversation and contemplation card is grounded in verified public-domain sacred texts.

---

### Entry #2: Scripture Ingestion: Garuda Purana Translation Parsing
- **Category**: `Data Pipeline`
- **Milestone**: docs(update): document Garuda Purana scripture extraction and translation history
- **Summary & Insights**:
  Integrated the 1911 Ernest Wood and S. V. Subrahmanyam translation of the Garuda Purana Saroddhara (Preta Kanda). Parsed chapters 1 through 16 into structured JSON records preserving chapter titles and verse ranges.

---

### Entry #3: Scripture Ingestion: Bhagavad Gita Chapter Structuring
- **Category**: `Data Pipeline`
- **Milestone**: docs(update): log Bhagavad Gita chapter structuring and Edwin Arnold edition
- **Summary & Insights**:
  Ingested Sir Edwin Arnold's 1885 poetic translation 'The Song Celestial'. Structured all 18 discourses into standardized chapter metadata, Sanskrit discourse titles, and verbatim English verses.

---

### Entry #4: Scripture Ingestion: Dhammapada Yamaka-Vagga & Thematic Verses
- **Category**: `Data Pipeline`
- **Milestone**: docs(update): log Dhammapada Yamaka-Vagga extraction and Max Müller translation
- **Summary & Insights**:
  Extracted canonical Pali Buddhist teachings from Prof. F. Max Müller's 1881 translation (Sacred Books of the East, Vol. X). Curated verses across Twin Verses, Thought, The Wise Man, and Self-Mastery.

---

### Entry #5: Scripture Ingestion: Marcus Aurelius' Meditations
- **Category**: `Data Pipeline`
- **Milestone**: docs(update): document Stoic Meditations curation from George Long 1862 edition
- **Summary & Insights**:
  Curated key aphorisms and philosophical entries from George Long's 1862 translation of Marcus Aurelius' 'Meditations'. Mapped Roman Stoic principles across Books 2 through 12.

---

### Entry #6: Vector Embeddings & Semantic Indexing
- **Category**: `RAG Backend`
- **Milestone**: docs(update): log SentenceTransformers embedding generation and vector indexing
- **Summary & Insights**:
  Employed the SentenceTransformers 'all-MiniLM-L6-v2' dense bi-encoder model to generate 384-dimensional dense vectors for all scripture chunks and thematic verses.

---

### Entry #7: In-Memory Vector Search & Retrieval Mechanics
- **Category**: `RAG Backend`
- **Milestone**: docs(update): document zero-hallucination semantic search and cosine similarity
- **Summary & Insights**:
  Implemented high-performance cosine similarity ranking over pre-computed normalized embeddings in memory. Ensures sub-20ms retrieval latencies without requiring complex external vector databases.

---

### Entry #8: RAG Prompt Engineering & Strict Grounding
- **Category**: `RAG Backend`
- **Milestone**: docs(update): log RAG prompt engineering and strict grounding principles
- **Summary & Insights**:
  Architected contextual RAG prompts that mandate verbatim scripture citation. Configured the model to synthesize ancient guidance with modern therapeutic empathy while strictly forbidding citation fabrication.

---

