# Development Setup Guide

Complete walkthrough for setting up local development environment.

## Prerequisites

### System Requirements
- macOS 12+, Linux (Ubuntu 20.04+), or Windows 10+ (WSL2 recommended)
- Node.js 18.x LTS or 20.x (verify: `node --version`)
- npm 9.x+ (bundled with Node)
- Docker + Docker Compose (desktop app or CLI)
- PostgreSQL client tools (optional but recommended: `psql` for direct DB access)

### API Keys & Secrets
- **OpenRouter API key:** https://openrouter.ai/keys
  - Required for LLM calls (narration, logic model, image generation)
  - Free tier available; production usage costs ~$0.01-0.10 per turn
- **JWT secrets:** Generate locally (see below)

## Step 1: Clone & Install

```bash
git clone <repo-url> game
cd game
npm install
```

Verify Node version:
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

## Step 2: Set Up Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database — **must match docker-compose.yml postgres config**
DATABASE_URL="postgres://game_user:game_password@localhost:5432/game_db"

# JWT — generate new secrets:
# macOS/Linux:
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
# Windows PowerShell:
# $JWT_SECRET = -join ((1..64) | % { '{0:x}' -f (Get-Random -Max 16) })

# LLM & Art — from OpenRouter
OPENROUTER_API_KEY="sk-or-v1-..."

# Frontend (dev)
FRONTEND_URL="http://localhost:3001"

# LLM Model Selection (optional — defaults shown)
LOGIC_MODEL="google/gemini-2.0-flash-001"
CREATIVE_MODEL="anthropic/claude-3.5-sonnet"
CREATIVE_MODEL_ALT="nvidia/nemotron-3-super-120b-a12b:free"
IMAGE_MODEL="google/gemini-2.5-flash-image"

# Optional: Disable image gen during local testing
# DISABLE_IMAGE_GEN=true
```

**⚠️ Never commit `.env` — add to `.gitignore` (already done).**

## Step 3: Start Postgres

```bash
npm run db:up
# Runs: docker compose up -d postgres

# Verify it's running:
docker ps | grep postgres
# Should see a postgres container in running state
```

Wait ~5s for Postgres to be ready (first startup slower).

Test connection:
```bash
# Via npm:
npm run migration:run  # Will fail if DB unreachable

# Or direct psql (if installed):
psql postgresql://game_user:game_password@localhost:5432/game_db -c "SELECT version();"
```

If `psql` command not found, PostgreSQL client tools not installed (not required, npm scripts work without it).

## Step 4: Run Migrations

Initialize the database schema:

```bash
npm run migration:run
```

Expected output:
```
[TypeORM] Running migration 1786034027189-InitSchema
[TypeORM] Migration 1786034027189-InitSchema has been executed successfully
```

Verify tables created:
```bash
psql postgresql://game_user:game_password@localhost:5432/game_db -c "\dt"
# Should list: chronicle_entity, npc_entity, turn_entity, user_entity
```

## Step 5: Start Backend

In a new terminal:

```bash
npm run backend:dev
```

Expected output:
```
[Nest] ... Application successfully started
Backend listening on port 3000
```

Health check:
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","database":"connected"}
```

If DB error, verify:
1. Postgres container running: `docker ps | grep postgres`
2. `.env` DATABASE_URL matches docker-compose.yml config
3. Migrations ran: `npm run migration:run`

## Step 6: Run Harness (CLI Testing)

In a third terminal, run a single game turn locally (no backend needed):

```bash
npm run harness "I sneak past the guard"
```

Output shows: dice roll, stat deltas, narration, art URL (or error).

Run multiple turns with same character:
```bash
npm run harness "I sneak past the guard" "I loot the chest" "I flee to the forest"
```

Try a different character:
```bash
npm run harness --character kael-the-cursed "Cast fireball"
```

List available sample characters:
```bash
npm run harness
# Error message lists known characters
```

## Step 7: Run Tests

```bash
npm run test
```

Expected: 52 tests pass (harness rules, character validation, art generation, narration fallback).

## Workflow: Full Turn (Backend + DB)

Once backend is running, the WebSocket flow will be ready for frontend UI (not yet implemented). To test via CLI, see `BACKEND.md` for WebSocket event format.

## Database Operations

### Inspect Tables

```bash
psql postgresql://game_user:game_password@localhost:5432/game_db

# Inside psql prompt:
\dt                          # List all tables
SELECT * FROM user_entity;   # Query users
SELECT * FROM turn_entity;   # Query turns
\q                           # Exit
```

### Generate a New Migration

After changing TypeORM entities:

```bash
npm run migration:generate
# Creates src/backend/migrations/<TIMESTAMP>-<name>.ts
```

Review the generated migration, then:

```bash
npm run migration:run
```

### Revert Last Migration

```bash
npm run migration:revert
```

## Troubleshooting

### "connect ECONNREFUSED 127.0.0.1:5432"
Postgres container not running or not ready.

**Fix:**
```bash
docker ps  # Check if postgres container exists
npm run db:down
npm run db:up
# Wait 5s for startup
npm run migration:run
```

### "password authentication failed for user 'game_user'"
DATABASE_URL in `.env` doesn't match docker-compose.yml.

**Fix:** Verify docker-compose.yml:
```bash
grep -A5 "postgres:" docker-compose.yml
# Should show POSTGRES_USER=game_user, POSTGRES_PASSWORD=game_password, POSTGRES_DB=game_db
```

Then update `.env` to match.

### "OPENROUTER_API_KEY not set"
LLM calls will fail. Optional for harness (use `DISABLE_IMAGE_GEN=true`), required for backend narration.

**Fix:**
1. Get key from https://openrouter.ai/keys
2. Add to `.env`: `OPENROUTER_API_KEY=sk-or-v1-...`
3. Restart backend: `npm run backend:dev`

### "Cannot find module '@nestjs/common'"
npm install incomplete.

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tests fail with "ENOTFOUND localhost:5432"
Harness tests try to connect to DB. Harness should run without DB, but tests might be misconfigured.

**Fix:**
```bash
npm run db:up
npm run migration:run
npm run test
```

## Optional: IDE Setup

### VS Code
- Install: TypeScript, Prettier, ESLint extensions
- `.vscode/settings.json` (create if missing):
  ```json
  {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "typescript.enablePromptUseWorkspaceTsdk": true
  }
  ```

### WebStorm / IntelliJ
- Mark `src/` as Sources Root
- Run: Run → Edit Configurations → Add Node.js configuration for `src/backend/main.ts`

## Next Steps

1. Start backend: `npm run backend:dev`
2. Explore harness: `npm run harness "test action"`
3. Read `BACKEND.md` for WebSocket API contract
4. Read `docs/designs/ai-dm-platform.md` for scope & decisions

---

Updated 2026-08-06.
