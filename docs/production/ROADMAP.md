# Roadmap — AI DM Coterie-Sim

**Target Launch:** 2026-Q4 (Itch.io)  
**Status:** v1 development — harness core loop runs end to end; backend now
boots, authenticates real users, and has completed a live turn against a real
Postgres over the real WebSocket path (2026-08-13). No frontend yet; NPC
recall still unshipped.  
**Last Updated:** 2026-08-13

---

## Current Sprint

| T-Number | Feature | Status | Blocker |
|----------|---------|--------|---------|
| **T19** | NPC Recall (turn 2+) | 🟢 Shipped | Both halves wired + live-verified 2026-08-13. Read-path (TODO.md M2.1) and write-path (TODO.md M2.2, LLM-signaled per D-3) confirmed end to end: NPC introduced turn 1, referenced by name turns 2-3, real `npcs` rows, recall surfaced in later narration. Known imperfection: no stable NPC id, so a renamed mention (e.g. "Servant Aldric" → "Aldric") creates a second row instead of updating the first — recall still works, picks most recent. |
| **T14** | Narration Engine | 🟢 Shipped | Verified live in the harness. Volume test complete — see T15 finding |
| **T15** | Model Cost Re-eval | 🟡 Risk accepted | Staying free-tier for now, revisit pre-launch — see below |
| **T25** | Permadeath UI | ⏳ Backlog | Design (post-T19). Note the rules underneath it are unreachable in play — see Known Issues |
| **T27** | Art Edit Chain | ⏳ Research | Reference image handling |

---

## P0 Status

✅ **Auth is live (2026-08-13).** `POST /auth/register` + `POST /auth/login`
shipped and live-verified (register, login, wrong-password 401, duplicate
409). Registering stamps a real `activeChronicleId`, closing the
`'placeholder-chronicle-id'` gap for every new user. The WebSocket gateway is
reachable by a real client end to end — verified with a real turn against a
real Postgres.

✅ **`chronicleId` cross-user bug fixed (2026-08-13).** A client-supplied
`chronicleId` is verified against the authenticated user before use.
Live-verified both directions (cross-user rejected, own-chronicle turn
still completes). `'placeholder-chronicle-id'` fallback removed entirely.

