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

### Entry #16: Smooth Kinetic Scrolling with Lenis
- **Category**: `Frontend UX`
- **Milestone**: docs(update): log Lenis smooth scroll integration and momentum physics
- **Summary & Insights**:
  Integrated Lenis smooth scrolling with calibrated momentum and inertial damping, giving the reading experience an elegant, meditative magazine feel.

---

### Entry #17: Atmospheric Visuals: Vanta Birds Dynamic Canvas
- **Category**: `Frontend UX`
- **Milestone**: docs(update): document ambient Vanta Birds atmospheric background setup
- **Summary & Insights**:
  Engineered subtle, non-distracting 3D avian flight dynamics using Three.js and Vanta Birds in the background. Creates depth and an ethereal sense of sanctuary without compromising readability.

---

### Entry #18: Responsive Navigation Architecture: Mobile Dock & Desktop Header
- **Category**: `Frontend UX`
- **Milestone**: docs(update): log responsive navigation architecture and mobile bottom dock
- **Summary & Insights**:
  Constructed dual-mode navigation: a streamlined header with gold brand seal on desktop and an ergonomic thumb-friendly bottom dock navigation bar on mobile devices.

---

### Entry #19: Anonymous Session Management & Poetic Pseudonyms
- **Category**: `Privacy`
- **Milestone**: docs(update): document anonymous session management and poetic pseudonyms
- **Summary & Insights**:
  Users require no phone numbers or passwords. The system generates poetic anonymous identities (e.g., 'Silent Pilgrim', 'Serene Wanderer', 'Solitary Ascetic') paired with client-held UUID session tokens.

---

### Entry #20: Scripture Wisdom Library: Multi-Tradition Explorer
- **Category**: `Feature Design`
- **Milestone**: docs(update): log multi-tradition scripture library interface and tab state
- **Summary & Insights**:
  Built a tabbed scripture explorer allowing seamless transitions between Garuda Purana, Bhagavad Gita, Dhammapada, and Stoicism, complete with chapter navigation and verse drawers.

---

### Entry #21: 3D Perspective Card Flipping Stage
- **Category**: `Feature Design`
- **Milestone**: docs(update): document 3D card stage flip mechanics and perspective styling
- **Summary & Insights**:
  Developed a tactile 3D card flipping stage using CSS 3D transforms (`perspective: 1400px`, `transform-style: preserve-3d`). Clicking flips the card smoothly between ancient verse and contemporary interpretation.

---

### Entry #22: Interactive Deck Navigation & Circular Index Math
- **Category**: `Feature Design`
- **Milestone**: docs(update): log deck navigation state and circular previous/next math
- **Summary & Insights**:
  Added Previous (`<`) and Next (`>`) controls that cycle continuously through the 62-card canon with modulo wrapping, allowing seekers to explore the entire wisdom collection directly within the 3D stage.

---

### Entry #23: Surprise Me: Non-Repeating Random Card Draw
- **Category**: `Feature Design`
- **Milestone**: docs(update): document non-repeating random wisdom card selector algorithm
- **Summary & Insights**:
  Implemented a 'Surprise Me' random draw function that samples uniformly from the card deck while guaranteeing the drawn card is different from the currently mounted card.

---

### Entry #24: Dynamic Tradition Filter Pills on Card Stage
- **Category**: `Feature Design`
- **Milestone**: docs(update): log dynamic tradition filtering within the active 3D card stage
- **Summary & Insights**:
  Introduced instant filter pills (All, Bhagavad Gita, Garuda Purana, Dhammapada, Stoicism) directly above the 3D stage, enabling focused contemplation on specific spiritual lineages.

---

### Entry #25: Sanctuary Reading List: LocalStorage Bookmark System
- **Category**: `Feature Design`
- **Milestone**: docs(update): document localStorage bookmark persistence for sanctuary reading list
- **Summary & Insights**:
  Engineered offline-ready bookmarking for contemplation cards using SSR-safe localStorage utilities. Users can curate a personal repository of verses that speak to their soul.

---

