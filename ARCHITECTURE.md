# Architecture & Code Flow

High-level system structure, game graph flow, and how harness/backend integrate.

## System Layers

```
┌─────────────────────────────────────────┐
│  Frontend (Planned: Phaser/PixiJS)      │
├─────────────────────────────────────────┤
│  WebSocket (Socket.io)                  │
├─────────────────────────────────────────┤
│  Backend (NestJS)                       │
│  ├─ JwtWsGateway (WS message handler)   │
│  ├─ GraphService (orchestrator)         │
│  └─ TurnReservationService (idempotency)│
├─────────────────────────────────────────┤
│  Game Engine (LangGraph.js)             │
│  └─ Harness State Machine               │
├─────────────────────────────────────────┤
│  LLM Calls (OpenRouter)                 │
├─────────────────────────────────────────┤
│  Persistence Layer (PostgreSQL)         │
└─────────────────────────────────────────┘
```

## Game Loop: Single Turn

### Step 1: Client → Backend (WebSocket)

Client sends `turn` event with:
- `turnId` (UUID, client-generated for idempotency)
- `playerAction` (free text, e.g., "I sneak past the guard")
- `character` (current character state)
- `chronicleId` (active chronicle)

### Step 2: Backend Receives & Reserves

`JwtWsGateway.handleTurn()` → `GraphService.runTurn()`

1. **Authenticate:** Verify JWT, extract user_id
2. **Atomic Reserve:** `TurnReservationService.reserve()`
   - INSERT turn row with status='reserved' if turnId doesn't exist
   - Return error if turnId already reserved or completed (duplicate request)
3. **NPC Recall** (T19): Query most recent NPC by user_id
   - Threads `{ npcName, npcFact }` into graph state
   - Fail-open: if DB fails, continue without NPC context

### Step 3: Graph Invocation

`GraphService.runTurn()` → `harnessGraph.invoke({ playerAction, character, npcContext? })`

LangGraph StateGraph running 5-node pipeline:

```
validate → resolve → narrate → art-trigger → return
```

**Node: validate**
- Input: `{ playerAction, character }`
- Zod schema check: playerAction is non-empty string, character is valid schema
- Output: sanitized `LogicIntent` object or throw error
- File: `src/harness/validator.ts`

**Node: resolve**
- Input: `LogicIntent`, `Character` state
- Dice roll (d20) + attribute modifier + skill bonus
- Output: `ResolvedEvent` (roll, target, success, critical tier, stat deltas)
- File: `src/harness/rules.ts`

**Node: narrate**
- Input: `ResolvedEvent`, `Character`, optional `npcContext`
- LLM prompt: "Narrate this fantasy combat outcome"
- Output: `{ narration: string, artRequest: boolean }`
- Fallback node on LLM refusal: hardcoded narration (`narrate_fallback`)
- File: `src/harness/narration.ts`

**Node: art-trigger**
- Input: `narration`, `archetype` from event
- Calls `generateArt()` with STYLE_FORMULA prompt
- Output: `{ artUrl?, artError? }`
- Cache check: if archetype seen before, reuse cached image
- Fail-open: art error doesn't block narration
- File: `src/harness/art.ts`

**Node: return**
- Aggregate: `{ gameEvent, narration, artUrl?, artError? }`
- Apply stat deltas to character
- File: `src/harness/graph.ts`

### Step 4: Persist & Emit Response

After graph completes:

1. **Update Turn Row** in DB:
   ```sql
   UPDATE turns
   SET status='completed', resolution_payload='{...}', updated_at=NOW()
   WHERE turn_id=$1
   ```

2. **Emit WebSocket Response**:
   - Success: `turn:complete` (just confirms ID, client fetches full result later)
   - Error: `turn:error` (error message, turn stays marked 'failed' for retry)

3. **Character State Persisted** (future):
   - T8: Save character mutations to DB
   - Current harness: in-memory only, CLI loops carry state between turns

## Code Map

### Backend

| File | Purpose |
|------|---------|
| `src/backend/app.module.ts` | NestJS module config, providers, imports |
| `src/backend/main.ts` | Bootstrap, listen on port, install exception filter |
| `src/backend/auth/` | JWT strategy, guards, decorators, auth service |
| `src/backend/auth/jwt-ws.gateway.ts` | WebSocket handler, emits turn:complete/turn:error |
| `src/backend/graph/graph.service.ts` | Turn orchestrator, calls harness graph + art gen |
| `src/backend/graph/turn-reservation.service.ts` | Atomic INSERT/UPDATE for idempotency |
| `src/backend/entities/` | TypeORM entity definitions (User, Turn, NPC, Chronicle) |
| `src/backend/migrations/` | TypeORM migrations (schema creation) |
| `src/backend/data-source.ts` | TypeORM CLI config (for migration generate/run/revert) |
| `src/backend/common/all-exceptions.filter.ts` | Global exception handler, logs + JSON error response |

### Harness (Game Engine)

