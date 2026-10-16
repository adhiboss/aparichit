# APARICHIT: production.md

How the product goes live and stays safe, private and affordable. Read `content.md` and `building.md` first.

> **Instruction to the builder:** do not deploy anything until the checklist in section 9 is complete. Create `content.md`, `building.md` and `production.md` in the repo root if they don't exist.

---

## 1. Launch plan (in stages)

| Stage | Who | Goal |
|---|---|---|
| **Stage 0: local** | You only | Everything runs on your machine with free tiers and a local model |
| **Stage 1: private beta** | 10 to 50 invited people | Test answer quality, safety and the similar-people cards |
| **Stage 2: soft launch** | A few hundred users | Watch costs, moderation load and abuse |
| **Stage 3: public** | Open to all | Only after moderation and privacy work is solid |

Launch the AI advisor first. Open the community section only when there are enough shared posts for matches to feel useful. The similar-people section stays hidden until then.

---

## 2. Hosting

| Part | Option | Rough cost |
|---|---|---|
| Frontend | Vercel, Netlify or Cloudflare Pages | Free at small scale |
| AI service (Python) | Render, Railway or a small VPS | About 500 to 2,500 rupees/month |
| Database | Supabase or Neon (PostgreSQL) | Free tier, then a few hundred rupees |
| Vector store | ChromaDB on the AI server disk (small), or a managed vector DB later | Included or a few hundred rupees |
| Embeddings | Small CPU model on the server | Included |
| LLM | Hosted API, pay per use | The biggest variable cost |
| Domain | Any registrar | About 800 to 1,500 rupees/year |

Costs and free tiers change often. Check each provider's pricing page before committing.

---

## 3. Cost control

1. Use the cheapest model that passes the evaluation set. Route simple or playful questions to a cheaper model and serious advice to a stronger one.
2. Cache answers to common questions.
3. Daily free message limit per account (`DAILY_FREE_MESSAGES`).
4. Cap the maximum output length and the number of retrieved passages per request.
5. Set a hard monthly spending cap with the LLM provider and an alert at 50 percent and 80 percent.
6. Log token usage per request so cost per user is visible.
7. Rate-limit by IP and by account to stop abuse.

---

## 4. Privacy and data protection

This product holds very sensitive personal stories. Treat privacy as a core feature.

- Anonymous accounts: no email or phone number required.
- Chats are private by default. Nothing enters the community unless the user shares it.
- Anonymise before sharing: remove names, places, phone numbers, emails, schools and workplaces. Let the user review the anonymised text before posting.
- Do not log chat content in plain text in application logs.
- Encrypt data in transit (HTTPS) and at rest (database encryption).
- Give users a way to delete their chat history and their posts.
- Hosted LLM providers receive prompts. Pick a provider whose terms say API data isn't used to train models, and say this clearly in the privacy policy.
- Publish a privacy policy and terms of use before public launch. India's Digital Personal Data Protection Act (DPDP) applies if you handle personal data of people in India, so get proper legal advice for the wording and for consent flows.
- Special care for minors: decide the minimum age, and keep content age-appropriate if younger users may appear.

---

## 5. Safety and moderation

| Risk | Control |
|---|---|
| Crisis or self-harm in a chat | Crisis path: warm response, helplines, no humour, no hell passages |
| Crisis or self-harm in a community post | Not shown as a match; sent to the moderator queue; author gets support resources |
| Harassment, hate, abuse | Report button on every post and reply, automatic filters, moderator review, ability to ban accounts |
| Stalking and identity leaks | No private messages in v1; anonymiser; block names and contact details in posts |
| Bad community advice | Label as `Community experience`; upvote and report; AI never presents it as scripture |
| AI errors | Citation verifier; labelled sources; clear limits statement; disclaimers for medical and legal topics |
| Spam and bots | Rate limits, new-account posting limits, basic captcha when needed |

Put at least one human in charge of the moderation queue before opening the community. A community with vulnerable users without moderators is a risk to both the users and the project.

---

## 6. Monitoring

- Health check endpoint and uptime monitor.
- Error tracking (Sentry free tier or similar).
- Metrics: requests per day, response time, token cost per day, safety flags per day, reports per day, share rate, similar-card click rate.
- Weekly review: sample 20 answers and 20 community posts by hand.
- Re-run `eval/run_eval.py` before every release and after changing the model, prompts or thresholds.

---

## 7. Deployment

1. Create a `Dockerfile` for the AI service (Python 3.11, install requirements, run Uvicorn).
2. Store secrets (API keys, database URL) in the host's secret manager, never in the repo.
3. Run database migrations on deploy.
4. Run the ingestion script once on the server to build the vector store, or ship a prebuilt Chroma folder.
5. Set the production `CORS_ORIGINS` to the real frontend URL only.
6. Use HTTPS only.
7. Back up the database daily and test a restore.

---

## 8. Things to avoid

- Don't launch the community without moderation.
- Don't let the AI claim to speak for God.
- Don't show private chats to anyone.
- Don't use graphic hell descriptions to frighten users.
- Don't quote any source we don't have rights to.
- Don't deploy with the LLM key in the frontend. All LLM calls go through the AI service.

---

## 9. Pre-launch checklist

- [ ] Evaluation set passes: zero fabricated citations, safety cases handled
- [ ] Crisis path tested end to end, with helpline numbers verified as current
- [ ] Anonymiser tested on realistic stories
- [ ] Moderation queue and report flow working; a named person owns it
- [ ] Privacy policy and terms of use published; legal review done
- [ ] Spending cap and alerts set with the LLM provider
- [ ] Rate limits and daily message limits on
- [ ] Backups and restore tested
- [ ] Data deletion works for users
- [ ] Private beta feedback reviewed and fixed
- [ ] Rollback plan written (how to switch off the community or the LLM quickly)