### Entry #26: One-Click Quotation & Academic Citation Sharing
- **Category**: `Feature Design`
- **Milestone**: docs(update): log clipboard sharing formatting with verified academic citations
- **Summary & Insights**:
  Integrated a one-click clipboard copy utility that formats the quote with quotation marks, chapter/verse citation, and historical translator metadata for effortless sharing.

---

### Entry #27: Reflect Action: Bridging Wisdom Cards to APARICHIT Chat
- **Category**: `Feature Design`
- **Milestone**: docs(update): document cross-module reflection bridge connecting cards to chat
- **Summary & Insights**:
  Built a seamless transition from the flashcard back face directly into an interactive AI dialogue. Clicking 'Reflect with APARICHIT' passes the passage into chat with verified scripture context pre-loaded.

---

### Entry #28: Wisdom Chronicle: Full Archive Grid Layout
- **Category**: `Feature Design`
- **Milestone**: docs(update): log wisdom chronicle grid layout and responsive card sizing
- **Summary & Insights**:
  Designed the 'Chronicle' sub-tab featuring an editorial card grid showing all 62 cards categorized by tradition, complete with search filtering, topic badges, and inline flipping.

---

### Entry #29: Saved Reading List: Personal Contemplation Management
- **Category**: `Feature Design`
- **Milestone**: docs(update): document personal saved contemplation reading list filtering
- **Summary & Insights**:
  Created a dedicated 'Saved' sub-tab displaying only the user's bookmarked cards with an empty-state illustration encouraging seekers to build their personal philosophical treasury.

---

### Entry #30: Debugging CSS 3D Transforms: Height Collapse Resolution
- **Category**: `Frontend Engineering`
- **Milestone**: docs(update): document debugging and fixing CSS height collapse in 3D card stage
- **Summary & Insights**:
  Identified and resolved a classic CSS gotcha: when an outer container uses `min-height` without fixed `height`, child elements with `height: 100%` resolve to `auto`. Fixed by assigning explicit height to the 3D stage and rotator.

---

### Entry #31: Cross-Browser WebKit Backface-Visibility Support
- **Category**: `Frontend Engineering`
- **Milestone**: docs(update): log WebKit backface-visibility cross-browser compatibility fix
- **Summary & Insights**:
  Added explicit `-webkit-backface-visibility: hidden` vendor prefixes alongside standard `backface-visibility: hidden` to guarantee seamless 3D flips without rendering artifacts on Safari and iOS browsers.

---

### Entry #32: Mobile Touch Optimization & Viewport Zoom Prevention
- **Category**: `Mobile UX`
- **Milestone**: docs(update): document mobile touch optimization and viewport zoom prevention
- **Summary & Insights**:
  Configured viewport meta tags and 16px minimum input font sizes to eliminate disruptive automatic iOS zoom on focus, ensuring an app-like feel on mobile browsers.

---

### Entry #33: iOS Safe-Area Inset Architecture
- **Category**: `Mobile UX`
- **Milestone**: docs(update): log iOS safe-area inset handling for notch and home indicator
- **Summary & Insights**:
  Applied CSS `env(safe-area-inset-bottom)` and `env(safe-area-inset-top)` variables to prevent floating navigation elements from colliding with device notches or gesture navigation bars.

---

### Entry #34: Community Campfire: Anonymous Peer Sanctuary
- **Category**: `Community`
- **Milestone**: docs(update): document community campfire anonymous peer support system
- **Summary & Insights**:
  Implemented the Community Campfire feed where users share anonymous reflections on grief, anxiety, duty, and peace, receiving gentle empathetic validation from fellow seekers.

---

### Entry #35: Empathetic Moderation & Client-Side Filtering
- **Category**: `Community`
- **Milestone**: docs(update): log empathetic community moderation and ephemeral filtering
- **Summary & Insights**:
  Designed a lightweight content safety layer that filters harmful terminology and ensures discussions remain aligned with mutual philosophical support and sanctuary ethos.

---

### Entry #36: Atmospheric Soundscapes: Meditative Audio Immersion
- **Category**: `Audio UX`
- **Milestone**: docs(update): document ambient soundscape integration for contemplative focus
- **Summary & Insights**:
  Integrated subtle audio players for contemplative soundscapes (Tibetan singing bowls, gentle temple bells, rain ambience) to enhance deep reading and reflection.

