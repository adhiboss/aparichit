# APARICHIT: building.md

How to build it, step by step. Read `content.md` first for what the product says, and `production.md` for how it goes live.

> **Instruction to the builder:** build the "APARICHIT" backend as a standalone Python FastAPI service, in the milestones below. Stop after each milestone so I can test it. Do not train or fine-tune any model. Never fabricate citations. Keep the LLM provider swappable. Create `content.md`, `building.md` and `production.md` in the repo root if they don't exist.

---

## 1. What we are building

A ChatGPT-style assistant that answers every question through the Garuda Purana, plus an anonymous community.

```
User -> Frontend (built separately)
          |
          v
   AI service (Python, FastAPI)
     |- Safety check
     |- Retrieval (Garuda Purana + chosen traditions)
     |- LLM (hosted API, swappable)
     |- Similar-problem matching
     `- Community API (posts, replies, reports)
          |
          v
   Database + vector store
```

We do not train an AI model. We build an AI-powered product around an existing model.

---

## 2. Tech stack

- Python 3.11+, FastAPI, Uvicorn, Pydantic
- LLM: hosted API (primary), Ollama local model (optional comparison)
- Embeddings: small multilingual sentence-transformer that runs on CPU (for example `multilingual-e5-small` or `bge-small`)
- Vector store: ChromaDB (start local; move to a managed option later if needed)
- Relational DB: SQLite for development, PostgreSQL (Supabase or Neon) for production
- Auth: anonymous accounts (random ID plus session token; no email required)
- Tests: pytest

The machine is CPU-only, so generation always goes to a hosted API. Only the small embedding model runs locally.

---

## 3. Folder structure

```
aparichit-ai/
|- content.md
|- building.md
|- production.md
|- app/
|  |- main.py
|  |- config.py
|  |- schemas.py
|  |- llm/            base.py, hosted.py, local.py
|  |- rag/            ingest.py, embeddings.py, store.py, retriever.py
|  |- pipeline/       classify.py, rewrite.py, advise.py, verify.py
|  |- community/      anonymise.py, posts.py, replies.py, match.py, moderation.py
|  |- auth/           anon_accounts.py
|  |- prompts/        system.md, classify.md, advice_format.md
|  `- memory.py
|- data/raw/ and data/chunks/
|- eval/              scenarios.jsonl, run_eval.py
|- tests/
|- .env.example
|- requirements.txt
`- README.md
```

LLM interface (so providers can be swapped by `.env` only):

```python
class LLMProvider(Protocol):
    def generate(self, messages: list[dict], stream: bool = False, **kw): ...
```

---

## 4. Request workflow (one chat message)

```
1.  POST /chat {session_id, message, faith_on, tradition}
2.  Safety check (crisis, medical, harmful)  -> special path if triggered
3.  Load recent chat history for the session
4.  Rewrite message + history into a standalone search query
5.  If faith_on: retrieve top passages from the chosen tradition(s)
6.  Pick mode: grounded / inspired / playful
7.  Build prompt: persona + mode rules + passages + history (+ community context)
8.  Generate with the LLM, streamed
9.  Verify: every citation must match a retrieved passage; remove anything else
10. Return the answer, citations and source labels
11. In parallel: anonymise the problem, embed it, find similar shared posts
12. Return the similar-people cards to show below the answer
```

Steps 11 and 12 run alongside step 8 so the cards are ready when the reply finishes.

---

## 5. Similar-problem matching

- Each problem is anonymised (names, places, numbers, emails, schools and workplaces removed) and embedded.
- Only posts the author chose to share are stored in the community index.
- For a new chat, search the community index for the nearest neighbours (top 3 to 5, above a similarity threshold).
- Never show crisis-flagged posts as matches.
- If nothing is above the threshold, return an empty list and the frontend hides the section.
- Community replies can be given to the LLM as optional context, always labelled `Community experience`.

---

## 6. API contract

**POST `/chat`** and **POST `/chat/stream`** (Server-Sent Events)

```json
// request
{ "session_id": "abc123", "message": "I lied to my parents about my marks",
  "faith_on": true, "tradition": "garuda_purana" }

