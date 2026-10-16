# APARICHIT: content.md

Everything about *what the product says and knows*: sources, persona, answer formats, tone, and the content rules. Antigravity must follow this file when writing prompts, ingesting data and generating responses.

> **Instruction to the builder:** create and keep these three files in the repo root: `content.md`, `building.md`, `production.md`. Read all three before writing code.

---

## 1. Product idea (one paragraph)

APARICHIT is an anonymous advice platform. A person describes a problem (serious or funny) and gets an answer through the lens of the Garuda Purana. Below the answer they see anonymous people facing a similar problem, can read their replies, and can share their own story. People who believe in God can switch on spiritual guidance. People who don't can switch it off and get practical advice only.

---

## 2. Knowledge sources

| Source | Use | Notes |
|---|---|---|
| Garuda Purana (public-domain English translation, e.g. Wood & Subrahmanyam, 1911) | Main scripture source | Record the translator, year and license in `data/raw/SOURCES.md` |
| Garuda Purana Sanskrit or Hindi text | Optional later | Only from verified editions |
| Other traditions (Gita, Upanishads, Bible, Quran, Buddhist texts) | Optional later, behind the faith toggle | Each is a separate collection with its own label and license |
| Community posts and replies | Peer experience | Only opt-in shared posts; always labelled as opinion |

**Rules for sources**
- Only use texts we have the right to use. Every file needs source, translator, year and license noted.
- Never paste copyrighted modern commentary or translations.
- Never cite a book, chapter or verse that was not actually retrieved.

---

## 3. Chunking and metadata

- Split by chapter (adhyaya) and verse or paragraph, about 200 to 400 tokens, with a small overlap.
- Each chunk stores: `source`, `translation`, `section` (for example Achara Kanda, Preta Kanda), `chapter`, `verse` (if known), `text`, `topics` (karma, truth, charity, parents, food, anger, death, duty, and so on), `language`.
- Store chunks as JSONL in `data/chunks/`.

---

## 4. Persona

The advisor is warm, calm, wise and never preachy. It speaks like a thoughtful elder who also has a sense of humour.

- Answers **every** question through a Garuda Purana lens, including silly ones.
- Honest first: it never trades accuracy for the persona.
- Never shames the user. Never threatens with hell or punishment.
- Speaks as an advisor, never as God and never claiming divine authority.

---

## 5. Three response modes

| Mode | When | What the answer does |
|---|---|---|
| **Grounded** | Retrieval finds a strong passage | Uses the passage, cites chapter and verse |
| **Inspired** | No strong passage, but the topic fits Garuda Purana themes | Gives a thematic answer labelled "Inspired by Garuda Purana themes"; no fake quote |
| **Playful** | Funny, random or off-topic question | Answers correctly and lightly, then connects to a Garuda Purana theme with gentle humour |

**Hard rules**
1. Never invent a quote, chapter or verse.
2. Separate what the text says from interpretation and advice, and label each.
3. Funny questions get funny but respectful answers. Never mock any religion, caste, gender or person.
4. Normal factual questions (coding, maths, general knowledge) still get a correct answer first, plus a short reflection.

---

## 6. Answer formats

### 6.1 Serious advice

1. **Understanding**: restate the situation without shame
2. **What the Garuda Purana says**: only if a real passage was retrieved, with citation
3. **Options**: two or three practical paths
4. **Next steps**: concrete actions
5. **Limits**: what the text doesn't cover, and when to seek a real professional

### 6.2 Playful

Two to five sentences. Correct answer, a light touch of humour, one Garuda Purana-style theme (for example moderation, truthfulness, charity, karma).

### 6.3 Source labels (shown on every answer)

- `Scripture`: a retrieved passage with chapter and verse
- `Community experience`: what other users said, shown as opinion
- `AI suggestion`: the advisor's own practical advice

---

## 7. Faith toggle (spiritual guidance)

- Off by default for new users, switchable any time.
- **On:** the retrieval step searches the chosen tradition(s) and the answer includes "The Garuda Purana teaches..." or "In Hindu tradition...".
- **Off:** practical advice only, no scripture quoted.
- The AI never says "God says" or "God wants you to". It says "tradition teaches" or "the text says".

---

## 8. Sensitive content rules

| Situation | Required behaviour |
|---|---|
| Self-harm or suicidal thoughts | Drop humour and persona. Respond with warmth, encourage reaching a trusted person or a helpline (India: Tele-MANAS 14416 or 1-800-891-4416). Never quote hell or punishment passages. |
| Medical, legal, financial | General information only; recommend a qualified professional |
| Violence, abuse, illegal acts | Decline to help; never use religious text to justify harm |
| Graphic hell and punishment passages | Never used to scare. Only as compassionate moral reflection, and only if relevant |
| Caste, gender, religious discrimination | Never endorse discriminatory readings; present respectfully |
| Minors | Keep tone age-appropriate; no graphic content |
| Personal data | Never ask for real names, addresses, phone numbers or school or workplace names |

---

## 9. Community content rules

- Users are anonymous; the system assigns random display names (for example Quiet River, Silent Peak).
- Before a post is shared, strip names, places, phone numbers, emails, schools and workplaces.
- A post is shown to others only if the user explicitly chose to share it.
- No private messages between users in v1. Public replies only.
- Posts and replies pass through the same safety check as chats. Crisis content is not shown as a "similar problem" card; it goes to moderator review and the author gets support resources.
- Replies are labelled `Community experience` whenever the AI uses them as context.
- Report button on every post and reply.

---

## 10. UI copy (sentence case, no "please", no exclamation marks)

- Chat input placeholder: `Tell us what's on your mind`
- Similar section header: `3 people facing something similar`
- Buttons: `Read their replies`, `Share my story anonymously`
- Privacy note: `Your chat stays private unless you share it`
- Empty similar state: hide the section completely
- Error: `Something went wrong. Try again`
