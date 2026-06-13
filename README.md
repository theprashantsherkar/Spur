# Spur AI Live Chat Agent

A small full-stack customer-support chat app. A user talks to an AI support agent for a fictional e-commerce store; the agent answers FAQs (shipping, returns, support hours) using a real LLM. Every message is persisted to PostgreSQL and conversations resume on reload via a session id.

Built as the Spur Founding Full-Stack Engineer take-home.

- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (via Drizzle ORM)
- **LLM:** Google Gemini (`@google/genai`)

---

## Repository layout

```
.
├── backend/     # Express + TS API (routes → services → repository → db, LLM behind an interface)
├── frontend/    # React + Vite chat UI
└── README.md
```

---

## Prerequisites

- Node.js 18+ and npm
- A PostgreSQL database and its connection string (`DATABASE_URL`)
- A Gemini API key from **Google AI Studio** (https://aistudio.google.com → *Get API key*) — the free tier is sufficient. Note: a consumer Gemini subscription does **not** provide an API key; the key comes from AI Studio.

---

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env        # then fill in the values below
npm run db:generate         # generate SQL migration from the schema
npm run db:migrate          # apply it to your Postgres
npm run dev                 # starts the API on http://localhost:8080
```

Backend environment variables (`backend/.env`):

| Variable | Example | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/spur_chat` | Postgres connection (same string you use in DBeaver) |
| `GEMINI_API_KEY` | `AIza...` | Gemini auth (from Google AI Studio) |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Model id (swappable) |
| `PORT` | `8080` | API port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `MAX_MESSAGE_CHARS` | `4000` | Max accepted user message length |
| `HISTORY_MESSAGE_CAP` | `12` | Messages of history sent to the LLM |
| `MAX_OUTPUT_TOKENS` | `512` | LLM output cap (cost control) |

> You can inspect the `conversations` and `messages` tables in DBeaver after running migrations.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env        # set VITE_API_BASE_URL
npm run dev                 # starts the UI on http://localhost:5173
```

Frontend environment variables (`frontend/.env`):

| Variable | Example | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Base URL of the backend API |

Open http://localhost:5173 and start chatting.

---

## API

**`POST /chat/message`**
Request: `{ "message": string, "sessionId"?: string }`
Response: `{ "reply": string, "sessionId": string }`
- Creates a new conversation when `sessionId` is absent or unknown.
- Empty/whitespace messages are rejected with a 400 and a friendly message.
- Over-long messages are truncated to `MAX_MESSAGE_CHARS`.
- LLM failures are caught and returned as a friendly reply (HTTP 200) so the UI stays usable.

**`GET /chat/history?sessionId=...`**
Response: `{ "sessionId": string, "messages": [{ "sender": "user" | "ai", "text": string, "createdAt": string }] }`
- Unknown/absent session ids return an empty list rather than an error.

**`GET /health`** → `{ "ok": true }`

---

## Architecture overview

The backend is deliberately layered so responsibilities don't leak:

- **Routes** (`routes/chat.ts`) only parse and validate the request (Zod), call a service, and shape the response. No DB or LLM access here.
- **Chat service** (`services/chatService.ts`) orchestrates the flow: validate → persist the user message → load and trim history → call the LLM → persist the AI reply → return.
- **Repository** (`db/repository.ts`) is the only place that touches the database/ORM.
- **LLM provider** is behind an `LlmProvider` interface (`generateReply(history, userMessage)`); the Gemini SDK is imported only in `llm/gemini.ts`. Swapping providers (or adding OpenAI/Claude) means adding one file, not touching the service.

**Data model**

- `conversations`: `id (uuid)`, `channel (default 'livechat')`, `created_at`, `metadata (jsonb)`
- `messages`: `id (uuid)`, `conversation_id (fk)`, `sender ('user' | 'ai')`, `text`, `created_at`

The `channel` column is an intentional seam: adding WhatsApp/Instagram/Facebook later means a new channel value and a new inbound adapter, with the chat service and storage unchanged.

**LLM notes**

- Provider: Google Gemini via `@google/genai`, model `gemini-2.5-flash` (configurable via `GEMINI_MODEL`).
- The system prompt sets a concise support-agent persona and injects the store's knowledge base (shipping, returns, support hours). The agent is instructed to answer only from those policies and to defer to a human when unsure rather than inventing answers.
- Only the last `HISTORY_MESSAGE_CAP` messages are sent to the model to bound latency and cost; output is capped at `MAX_OUTPUT_TOKENS`.
- Guardrails: the call is wrapped in a timeout and try/catch. Auth, rate-limit, timeout, and other errors are logged by type server-side but surfaced to the user as a single friendly message; the server never crashes on a bad LLM response or malformed input.

---

## Robustness

The app is built to survive being poked at: empty input, whitespace-only input, very long pastes (truncated), malformed JSON, unknown session ids, invalid API keys, and LLM timeouts/rate limits all fail gracefully with a clean message and no server crash. No secrets are committed; every variable is documented in `.env.example`.

---

## Deployment

- **Backend** → Render (or Railway/Fly). Set all `backend/.env` variables in the host; set `CORS_ORIGIN` to the deployed frontend URL. Run migrations against the production database once.
- **Frontend** → Vercel (or Netlify). Set `VITE_API_BASE_URL` to the deployed backend URL.

> The production database must be reachable from the deployed backend. A purely local PostgreSQL works for local development but is not reachable from a cloud host — use a network-accessible/cloud Postgres for the deployed version.

Live URL: <!-- TODO: paste deployed frontend URL here -->

---

## Trade-offs & if I had more time

- Move the FAQ knowledge base into the database and make it editable, instead of assembling it in the prompt.
- Add retrieval (embeddings) so the agent scales past a hardcoded knowledge block.
- Stream responses token-by-token for a smoother UX.
- Wire the `channel` seam to a real inbound webhook (e.g. WhatsApp) to prove extensibility.
- Per-session rate limiting and basic abuse filtering.
- Service- and route-level integration tests.

<!-- TODO: edit this section to honestly reflect anything you skipped due to the timebox -->
