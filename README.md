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
- **Design System:** `docs/DESIGN.md` (typography, colors, layout constraints)
- **CEO Plan:** `docs/designs/ai-dm-platform.md` (full scope + decisions)

## Environment Variables

| Var | Purpose | Example |
|-----|---------|---------|
| `DATABASE_URL` | Postgres connection | `postgres://user:pass@localhost:5432/game` |
| `JWT_SECRET` | Token signing key | (generate: `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | Refresh token key | (generate: `openssl rand -hex 32`) |
| `OPENROUTER_API_KEY` | LLM API key | `sk-...` |
| `FRONTEND_URL` | CORS origin for WS | `http://localhost:3001` |
| `LOGIC_MODEL` | D20/stat resolver | `google/gemini-2.0-flash-001` |
| `CREATIVE_MODEL` | Narration LLM | `anthropic/claude-3.5-sonnet` |
| `IMAGE_MODEL` | Art generation | `google/gemini-2.5-flash-image` |

See `.env.example` for defaults.

## Testing

```bash
npm run test
# Runs `node --import tsx --test src/harness/__tests__/*.test.ts`
```

Current coverage: harness rules, character validation, narration fallback, art generation (52 tests).

## Docs

- **Design System:** `docs/DESIGN.md` — typography, color, layout, motion, accessibility
- **CEO Plan:** `docs/designs/ai-dm-platform.md` — full scope, decisions, roadmap
- **Research:** `docs/research/` — tech stack validation, competitor analysis, narrative frameworks
- **Roadmap:** `docs/TODOS.md` — completed tasks, deferred scope, P2 items

## Development Conventions

- **Commits:** `feat:`, `fix:`, `docs:`, `test:`, `refactor:` prefixes
- **Code:** TypeScript strict mode, Zod schemas for data validation
- **Architecture:** Ponytail lazy-build principle — stdlib first, one-liner when possible, no speculative abstractions
- **Quality:** Quality > velocity when trade-offs arise; ship it right, not fast

## Deployment

**Target:** Itch.io + Steam (post-v1). See `docs/designs/ai-dm-platform.md` Scope Decision #7.

**Current:** Local dev + Docker Compose for testing.

## Support / Issues

See `docs/TODOS.md` for known deferred items, P2 blockers before launch, and post-v1 roadmap.

---

Generated 2026-08-06. Last updated in commit [TBD].