✅ **Permadeath is reachable (2026-08-13).** Failed combat attacks now cost
HP — reproduced the exact audit scenario ("I lunge at the ghoul with my
blade") live: previously 0 cost, now correctly costs HP on a miss.

✅ **Craving applies (2026-08-13).** `applyMutation` now consumes
`statDeltas.craving`, clamped 0-5.

✅ **`GET /health` no longer 401s (2026-08-13).**

✅ **T19 — shipped 2026-08-13, both halves**
- turnNumber parameter missing → fixed (was dead code)
- chronicleId scope missing → fixed (multi-chronicle isolation)
- ✅ Read-path: `npcContext` flows `graph.service.ts` → harness `State` →
  the narrate prompt. Live-verified with a seeded NPC row.
- ✅ Write-path: the resolve model now emits `npcSignal: {name, fact} |
  null` (Q2/D-3, LLM-signaled) whenever a turn introduces or meaningfully
  involves a specific named individual. `graph.service.ts` upserts it into
  `npcs` by `(userId, chronicleId, name)`. Live-verified end to end: a
  3-turn run introduced an NPC then referenced her twice more, real rows
  landed, recall picked them up in later narration.
- **Known imperfection:** exact-name matching means a renamed mention
  ("Servant Aldric" → "Aldric") creates a second row instead of updating
  the first. Recall still functions (picks most recent), but this is the
  "no stable NPC identifier" risk Q2 flagged from the start — not a
  regression, an accepted tradeoff pending a stable id if it matters later.

**Remaining open P0s (`TODO.md` M1–M3):** M1.1 (raw SQL → QueryBuilder,
symptom already fixed), M1.5 (roles.guard fail-closed, dormant), M2.1-M2.3/
M2.5-M2.7 (recall wiring, NPC hp, chronicle termination, LLM-failure/
invariant-violation split, playerAction sanitization), M3.1-M3.2 (backend
test suite — `jest` still not installed).

**Found and fixed 2026-08-13, not on this list because the audit never ran
the backend far enough to find them:** the backend could not boot at all
(`ts-node` incompatible with Node 26's ESM loader; fixed via a real `tsc`
build), `TurnEntity`/`NpcEntity` missing from `TypeOrmModule.forFeature`
(silently broke `countTurns` on every turn), and the CLI harness crashing
the instant `DATABASE_URL` was set (`invoke()` never passed a `thread_id`).
Full detail: `CHANGELOG.md` `[0.1.1.0]`.

`docs/production/P0_FIX_PLAN.md` is referenced by earlier revisions of this file
and no longer exists; `TODO.md` M1–M3 superseded it.

---

## T15 Finding — Free-Tier Models Disqualified (2026-08-07)

**Test:** 100-turn volume run via `npm run test:volume` (LOGIC_MODEL/CREATIVE_MODEL both `:free` tier on OpenRouter).

**Results:**
- Success: 100/100 (100%) — masked by fail-open fallback (deterministic template), not a real pass
- Latency: min 11.9s, max 134.6s, **avg 36.9s/turn** — unacceptable for real-time gameplay
- Primary narration model failed intermittently: `TypeError: Cannot read properties of undefined (reading '0')` in `@langchain/openrouter`'s `_generate()` — package doesn't guard against `data.choices` being absent

**Root cause:** Free-tier OpenRouter models return malformed/error payloads under rate-limit pressure (no `choices` field, HTTP 200). Not a bug in our code — `narrateWithFallback` already catches and falls back correctly (by design, CEO Review Hardening 2026-08-06).

**Decision:** Staying on free-tier for now (dev cost = $0 while iterating on gameplay/design). Known risk accepted: avg 37s/turn latency and intermittent narration failures until switch to paid tier. Not a launch blocker yet — revisit before beta/launch.

**Update 2026-08-12 (repo-state audit).** Two live harness turns measured 81.4s and >120s wall — both above the 36.9s average recorded here. `PROJECT_FACTS.local.md` threshold set 2 puts KILL at p95 > 25s on the shipped tier. The gap is wider than this section assumes, and no LLM call has a timeout, so a hung free-tier request hangs the turn with no ceiling.

**Update 2026-08-13 (stopgap + root-cause scoping).**

*Stopgap shipped:* every LLM call site now passes `{ timeout: LLM_TIMEOUT_MS }`
(default 45s) via LangChain's native `RunnableConfig` — a real `AbortSignal`
cancellation, not an abandoned promise. Verified live: forcing
`LLM_TIMEOUT_MS=100` produced real `DOMException [TimeoutError]`s and the
turn still completed cleanly via the existing safe-default/deterministic
fallback path instead of hanging. This bounds the worst case. It does not
explain it.

*Root cause, scoped from this session's data:*
- `deepseek-v4-flash-0731` (the model configured this session) is a
  reasoning model. A direct API call with the trivial prompt "Say OK" still
  burned 10-33 reasoning tokens and took 11.2-11.6s — that's the *floor per
  call*, before any real prompt content.
- A full turn makes two sequential calls (resolve → narrate — narrate needs
  resolve's output, this can't be parallelized), so ~22-24s is the floor
  even when nothing goes wrong. Matches the 29.4s live-verified real-DB turn
  closely.
- The retry-once-then-safe-default logic did not fire in any successful run
  this session (the primary call always succeeded on the first try) — the
  delay is model choice, not retry-loop overhead in this codebase.
- Free-tier models showed outright hangs, not just slowness:
  `nvidia/nemotron-3-ultra-550b-a55b:free` returned zero response body
  after 55s+ in direct testing (not a code bug — provider-side).
- `google/gemini-2.0-flash-001` and `anthropic/claude-3.5-sonnet` (this
  file's own documented defaults) both 404 on OpenRouter now — stale
  model IDs, unrelated to latency but a separate reliability gap.

**Done, same day (2026-08-13):** swapped `LOGIC_MODEL`/`CREATIVE_MODEL`/
`CREATIVE_MODEL_ALT` to `openai/gpt-4o-mini` — web search corroborated it
(alongside Claude Haiku 3.5, Gemini 2.5 Flash) as one of the lowest
first-token-latency models on OpenRouter (~250-350ms TTFT), matching this
session's own direct measurement (1.7s single-call vs. ~11.5s for the
reasoning model). Live-verified full turn: **29.4s → 5.6s**, narration
quality held up (still coherent, on-tone). Cheaper too — $0.0000032/call
vs. $0.0000064.

Still not re-run at volume — `npm run test:volume` against this model for a
real p95 baseline against the KILL threshold (p95 > 25s) is the next honest
check before calling this gate met.

**Production model choice is a separate question from the dev/test model
above** — see `docs/production/MODEL_RECOMMENDATIONS.md` for the live-priced
comparison. Short version: `google/gemini-2.5-flash-lite` beats `gpt-4o-mini`
on both price and measured latency (0.70s vs 1.7s), and beats
`deepseek-v4-flash-0731` by a wide margin once deepseek's reasoning-token
overhead is accounted for. `.env` stays on `gpt-4o-mini` for now
(deliberate dev/test choice); don't let that silently become the assumed
production answer.

---

## Locked Decisions

**Tech Stack** (immutable per CEO):
- Frontend: DOM + CSS + Motion.dev (no Phaser)
- LLM: LangGraph.js + OpenRouter (model swap via ENV)
- Narrative: plain narration — ✅ **resolved 2026-08-13 (decision D-2).** Was
  locked to Ink + inkjs against the project's own research
  (`docs/research/2026-08-04-text-format-tooling-research.md` §193, which
  rules Ink/Twine/Yarn out) and `inkjs` was never installed. Lock dropped;
  `CLAUDE.md` updated to match. Current plain narration stays — it's the
  strongest asset in the repo per the 2026-08-12 audit.
- DB: Postgres + TypeORM (data model fixed)

See `docs/research/` for full rationale.

---

## Deferred (Post-v1)

| Item | Reason | Estimate |
|------|--------|----------|
| Multiplayer | scope creep, launch risk | 2027-Q2 |
| Mobile native | web version first | 2027+ |
| Mod framework | post-ship feature | 2027+ |
| Cloud save | local Postgres MVP | post-launch |

---

## Timeline

- **Done (2026-08-13):** Auth endpoints, one turn against a live Postgres over
  the real WS path, player able to lose, craving applies, chronicleId
  ownership fixed, LLM-call timeout stopgap. See `CHANGELOG.md` `[0.1.1.0]`.
- **Now:** Pick real `LOGIC_MODEL`/`CREATIVE_MODEL` IDs (current defaults 404).
  T19 recall wiring (`TODO.md` M2.1/M2.2 — persist trigger decided as
  LLM-signaled, not yet implemented). Backend test suite (`jest`, M3.1).
  Chronicle termination on death (M2.5) — the death path exists now but
  nothing closes the chronicle when it fires.
- **2026-Q3:** T25 design, T27 art chain, frontend T0
- **2026-Q4:** Beta test, Itch.io launch
- **2026-Q4+:** Balance patches, permadeath tuning

---

## Quality Gates (Pre-Launch)

0 of 5 fully met — three gates now partially closed (soft-locks, NPC recall, permadeath flow).

- [ ] T14 volume test pass (1000+ turns, <5% failure rate) — largest run so far
      is 100 turns, and its 100% pass rate is masked by the fail-open fallback.
      Not re-run since the 2026-08-13 fixes; do this before trusting the number.
- [~] NPC recall verified (5-turn E2E test) — **feature now shipped and
      live-verified 2026-08-13** (3-turn manual run, not the formal 5-turn
      automated test this gate specifies). Write the real test before
      calling this gate met.
- [~] Permadeath flow tested (character death → chronicle end → retry) —
      **death → chronicle-end now live-verified end to end 2026-08-13**: a
      4-turn sequence took a character from 12hp to Active→Torpor→Dead,
      `chronicles.endedAt` set in the same transaction as the death turn,
      a post-death retry correctly rejected. "→ retry" (starting a NEW
      chronicle) is NOT built — no endpoint exists yet to begin one after
      the first (only `AuthService.register` creates one, once). Gate
      stays open on that half.
- [ ] Art generation <50ms p95 latency — the placeholder returns instantly; the
      real OpenRouter image call has never been exercised
- [~] No soft-locks (timeout recovery) — **per-call LLM deadline shipped and
      live-verified 2026-08-13** (`RunnableConfig` timeout, real
      `AbortSignal` abort, confirmed via forced `LLM_TIMEOUT_MS=100`). This
      is a stopgap bounding the worst case, not a fix for why calls are slow
      — see T15. Not yet re-run at volume, so still counted open.

---

## Known Issues

| ID | Severity | Status |
|----|----------|--------|
| No auth endpoint — no way to obtain a JWT, backend unreachable | 🔴 BLOCKER | ✅ FIXED 2026-08-13, live-verified |
| Backend could not boot at all (`ts-node`/Node 26 ESM incompatibility) | 🔴 BLOCKER | ✅ FIXED 2026-08-13 — found live, not in original audit |
| Backend never run against a live Postgres | 🔴 BLOCKER | ✅ FIXED 2026-08-13, live-verified over real WS |
| Permadeath unreachable — only `opposedCheck` combat failure costs HP | 🔴 BLOCKER | ✅ FIXED 2026-08-13, live-verified on the audit's exact scenario |
| `'placeholder-chronicle-id'` shared bucket; client `chronicleId` unvalidated | 🟠 MAJOR | ✅ FIXED 2026-08-13, live-verified both directions |
| T19 recall not wired (`npcContext` discarded, no `npcs` writes) | 🔴 BLOCKER | ⛔ OPEN (query fixed 2026-08-07, still not wired 2026-08-13) |
| `craving` computed, never applied (`applyMutation` reads only `hp`) | 🟠 MAJOR | ✅ FIXED 2026-08-13, unit-tested |
| `GET /health` returns 401 — no `@Public()` under the global guard | 🟠 MAJOR | ✅ FIXED 2026-08-13, live-verified |
| `countTurns` silently broken every turn (`TurnEntity`/`NpcEntity` missing from `forFeature`) | 🟠 MAJOR | ✅ FIXED 2026-08-13 — found live, not in original audit |
| CLI harness (`run.ts`) crashes the instant `DATABASE_URL` is set (no `thread_id`) | 🟠 MAJOR | ✅ FIXED 2026-08-13 — found live, not in original audit |
| Backend tests never execute (jest not installed) | 🟠 MAJOR | ⛔ OPEN |
| ~81s measured turn latency, no timeout anywhere | 🟠 MAJOR | 🟡 PARTIAL — deadline shipped 2026-08-13 (stopgap), root cause scoped (see T15), not fixed |
| `LOGIC_MODEL`/`CREATIVE_MODEL` default IDs 404 on OpenRouter | 🟡 MINOR | ⛔ OPEN — found 2026-08-13 |
| Ink/inkjs locked against its own research, never installed | 🟡 MINOR | ✅ FIXED 2026-08-13 — lock dropped (decision D-2) |
| Docs roadmap links | 🟡 MINOR | ✅ FIXED |

Evidence for every 2026-08-13 row: this session's live verification —
register/login round-trips, cross-user chronicleId rejection, the exact
"lunge at the ghoul" scenario re-run with HP now applying, a forced
`LLM_TIMEOUT_MS=100` producing a real abort. Detail: `CHANGELOG.md`
`[0.1.1.0]`.
Evidence for 2026-08-12 rows: `docs/testing/REPO_STATE_2026-08-12.md`.
Full backlog with file:line and fix steps: `TODO.md` M1–M7.
`docs/testing/TEST_RESULTS_FINAL.md` (2026-08-06) predates these findings — its
"B grade" and P0 list are superseded.

---

## Decision References

Original decisions archived in git history (commit `d80cace` deleted planning docs; see `git log --all` for Decision #15, #22, #26 context). Tech stack decisions persisted in `docs/research/`.

---

Generated 2026-08-07. Status, gates and known issues corrected 2026-08-12 from
`docs/testing/REPO_STATE_2026-08-12.md`, then updated 2026-08-13 with the
remediation pass's live-verified results — see `CHANGELOG.md` `[0.1.1.0]`.