---

### Entry #37: Scripture Data Integrity Testing: 62 Canonical Cards
- **Category**: `Testing`
- **Milestone**: docs(update): log validation and data integrity tests for 62 scripture cards
- **Summary & Insights**:
  Created automated schema integrity checks verifying that all 62 flashcards possess non-empty passages, verified chapter/verse citations, plain-language commentaries, and practical reflections.

---

### Entry #38: Frontend Automated Test Suite with Node Native Test Runner
- **Category**: `Testing`
- **Milestone**: docs(update): document frontend automated test suite with native node test runner
- **Summary & Insights**:
  Constructed a lightweight, zero-dependency test suite running on Node.js `--experimental-strip-types`, validating API clients, SSE stream parsers, and SSR-safe storage functions in under 1 second.

---

### Entry #39: Backend Contract Testing & Integration Verification
- **Category**: `Testing`
- **Milestone**: docs(update): log backend contract testing for auth, chat, and traditions
- **Summary & Insights**:
  Verified all backend REST contracts against FastAPI schemas: health checks, tradition details, crisis safety triggers, anonymous authentication, and library flashcards.

---

### Entry #40: Next.js Turbopack Optimization & Static Prerendering
- **Category**: `Performance`
- **Milestone**: docs(update): document Next.js Turbopack build optimization and static prerendering
- **Summary & Insights**:
  Optimized Turbopack build pipeline to statically prerender all key routes (`/`, `/library`, `/chat`, `/community`, `/profile`), resulting in instantaneous route transitions.

---

### Entry #41: Deployment Readiness & Environment Configuration
- **Category**: `DevOps`
- **Milestone**: docs(update): log environment variable setup and deployment readiness criteria
- **Summary & Insights**:
  Standardized `.env.example` configurations across frontend and backend (`NEXT_PUBLIC_API_URL`, `EMBEDDING_MODEL`, `ALLOWED_ORIGINS`) to streamline Docker and cloud deployments.

---

### Entry #42: Error Boundary Architecture & Offline Fallback Strategy
- **Category**: `Resilience`
- **Milestone**: docs(update): document error boundary architecture and offline fallback strategies
- **Summary & Insights**:
  Equipped client components with graceful degradation: if the backend server is temporarily unreachable, the frontend falls back to verified bundled scripture flashcards without disruption.

---

### Entry #43: Frontend Performance Benchmarking & Minimal Layout Shifts
- **Category**: `Performance`
- **Milestone**: docs(update): log frontend performance benchmarking and minimal hydration shift
- **Summary & Insights**:
  Eliminated Cumulative Layout Shift (CLS) on the card viewer by enforcing fixed dimensional aspect ratios and using `suppressHydrationWarning` on client-rendered calendar dates.

---

### Entry #44: Lesson Learned: SSR Hydration Safety with Calendar Dates
- **Category**: `Lessons Learned`
- **Milestone**: docs(update): document lessons learned on SSR hydration safety with date formatting
- **Summary & Insights**:
  Learned that rendering `new Date().toLocaleDateString()` on the server causes hydration mismatches due to timezone differences between the build server and client browser. Resolved via `suppressHydrationWarning` and mounted state checks.

---

### Entry #45: Lesson Learned: Resolving Percentage Heights in Min-Height Parents
- **Category**: `Lessons Learned`
- **Milestone**: docs(update): document lessons learned on percentage heights in min-height parents
- **Summary & Insights**:
  Mastered the CSS box model quirk regarding percentage heights inside containers having only `min-height`. Explicit fixed heights on both container and 3D rotator ensure predictable rendering across all browsers.

---

### Entry #46: Lesson Learned: Scripture Grounding Eliminates AI Hallucinations
- **Category**: `Lessons Learned`
- **Milestone**: docs(update): document lessons learned on scripture grounding to prevent hallucination
- **Summary & Insights**:
  Discovered that requiring LLMs to cite exact verse strings and restricting commentary to grounded philosophical extrapolation completely prevents hallucinated quotes and spurious theological attributions.

