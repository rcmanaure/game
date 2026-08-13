# AI Dungeon Master Coterie-Sim

Dark-fantasy AI-DM game with permadeath, persistent NPC memory, and retro TTRPG aesthetics. Web-based, runs on NestJS + Postgres.

**Status:** v1 in development (T14 narration engine + T19 NPC recall, target launch 2026-Q4).

## Quick Start

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- PostgreSQL 14+ (via Docker, or standalone)

### Local Dev Setup

```bash
# 1. Clone & install
git clone <repo>
cd game
npm install

# 2. Start Postgres
npm run db:up
# Runs `docker compose up -d postgres`

# 3. Set environment
cp .env.example .env
# Fill in: DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY, etc.

# 4. Run migrations
npm run migration:run

# 5. Start backend (separate terminal)
npm run backend:dev
# Listens on port 3000

# 6. Run harness (CLI test, separate terminal)
npm run harness "action 1" "action 2"
# Harness runs a full turn through the graph without backend/DB
```

## Architecture

- **Backend:** NestJS + TypeORM (Postgres persistence, JWT auth, WebSocket)
- **Game logic:** LangGraph.js orchestration (`src/harness/graph.ts`), OpenRouter LLM calls
- **Frontend:** Not yet shipped (placeholder in docs/designs)

## Commands

| Command | Purpose |
|---------|---------|
| `npm run harness [--character ID] ACTION...` | Run single-player turns CLI (no DB, in-memory state) |
| `npm run harness:drift` | Test art generation quality via drift scan |
| `npm run backend:dev` | Start NestJS backend (port 3000) |
| `npm run test` | Run harness unit tests |
| `npm run migration:generate` | Generate new TypeORM migration |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run db:up` | Start Postgres container |
| `npm run db:down` | Stop Postgres container |

## Key Files

- **Game Loop:** `src/harness/graph.ts` (LangGraph state machine)
- **Backend:** `src/backend/app.module.ts`, `src/backend/auth/`, `src/backend/graph/`
- **Entities:** `src/backend/entities/` (User, Chronicle, Turn, Npc)
- **Design System:** `docs/reference/DESIGN.md` (typography, colors, layout constraints)
- **Roadmap:** `docs/production/ROADMAP.md` (scope + decisions + timeline)

## Environment Variables

| Var | Purpose | Example |
|-----|---------|---------|
| `DATABASE_URL` | Postgres connection | `postgres://user:pass@localhost:5432/game` |
| `JWT_SECRET` | Token signing key | (generate: `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | Refresh token key | (generate: `openssl rand -hex 32`) |
| `OPENROUTER_API_KEY` | LLM API key | `sk-...` |
| `FRONTEND_URL` | CORS origin for WS | `http://localhost:3001` |
| `LOGIC_MODEL` | D20/stat resolver | `google/gemini-2.0-flash-001` ⚠️ 404s on OpenRouter now, pick a real model |
| `CREATIVE_MODEL` | Narration LLM | `anthropic/claude-3.5-sonnet` ⚠️ 404s on OpenRouter now, pick a real model |
| `CREATIVE_MODEL_ALT` | Narration retry (content-refusal fallback) | `nvidia/nemotron-3-super-120b-a12b:free` |
| `IMAGE_MODEL` | Art generation | `google/gemini-2.5-flash-image` |
| `LLM_TIMEOUT_MS` | Per-call deadline before falling back (stopgap, not a latency fix) | `45000` |
| `DISABLE_IMAGE_GEN` | Skip real art generation, use a placeholder | `true` |

See `.env.example` for defaults.

## Testing

```bash
npm run test
# Runs `node --import tsx --test src/harness/__tests__/*.test.ts`
```

Current coverage: harness rules, character validation, narration fallback, art generation (69 tests). Backend has no test suite yet (`jest` not installed — `TODO.md` M3.1).

## Docs

- **Design System:** `docs/reference/DESIGN.md` — typography, color, layout, motion, accessibility
- **Roadmap:** `docs/production/ROADMAP.md` — scope, decisions, T-numbers, timeline
- **Research:** `docs/research/` — tech stack validation, competitor analysis, narrative frameworks
- **Quality:** `docs/testing/TEST_RESULTS_FINAL.md` — test coverage snapshot, known issues

## Development Conventions

- **Commits:** `feat:`, `fix:`, `docs:`, `test:`, `refactor:` prefixes
- **Code:** TypeScript strict mode, Zod schemas for data validation
- **Architecture:** Ponytail lazy-build principle — stdlib first, one-liner when possible, no speculative abstractions
- **Quality:** Quality > velocity when trade-offs arise; ship it right, not fast

## Deployment

**Target:** Itch.io + Steam (post-v1). See `docs/production/ROADMAP.md` for deployment timeline.

**Current:** Local dev + Docker Compose for testing.

## Support / Issues

See `docs/production/ROADMAP.md` for blockers, deferred scope, and P2 items before launch.

---

Generated 2026-08-06. Last updated in commit [TBD].
