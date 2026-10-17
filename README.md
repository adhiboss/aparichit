# APARICHIT (अपारिचित)

> **AI-powered advice platform inspired by the Garuda Purana, featuring anonymous community discussions and similar-problem matching.**

---

## 1. Project Overview

APARICHIT is an anonymous, compassion-driven advice service. Users bring moral, emotional, or philosophical dilemmas—serious, playful, or general—and receive thoughtful guidance framed through the timeless ethical themes of the Garuda Purana (such as *karma*, *dharma*, *satya*, and *dana*).

Key principles:
- **Calm, Wise, Non-preachy Persona:** Acts as a wise elder with gentle humor, never judging, shaming, or threatening with hell/punishment.
- **Strict Citation Integrity:** Never fabricates citations, chapter numbers, or verses. Citations are only provided when backed by verified public-domain source text.
- **Spiritual Guidance Toggle (`faith_on`):** Off by default. Users who want spiritual guidance can turn it on; those who do not receive purely practical, grounded advice.
- **Provider Agnostic:** Easily swappable between hosted APIs (OpenAI-compatible), local models (Ollama), and testing mocks via `.env` without modifying pipeline code.
- **Privacy-First Anonymous Community:** Chats are strictly private. Only problems users explicitly choose to share are anonymized, embedded, and made available for similar-problem matching.

---

## 2. Directory Structure

```
GarudaPuranaAI/
├── content.md             # Product tone, persona rules, and content policies
├── building.md            # Architecture, milestone specifications, and API contracts
├── production.md          # Deployment checklist, privacy, safety, and monitoring
├── app/
│   ├── main.py            # FastAPI service with CORS and route handlers
│   ├── config.py          # Pydantic BaseSettings configuration
│   ├── schemas.py         # Request and response API models
│   ├── prompts/           # Persona and advice formatting prompts
│   │   ├── system.md
│   │   └── advice_format.md
│   ├── llm/               # Swappable LLM providers
│   │   ├── base.py        # LLMProvider protocol
│   │   ├── hosted.py      # OpenAI-compatible hosted API provider
│   │   ├── local.py       # Ollama local provider
│   │   └── mock.py        # Deterministic offline mock provider
│   └── pipeline/          # Query processing, advice generation, verification
│       └── advise.py
├── data/
│   └── raw/
│       └── SOURCES.md     # Public domain source attribution and licensing
├── tests/
│   ├── conftest.py
│   ├── test_config.py
│   ├── test_health.py
│   ├── test_chat.py
│   └── test_llm_provider.py
├── .env.example
├── requirements.txt
└── README.md
```

---

## 3. Getting Started

### Prerequisites
- Python 3.11+
- (Optional) Ollama for local LLM inference

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd GarudaPuranaAI

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

### Running the API Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Running the Test Suite

```bash
python -m pytest -v
```

---

## 4. API Endpoints

### `GET /health`
Returns service status, application version, and active LLM provider.

### `POST /chat`
Generates advice for a user query.

**Example Request:**
```json
{
  "session_id": "session_abc123",
  "message": "I lied to my parents about my exam grades and now I feel terrible.",
  "faith_on": true,
  "tradition": "garuda_purana"
}
```

**Example Response:**
```json
{
  "answer": "I hear the distress and weight in your heart. In the reflection of ancient wisdom, every action carries consequence, yet every dawn brings the capacity for truth and renewal...",
  "mode": "inspired",
  "citations": [],
  "source_labels": ["ai_suggestion"],
  "similar": [],
  "safety_flag": null
}
```

---

## 5. Implementation Milestones

- [x] **Milestone 1: Skeleton.** FastAPI + `/chat` returning an LLM answer with persona prompt (no retrieval).
- [x] **Milestone 2: Knowledge base.** Ingest public domain Garuda Purana: chunk, embed, store. Test retrieval from a script.
- [x] **Milestone 3: RAG.** Retrieval-augmented generation, mode selection, structured citations.
- [ ] **Milestone 4: Safety & verification.** Safety classifier, crisis path, citation checker.
- [ ] **Milestone 5: Chat experience.** Session memory, query rewriting, streaming SSE endpoint, faith toggle.
- [ ] **Milestone 6: Evaluation.** 50+ evaluation scenarios and automated scoring framework.
- [ ] **Milestone 7: Anonymous accounts & community.** Anonymous auth, posts, replies, reports, anonymizer.
- [ ] **Milestone 8: Similar-problem matching.** Vector embedding of shared posts, nearest-neighbor matching.
- [ ] **Milestone 9: Moderation.** Crisis flagging on posts/replies, report queue, moderation view.
- [ ] **Milestone 10: Other traditions (optional).** Separate collections behind faith toggle.
- [ ] **Milestone 11: Local-model comparison (optional).** Local evaluation with Ollama.
- [ ] **Milestone 12: Frontend integration.** Connect frontend to API.
