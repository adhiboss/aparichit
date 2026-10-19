

![APARICHIT Application Screenshot](screen.png)
# APARICHIT (अपारिचित)

### Ancient Wisdom. Modern Perspective. Anonymous Support.

**APARICHIT** is an AI-powered advice platform inspired by the ethical and philosophical themes of the *Garuda Purana*. It helps people explore moral, emotional, and philosophical dilemmas through thoughtful AI-generated guidance, anonymous community discussions, and similar-problem matching.

The platform combines traditional wisdom with modern AI while prioritizing compassion, source accuracy, user privacy, and practical reasoning.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Our Approach](#our-approach)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Implementation Status](#implementation-status)
- [Privacy and Safety](#privacy-and-safety)
- [Testing](#testing)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## Overview

People often face situations where they need advice but hesitate to share their problems because of embarrassment, fear of judgment, or concerns about privacy.

APARICHIT provides a space where users can discuss their dilemmas anonymously and receive thoughtful perspectives without being shamed or pressured into a particular belief system.

The platform draws on ethical concepts such as:

- **Karma** — actions and their consequences.
- **Dharma** — responsibility, duty, and ethical conduct.
- **Satya** — truthfulness and honesty.
- **Dana** — generosity and giving.

When users enable spiritual guidance, the platform can explore relevant philosophical and spiritual perspectives. When spiritual guidance is disabled, it focuses on practical, grounded advice.

### Core Principles

- **Compassion over judgment:** Respond with empathy rather than shame or condemnation.
- **Evidence over fabricated authority:** Never invent scriptural quotations, verses, chapter numbers, or citations.
- **Privacy by default:** Private conversations remain private unless users explicitly choose to share a problem.
- **User choice:** Spiritual guidance is optional.
- **Provider independence:** Support interchangeable hosted, local, and mock language-model providers.
- **Responsible AI:** Recognize sensitive situations and apply appropriate safety and moderation procedures.

---

## Problem Statement

People experiencing moral conflicts, personal dilemmas, or emotional uncertainty may struggle to find a space where they can express themselves freely and receive balanced guidance.

Existing advice sources may involve social pressure, public exposure, inconsistent information, or responses that do not reflect the user's personal values.

APARICHIT addresses this problem by combining AI-assisted reflection, anonymous peer support, and source-aware philosophical guidance in a privacy-conscious platform.

## Our Approach

APARICHIT brings together three core capabilities:

1. **AI-powered advice:** Generate contextual responses using practical reasoning and, when requested, relevant philosophical or spiritual perspectives.
2. **Anonymous community:** Allow users to share selected dilemmas and receive supportive replies without making their private AI conversations public.
3. **Similar-problem matching:** Discover related, explicitly shared community problems using semantic similarity rather than relying only on keyword matching.

The goal is not to replace professional advice or dictate what users should believe. It is to help them examine situations from different perspectives and make more informed decisions.

---

## Key Features

### 1. AI-Powered Advice

Users can describe a dilemma in natural language and receive a structured response designed to be thoughtful, relevant, and nonjudgmental.

The advice pipeline is designed to support retrieval-augmented generation (RAG), allowing the system to retrieve relevant source material before generating a response.

### 2. Optional Spiritual Guidance

The `faith_on` setting controls whether spiritual or philosophical guidance is included.

| Setting | Behavior |
|---|---|
| `faith_on: false` | Practical, grounded advice without unsolicited spiritual framing. |
| `faith_on: true` | Relevant spiritual or philosophical perspectives may be included. |

The platform is designed to support separate traditions, including:

- Garuda Purana
- Bhagavad Gita
- Dhammapada
- Stoicism

Tradition descriptions and publication metadata should only be displayed when supported by verified source records.

### 3. Citation Integrity

APARICHIT is designed to distinguish verified source material from AI-generated interpretation.

- Citations must be supported by retrieved source text.
- Chapter, verse, and page references must not be fabricated.
- Interpretations and paraphrases must not be presented as direct quotations.
- If no suitable verified source is available, the response should acknowledge that limitation.

### 4. Anonymous Accounts

The anonymous authentication endpoint is designed to create an account with a randomized display name and a secret session token.

This allows users to participate without requiring their public community identity to be their real-world identity.

### 5. Anonymous Community Discussions

Users can choose to share a dilemma with the community.

The community system supports:

- Publicly shared problems.
- Supportive replies.
- Reports against posts or replies.
- Privacy-conscious content anonymization.
- Moderation workflows for reported or safety-sensitive content.

Private AI conversations must not automatically become public posts.

### 6. Similar-Problem Matching

APARICHIT uses semantic embeddings and vector similarity to identify community problems with related meanings.

The `/similar` endpoint supports searches based on a post ID or a natural-language description. When matching an existing post, the original post should be excluded from its own results.

This can help users discover how others have approached comparable situations.

### 7. Safety and Moderation

The backend is designed to flag potentially sensitive or crisis-related content for appropriate handling.

Administrative workflows include reviewing reports, taking moderation actions, and handling items held for crisis review.

These mechanisms support responsible community management; automated classification should not be treated as a perfect assessment of a person's situation.

### 8. Swappable Language-Model Providers

The project separates language-model access from the advice pipeline.

Supported provider implementations are intended to include:

- Hosted OpenAI-compatible APIs.
- Local models through Ollama.
- A deterministic mock provider for offline development and testing.

Provider selection should be configurable through environment variables instead of requiring changes to the core advice pipeline.

---

## How It Works

The intended advice flow is:

1. A user submits a question and selects their spiritual-guidance preference.
2. The backend validates the request.
3. Safety checks identify content requiring special handling.
4. When appropriate, the retrieval pipeline searches the selected knowledge base.
5. The configured language model generates a response using the relevant context and persona instructions.
6. Citation verification checks whether source references are supported.
7. The API returns the advice, response mode, verified citations, related problems, and any applicable safety information.

Community sharing follows a separate flow:

1. The user explicitly chooses to share a problem.
2. The backend applies validation, anonymization, and safety checks.
3. Eligible content is published according to the moderation policy.
4. Approved content may be embedded and indexed for similar-problem matching.
5. Users can reply to posts or report content that requires review.

**Important:** Exact behavior depends on the implemented pipeline, database, and moderation configuration. The steps above describe the intended architecture.

---

## Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Backend API | Python, FastAPI | API routes and application logic |
| Request validation | Pydantic | Structured request and response schemas |
| AI integration | Hosted LLM APIs | Advice generation |
| Local inference | Ollama | Optional local-model execution |
| Testing provider | Mock LLM | Deterministic development and testing |
| Retrieval | RAG pipeline | Source-grounded advice |
| Embeddings | Embedding model | Semantic representation of text |
| Vector database | ChromaDB | Source retrieval and similar-problem matching |
| Configuration | Environment variables | Provider and application settings |
| Frontend | Next.js | Web application interface |
| Testing | pytest | Automated backend tests |

The final production database, hosting platform, and deployment architecture should be documented according to the actual configuration used by the project.

---

## Project Structure

```text
GarudaPuranaAI/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── schemas.py
│   ├── prompts/
│   │   ├── system.md
│   │   └── advice_format.md
│   ├── llm/
│   │   ├── base.py
│   │   ├── hosted.py
│   │   ├── local.py
│   │   └── mock.py
│   └── pipeline/
│       └── advise.py
├── data/
│   └── raw/
│       └── SOURCES.md
├── tests/
│   ├── conftest.py
│   ├── test_config.py
│   ├── test_health.py
│   ├── test_chat.py
│   └── test_llm_provider.py
├── frontend/
├── content.md
├── building.md
├── production.md
├── .env.example
├── requirements.txt
└── README.md
```

Some files or directories may differ depending on the current repository state. Update this tree whenever the project structure changes.

---

## Getting Started

### Prerequisites

Install the following before running the project:

- Python 3.11 or later.
- pip.
- Git.
- Node.js and npm, if running the Next.js frontend.
- Ollama, optionally, if using a local language model.

### 1. Clone the Repository

```bash
git clone <repo-url>
cd GarudaPuranaAI
```

Replace `<repo-url>` with the actual repository URL.

### 2. Create a Virtual Environment

**Windows — PowerShell**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, use the appropriate activation method for your system or invoke the environment's Python executable directly.

**Linux or macOS**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a local `.env` file using the provided example:

**Windows — PowerShell**

```powershell
Copy-Item .env.example .env
```

**Linux or macOS**

```bash
cp .env.example .env
```

Edit `.env` and configure the required provider, API credentials, model settings, and application configuration.

Do not commit real credentials to version control.

### 5. Verify the Installation

Run the automated test suite:

```bash
python -m pytest -v
```

Resolve configuration or dependency errors before proceeding.

---

## Environment Configuration

Use `.env.example` as the authoritative list of supported configuration variables.

Depending on the current implementation, configuration may include:

| Setting | Purpose |
|---|---|
| LLM provider | Selects the hosted, local, or mock provider |
| Hosted API key | Authenticates with the selected hosted provider |
| Model name | Selects the configured language model |
| Ollama base URL | Specifies the local inference server |
| Database settings | Configures persistent application storage |
| Vector-store settings | Configures the ChromaDB index location |
| Admin token | Protects administrative moderation endpoints |
| CORS origins | Controls which frontend origins may call the API |

The actual variable names, defaults, and required values must match `.env.example` and `app/config.py`. This table describes configuration categories, not a guarantee that every variable is currently implemented.

---

## Running the Application

### Start the Backend

From the backend project root:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The development server should be available at:

- **API base URL:** `http://127.0.0.1:8000`
- **Interactive API documentation:** `http://127.0.0.1:8000/docs`
- **Health endpoint:** `http://127.0.0.1:8000/health`

Use the health endpoint to verify that the application starts successfully. The response should reflect the fields implemented by the current version.

### Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

Ensure the frontend's API base URL points to the running backend and that the backend's CORS configuration allows the frontend origin.

---

## API Reference

Interactive request and response schemas are available at `/docs` when the backend is running.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Check service status and provider information |
| `POST` | `/chat` | Generate advice for a user query |
| `POST` | `/auth/anonymous` | Create an anonymous account or session |
| `POST` | `/posts` | Submit a community post |
| `GET` | `/posts` | Retrieve eligible published posts |
| `GET` | `/posts/{id}` | Retrieve a post and its replies |
| `POST` | `/posts/{id}/replies` | Reply to a community post |
| `POST` | `/reports` | Report a post or reply |
| `GET` | `/similar` | Search for semantically similar problems |
| `GET` | `/traditions` | Retrieve supported tradition metadata |
| `GET` | `/admin/reports` | Review submitted moderation reports |
| `POST` | `/admin/reports/{id}/action` | Resolve a moderation report |
| `GET` | `/admin/crisis` | Review items held for crisis moderation |
| `POST` | `/admin/crisis/{target_type}/{id}/action` | Take an action on a crisis-review item |

The project also specifies a streaming endpoint, `/chat/stream`, for incremental responses.

Endpoint availability, HTTP methods, query parameters, authentication requirements, and response schemas must be verified against the running application. Administrative endpoints must enforce authorization on the server.

### Example: Chat Request

```json
{
  "session_id": "session_abc123",
  "message": "I lied to my parents about my exam grades and now I feel terrible.",
  "faith_on": true,
  "tradition": "garuda_purana"
}
```

### Example: Chat Response

```json
{
  "answer": "A thoughtful response grounded in the available context.",
  "mode": "inspired",
  "citations": [],
  "source_labels": ["ai_suggestion"],
  "similar": [],
  "safety_flag": null
}
```

These examples illustrate the documented response shape; they are not a guarantee of the exact output produced by every current implementation. A response with an empty citations array should not imply that the answer contains verified scriptural quotations.

---

## Implementation Status

The project plan records the following milestone status:

| Milestone | Status |
|---|---|
| 1. FastAPI skeleton and initial chat | Complete |
| 2. Knowledge-base ingestion | Complete |
| 3. Retrieval-augmented generation | Complete |
| 4. Safety and citation verification | Complete |
| 5. Session memory, streaming, and faith toggle | Complete |
| 6. Evaluation framework | Complete |
| 7. Anonymous accounts and community | Complete |
| 8. Similar-problem matching | Complete |
| 9. Moderation workflows | Complete |
| 10. Optional philosophical traditions | Complete |
| 11. Local-model comparison using Ollama | Pending |
| 12. Frontend integration | Complete |

**Status note:** These checkboxes reflect the supplied project plan, not an independent code audit. Verify the actual code, tests, security controls, and deployment configuration before describing the application as production-ready.

---

## Privacy and Safety

Privacy and responsible handling of sensitive content are foundational requirements.

### Privacy

- Private AI chats must not be published automatically.
- Users must explicitly choose to share content with the community.
- Public content should be scrubbed of identifying information where possible.
- Session tokens and administrative credentials must be protected.
- Sensitive data and authentication tokens should not be written to application logs.
- Retention, deletion, and data-access policies should be documented before public release.

An anonymous display name does not by itself guarantee complete anonymity. Infrastructure logs, network metadata, session handling, and third-party AI providers may introduce additional privacy considerations.

### Safety

- Avoid judgment, shame, coercion, and fear-based religious messaging.
- Never invent scriptural sources or present generated interpretations as verified quotations.
- Treat crisis classification as an aid to review, not a perfect safety guarantee.
- Provide appropriate crisis resources when needed and verify that those resources are current.
- Do not use religious arguments to justify violence or discrimination.
- Make clear that AI-generated guidance is not a substitute for qualified medical, mental-health, legal, or financial professionals.

### Security Before Public Launch

Before inviting a large audience, verify:

- Rate limiting and abuse prevention.
- Authentication and authorization for protected endpoints.
- Secure storage of secrets and session tokens.
- Input validation and request-size limits.
- CORS restrictions.
- Database backups and recovery procedures.
- Moderation coverage and incident response.
- Data deletion and vector-index cleanup.
- AI-provider limits, costs, and failure handling.

---

## Testing

Run the backend tests with:

```bash
python -m pytest -v
```

The supplied test structure covers configuration, health checks, chat behavior, and language-model provider integration.

Before a public release, expand automated testing to cover:

- Invalid and missing request fields.
- Hosted, local, and mock provider behavior.
- Provider timeouts and API failures.
- Streaming responses and client disconnects.
- Citation verification and unsupported source references.
- Anonymous session authentication and access control.
- Private-chat isolation.
- Post anonymization and moderation.
- Similarity search and exclusion of the original post.
- Removal and restoration of vector-index entries.
- Administrative authorization.
- Rate limits and concurrent requests.

Passing unit tests alone does not establish that the system is secure, scalable, or safe for public use.

---

## Future Improvements

Potential next steps include:

- Complete local-model benchmarking with Ollama.
- Expand evaluation datasets for advice quality, citation accuracy, and safety.
- Improve retrieval quality and source-level provenance.
- Add observability for latency, errors, token usage, and provider availability.
- Load-test chat streaming and semantic search.
- Improve community moderation tools and operational workflows.
- Document the production database, hosting, backup, and recovery architecture.
- Establish clear data-retention and account-deletion procedures.

---

## Contributing

Contributions should preserve APARICHIT's core principles: compassion, source accuracy, privacy, and responsible AI.

A useful contribution workflow is:

1. Create a feature branch.
2. Keep changes focused and document architectural decisions.
3. Add or update automated tests.
4. Verify the relevant tests locally.
5. Update documentation when endpoints, configuration, or behavior changes.
6. Submit a pull request describing the change and its limitations.

Do not add scriptural citations, translations, or publication metadata without verifying their sources.

---

## Disclaimer

APARICHIT is an AI-assisted reflection and community-support project. Its responses may contain errors and should not be treated as authoritative religious interpretation or professional advice.

The platform aims to support reflection and informed decision-making, not to dictate beliefs or replace qualified human support.

## License

Add the project's actual license before distributing the repository publicly. Do not assume that source texts, translations, datasets, and application code all share the same license.