// response
{
  "answer": "...",
  "mode": "grounded | inspired | playful",
  "citations": [
    { "source": "Garuda Purana", "translation": "Wood & Subrahmanyam 1911",
      "chapter": "Achara Kanda, Ch. 107", "verse": "12", "excerpt": "..." }
  ],
  "source_labels": ["scripture", "ai_suggestion"],
  "similar": [
    { "post_id": "p1", "display_name": "Quiet River", "snippet": "...",
      "reply_count": 8, "similarity": 0.94 }
  ],
  "safety_flag": null
}
```

Community endpoints:

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/anonymous` | Create an anonymous account and session token |
| POST | `/posts` | Share a problem (after anonymising) |
| GET | `/posts/{id}` | Read a post with replies |
| POST | `/posts/{id}/replies` | Add a reply |
| POST | `/reports` | Report a post or reply |
| GET | `/similar?post_id=` | Similar posts |
| GET | `/sessions/{id}` and DELETE | View or clear chat history |
| GET | `/health` | Health check |

Enable CORS for the frontend origin (configurable).

---

## 7. Milestones (build in this order)

1. **M1: Skeleton.** FastAPI plus `/chat` returning an LLM answer with the persona prompt (no retrieval yet).
2. **M2: Knowledge base.** Ingest the Garuda Purana: chunk, embed, store. Test retrieval from a script.
3. **M3: RAG.** Wire retrieval into the pipeline. Add mode selection, structured citations and source labels.
4. **M4: Safety and verification.** Safety classifier, crisis path, citation checker.
5. **M5: Chat experience.** Session memory, query rewriting, streaming endpoint, faith toggle.
6. **M6: Evaluation.** Build the scenario set and scoring script (section 8). Tune prompts and thresholds.
7. **M7: Anonymous accounts and community.** Anonymous auth, posts, replies, reports, anonymiser.
8. **M8: Similar-problem matching.** Embed shared posts, nearest-neighbour search, similar cards in the `/chat` response.
9. **M9: Moderation.** Crisis flagging on posts and replies, report queue, simple admin view.
10. **M10: Other traditions** (optional). Add separate collections behind the faith toggle.
11. **M11: Local-model comparison** (optional). Run the eval on a small Ollama model and compare.
12. **M12: Connect the frontend** to `/chat/stream` and the community endpoints.

---

## 8. Evaluation

Create `eval/scenarios.jsonl` with about 50 cases:

- Serious moral dilemmas (lying, family conflict, money)
- Funny or absurd questions
- Off-topic questions (coding, general knowledge)
- Safety cases (distress, medical, harmful requests)
- Questions with no relevant passage (must not produce a fake citation)
- Matching cases (similar problems must match; unrelated ones must not)

Score each answer on: citation accuracy (zero fabricated quotes), usefulness, tone fit, safety handling, consistency. Run `python eval/run_eval.py` after every change.

---

## 9. Acceptance criteria

- Any message (serious, funny or unrelated) gets a coherent answer in the Garuda Purana-flavoured voice.
- Zero fabricated citations across the eval set.
- Switching `LLM_PROVIDER` needs no code change.
- Streaming works end to end.
- Safety cases are handled correctly in the eval set.
- Similar-people cards appear below the answer when matches exist, and are hidden when they don't.
- Private chats never appear in the community index unless the user shares them.
- Crisis-flagged posts are never shown as matches.

---

## 10. Settings (`.env.example`)

```
LLM_PROVIDER=hosted
LLM_API_KEY=
LLM_MODEL=
EMBEDDING_MODEL=intfloat/multilingual-e5-small
VECTOR_DB_PATH=./data/chroma
DATABASE_URL=sqlite:///./aparichit.db
CORS_ORIGINS=http://localhost:3000
SIMILARITY_THRESHOLD=0.80
RETRIEVAL_THRESHOLD=0.35
DAILY_FREE_MESSAGES=20
```
