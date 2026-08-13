# Roadmap — AI DM Coterie-Sim

**Target Launch:** 2026-Q4 (Itch.io)  
**Status:** v1 development — harness core loop runs end to end; backend is a
scaffold with no login endpoint and has never completed a turn against a live
database.  
**Last Updated:** 2026-08-12

---

## Current Sprint

| T-Number | Feature | Status | Blocker |
|----------|---------|--------|---------|
| **T19** | NPC Recall (turn 2+) | 🔴 Not shipped | Query result discarded; no `npcs` row ever written — TODO.md M2.1/M2.2 |
| **T14** | Narration Engine | 🟢 Shipped | Verified live in the harness. Volume test complete — see T15 finding |
| **T15** | Model Cost Re-eval | 🟡 Risk accepted | Staying free-tier for now, revisit pre-launch — see below |
| **T25** | Permadeath UI | ⏳ Backlog | Design (post-T19). Note the rules underneath it are unreachable in play — see Known Issues |
| **T27** | Art Edit Chain | ⏳ Research | Reference image handling |

---

## P0 Status

⚠️ **T19 P0 Blocker — half fixed** (query fixed 2026-08-07, feature still not shipped)
- turnNumber parameter missing → fixed (was dead code)
- chronicleId scope missing → fixed (multi-chronicle isolation)
- The recall query now executes on turn 2+ with correct scope. Its result is
  then thrown away: `npcContext` is built in `graph.service.ts` and never
  passed into `harnessGraph.invoke()`, and the harness State schema has no
  field to receive it. Nothing anywhere writes an `npcs` row, so the query
  reads an empty table regardless. Narration is byte-identical with recall on
  or off.

**Open P0s.** `TODO.md` M1–M3 lists ten P0 rows; all ten are still open. The
largest one is not in that list: there is no `/auth/login` or `/auth/register`
endpoint, so no JWT can be issued and the WebSocket gateway — the only gameplay
entry point — is unreachable by any client.

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

**Next step:** Continue testing on free-tier. Re-run `npm run test:volume` against paid-tier `CREATIVE_MODEL`/`LOGIC_MODEL` for real latency/cost baseline when ready to move off free tier (pre-launch).

---

## Locked Decisions

**Tech Stack** (immutable per CEO):
- Frontend: DOM + CSS + Motion.dev (no Phaser)
- LLM: LangGraph.js + OpenRouter (model swap via ENV)
- Narrative: Ink + inkjs (permadeath consistency) — ⚠️ **contradicted, unresolved.**
  `docs/research/2026-08-04-text-format-tooling-research.md` §193 concludes "no
  action needed on narrative-engine tooling" and rules Ink/Twine/Yarn out.
  `inkjs` is not a dependency and no code references it. This decision is locked
  against its own research and has never been implemented. Unlock it or install
  it; `CLAUDE.md` carries the same locked line and needs the same call.
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

- **Now (2026-08-12):** `TODO.md` M1–M3 — auth endpoints, one turn against a
  live Postgres, make the player able to lose. Nothing downstream is measurable
  until those land.
- **2026-Q3:** T25 design, T27 art chain, T19 recall actually wired
- **2026-Q4:** Beta test, Itch.io launch
- **2026-Q4+:** Balance patches, permadeath tuning

---

## Quality Gates (Pre-Launch)

0 of 5 met.

- [ ] T14 volume test pass (1000+ turns, <5% failure rate) — largest run so far
      is 100 turns, and its 100% pass rate is masked by the fail-open fallback
- [ ] NPC recall verified (5-turn E2E test) — feature not shipped, see T19
- [ ] Permadeath flow tested (character death → chronicle end → retry) — no
      character has ever died; no chronicle-end path exists
- [ ] Art generation <50ms p95 latency — the placeholder returns instantly; the
      real OpenRouter image call has never been exercised
- [ ] No soft-locks (timeout recovery) — no LLM call has a deadline

---

## Known Issues

| ID | Severity | Status |
|----|----------|--------|
| No auth endpoint — no way to obtain a JWT, backend unreachable | 🔴 BLOCKER | ⛔ OPEN |
| T19 recall not wired (`npcContext` discarded, no `npcs` writes) | 🔴 BLOCKER | ⛔ OPEN (query fixed 2026-08-07, feature not shipped) |
| Backend never run against a live Postgres | 🔴 BLOCKER | ⛔ OPEN |
| Permadeath unreachable — only `opposedCheck` combat failure costs HP | 🔴 BLOCKER | ⛔ OPEN |
| `craving` computed, never applied (`applyMutation` reads only `hp`) | 🟠 MAJOR | ⛔ OPEN |
| `GET /health` returns 401 — no `@Public()` under the global guard | 🟠 MAJOR | ⛔ OPEN |
| `'placeholder-chronicle-id'` shared bucket; client `chronicleId` unvalidated | 🟠 MAJOR | ⛔ OPEN |
| Backend tests never execute (jest not installed) | 🟠 MAJOR | ⛔ OPEN |
| ~81s measured turn latency, no timeout anywhere | 🟠 MAJOR | ⛔ OPEN |
| Ink/inkjs locked against its own research, never installed | 🟡 MINOR | ⛔ OPEN |
| Docs roadmap links | 🟡 MINOR | ✅ FIXED |

Evidence for every row: `docs/testing/REPO_STATE_2026-08-12.md`.
Full backlog with file:line and fix steps: `TODO.md` M1–M7.
`docs/testing/TEST_RESULTS_FINAL.md` (2026-08-06) predates these findings — its
"B grade" and P0 list are superseded.

---

## Decision References

Original decisions archived in git history (commit `d80cace` deleted planning docs; see `git log --all` for Decision #15, #22, #26 context). Tech stack decisions persisted in `docs/research/`.

---

Generated 2026-08-07. Status, gates and known issues corrected 2026-08-12 from
`docs/testing/REPO_STATE_2026-08-12.md`.