| File | Purpose |
|------|---------|
| `src/harness/graph.ts` | LangGraph StateGraph definition (5-node pipeline) |
| `src/harness/state.ts` | State schema (Zod) — LogicIntent, ResolvedEvent, Character |
| `src/harness/rules.ts` | Dice roll, stat check, modifier logic, critical tier calculation |
| `src/harness/validator.ts` | Input validation, sanitizeIntent() |
| `src/harness/narration.ts` | LLM prompt construction, narrate() + narrate_fallback() |
| `src/harness/art.ts` | OpenRouter image generation, cache key, generateArt() |
| `src/harness/character.ts` | Character schema, sample coterie, SAMPLE_CHARACTERS |
| `src/harness/models.ts` | LLM model instantiation (logicModel, creativeModel, imageModel) |
| `src/harness/style-formula.ts` | Frozen art prompt suffix (Decision #18) |
| `src/harness/drift.ts` | Quality check: run harness with DISABLE_IMAGE_GEN=true, scan for drift |
| `src/harness/run.ts` | CLI entrypoint: parse args, loop turns, print results |
| `src/harness/env.ts` | Stub .env loader (hand-rolled, candidate for removal — see ponytail-audit) |

### Tests

| File | Purpose |
|------|---------|
| `src/harness/__tests__/rules.test.ts` | D20 roll, modifier, crit tier logic (unit) |
| `src/harness/__tests__/validator.test.ts` | Input sanitization (unit) |
| `src/harness/__tests__/art.test.ts` | generateArt() mock responses, fallback, cache (unit) |
| `src/harness/__tests__/narration.test.ts` | LLM prompt, fallback on refusal (unit) |
| `src/harness/__tests__/smoke.test.ts` | Full turn via harnessGraph.invoke() (integration) |

## Data Flow: Single Turn Example

```
Client: playerAction="I sneak past the guard"
         ↓
  JwtWsGateway receives 'turn' event
         ↓
  GraphService.runTurn()
         ├─ TurnReservationService.reserve() [DB: INSERT turns ... ON CONFLICT DO NOTHING]
         ├─ NpcRepo.findOne() by userId [DB: SELECT npc ORDER BY createdAt DESC LIMIT 1]
         ├─ harnessGraph.invoke({ playerAction, character, npcContext })
         │   ├─ validate node: Zod check → LogicIntent
         │   ├─ resolve node: d20 roll + modifiers → ResolvedEvent (success, critTier, statDeltas)
         │   ├─ narrate node: LLM prompt → narration text (or fallback)
         │   ├─ art-trigger: generateArt(narration, archetype) → OpenRouter image URL
         │   └─ return node: aggregate { gameEvent, narration, artUrl }
         ├─ generateArt() if narration requests it
         │   └─ OpenRouter POST /images → { url, b64, error }
         ├─ DB: UPDATE turns SET status='completed', resolution_payload='...'
         └─ emit 'turn:complete' { turnId }
         ↓
  Client receives 'turn:complete'
```

## Harness Standalone (No Backend)

CLI usage: `npm run harness "action 1" "action 2"`

Flow:
1. Load sample character
2. For each action:
   - `harnessGraph.invoke({ playerAction, character })`
   - Character state mutates in-memory (harness only)
   - Print: roll, narration, art URL
3. Exit

No DB, no JWT, no WS. Tests same game engine as backend.

## State Machine: Full Graph

LangGraph StateGraph with these transitions:

```
START
  ↓
validate (throw on bad input)
  ├─ success → resolve
  └─ fail → error response
resolve
  ├─ compute d20 + mods
  └─ → narrate
narrate
  ├─ LLM call
  ├─ on refusal → narrate_fallback
  └─ → art-trigger
art-trigger
  ├─ generateArt() [may fail]
  ├─ on error → log + continue (fail-open)
  └─ → return
return
  ├─ aggregate results
  └─ END
```

Error modes:
- **Validation error:** thrown, caught by `runTurn()` → `turn:error`
- **LLM refusal:** caught by narration node → fallback narrative
- **Art error:** caught, error returned alongside working narration
- **DB error:** caught by `runTurn()` → `turn:error`, turn marked 'failed' for retry

## Scaling Decisions (Post-v1)

**Current:** All LLM calls synchronous within turn (no timeout). Suitable for 1-2 concurrent players.

**Future concerns:**
- Slow LLM model → turn takes >60s → startup sweep retries it
- No connection pooling for OpenRouter → could hit rate limits on spike
- PostgresSaver checkpointing writes every node → DB write amplification

Candidates for post-v1 hardening:
- Turn timeout (60s hard limit, return partial result)
- OpenRouter client-side batching + retry queue
- Checkpointing write frequency (checkpoint on resolved event only, not every node)

---

Updated 2026-08-06. See `docs/designs/ai-dm-platform.md` for product decisions, `BACKEND.md` for API contract, `src/harness/graph.ts` for actual graph definition.