---

### Entry #47: Lesson Learned: Translating Classical Prose for Modern Seekers
- **Category**: `Lessons Learned`
- **Milestone**: docs(update): document lessons learned on translating classical prose for modern seekers
- **Summary & Insights**:
  Found that pairing verbatim 19th-century public-domain translations with contemporary plain-language commentaries creates the ideal balance of classical authenticity and accessible emotional resonance.

---

### Entry #48: Lesson Learned: Mobile-First Card Stages & Ergonomics
- **Category**: `Lessons Learned`
- **Milestone**: docs(update): document lessons learned on mobile-first card stages and touch targets
- **Summary & Insights**:
  Refined card interaction zones: separated card flipping from bookmarking, sharing, and navigation buttons using event bubbling prevention (`e.stopPropagation()`) for effortless single-handed mobile navigation.

---

### Entry #49: Philosophical Deep Dive: Marcus Aurelius & Dichotomy of Control
- **Category**: `Philosophy`
- **Milestone**: docs(update): log philosophical study on Marcus Aurelius and dichotomy of control
- **Summary & Insights**:
  Integrated core Stoic teachings from Meditations on distinguishing between external events beyond our influence and internal judgments within our sovereign domain.

---

### Entry #50: Philosophical Deep Dive: Bhagavad Gita & Nishkama Karma
- **Category**: `Philosophy`
- **Milestone**: docs(update): log philosophical study on Bhagavad Gita and Nishkama Karma
- **Summary & Insights**:
  Embedded the foundational principle of selfless action (Karmanye Vadhikaraste): dedicating effort wholly to ethical duty without anxious obsession over worldly outcomes.

---

### Entry #51: Philosophical Deep Dive: Dhammapada & Mindfulness of Habit
- **Category**: `Philosophy`
- **Milestone**: docs(update): log philosophical study on Dhammapada and mental discipline
- **Summary & Insights**:
  Grounding in Dhammapada Yamaka-Vagga teachings on mental conditioning: how thoughts sculpt character, and how mindfulness dissolves accumulated grief.

---

### Entry #52: Philosophical Deep Dive: Garuda Purana & Moral Responsibility
- **Category**: `Philosophy`
- **Milestone**: docs(update): log philosophical study on Garuda Purana and moral agency
- **Summary & Insights**:
  Grounded Garuda Purana Saroddhara passages focusing on individual moral agency, the impermanence of physical form, and the enduring power of virtuous deeds.

---

### Entry #53: Scripture Metadata Normalization Across Chapters & Verses
- **Category**: `Data Integrity`
- **Milestone**: docs(update): document scripture metadata normalization across chapters and verses
- **Summary & Insights**:
  Standardized scripture metadata formatting across all 4 canons: uniform source strings, verified translator citations, and structured numeric chapter/verse ranges.

---

### Entry #54: UX Micro-Animations, Gold Accents & Transition Easing
- **Category**: `UI Polish`
- **Milestone**: docs(update): log UX micro-animations, gold accents, and transition easing
- **Summary & Insights**:
  Refined CSS cubic-bezier transition curves on card rotations (`ease-out 700ms`), pulse indicators for live daily picks, and hover states with golden borders (`#B69A61`).

---

### Entry #55: Accessibility Audit: Contrast Ratios on Charcoal Backgrounds
- **Category**: `Accessibility`
- **Milestone**: docs(update): document accessibility audit on contrast ratios over charcoal background
- **Summary & Insights**:
  Conducted contrast verification ensuring warm ivory text (`#E7E1D5`) against charcoal (`#171A1F` and `#242830`) surpasses WCAG 2.1 AA standards for effortless reading.

---

### Entry #56: Privacy Architecture: Zero Personally Identifiable Information
- **Category**: `Security`
- **Milestone**: docs(update): log privacy architecture and zero-PII retention policies
- **Summary & Insights**:
  Affirmed the strict zero-PII pledge of APARICHIT: sessions are ephemeral, chats are anonymous, and user bookmarks remain strictly on the client's local device.

---

