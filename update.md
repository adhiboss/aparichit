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

### Entry #9: Safety Protocols: Crisis Intervention & Anonymous Hotlines
- **Category**: `Safety`
- **Milestone**: docs(update): document emergency crisis intervention and safety bypass protocols
- **Summary & Insights**:
  Implemented a dedicated crisis detection guardrail. If severe distress or self-harm ideation is detected, the LLM pipeline is bypassed in favor of compassionate, immediate emergency hotline resources (Vandrevala Foundation, AASRA, Tele-MANAS).

---

### Entry #10: FastAPI Backend Architecture & Lifespan Management
- **Category**: `Backend API`
- **Milestone**: docs(update): log FastAPI backend architecture and lifespan state management
- **Summary & Insights**:
  Designed the FastAPI server with modern async lifespan context handlers. Pre-loads scripture vectors, tradition schemas, and daily flashcard caches at startup for deterministic, zero-cold-start performance.

---

### Entry #11: Server-Sent Events (SSE) Streaming for Contemplative Chat
- **Category**: `Backend API`
- **Milestone**: docs(update): document Server-Sent Events (SSE) streaming for real-time chat
- **Summary & Insights**:
  Integrated chunked token streaming via Server-Sent Events (`/chat/stream`). Enables fluid, immediate typewriter rendering for seekers seeking real-time philosophical discourse.

---

### Entry #12: Scripture Library API & Verse Inspection Endpoints
- **Category**: `Backend API`
- **Milestone**: docs(update): log scripture library API endpoints and chapter/verse query flow
- **Summary & Insights**:
  Built RESTful endpoints (`/traditions`, `/traditions/{id}`, `/library/search`) allowing users to query individual chapters, explore historical context, and inspect original verse translations.

---

### Entry #13: Daily Wisdom Flashcards Engine & Deterministic Daily Seed
- **Category**: `Feature Design`
- **Milestone**: docs(update): document daily wisdom flashcard generation and seed selection
- **Summary & Insights**:
  Created a deterministic date-hashing algorithm (`dayOfYear * 31 + year`) to select a single curated 'Contemplation of the Day' synchronized for all global users while offering access to the full 62-card canon.

---

### Entry #14: Next.js 16 App Router & React 19 Integration
- **Category**: `Frontend`
- **Milestone**: docs(update): log Next.js 16 App Router and React 19 architecture decisions
- **Summary & Insights**:
  Upgraded frontend infrastructure to Next.js 16 with Turbopack and React 19. Leveraged server components for static metadata and fast prerendering paired with interactive client components for dynamic experiences.

---

### Entry #15: Editorial Design System: Charcoal, Gold & Warm Ivory
- **Category**: `Design System`
- **Milestone**: docs(update): document luxury editorial color palette and design tokens
- **Summary & Insights**:
  Established an authentic editorial visual language: deep charcoal background (`#171A1F`), tactile card grey (`#242830`), warm ivory typography (`#E7E1D5`), and sacred muted gold accents (`#B69A61`).

---

