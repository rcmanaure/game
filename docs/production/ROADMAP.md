# Roadmap — AI DM Coterie-Sim

**Target Launch:** 2026-Q4 (Itch.io)  
**Status:** v1 development (T14 narration + T19 recall core loop)  
**Last Updated:** 2026-08-07

---

## Current Sprint

| T-Number | Feature | Status | Blocker |
|----------|---------|--------|---------|
| **T19** | NPC Recall (turn 2+) | ✅ Fixed | None |
| **T14** | Narration Engine | 🟢 Shipped | Volume test complete — see T15 finding |
| **T15** | Model Cost Re-eval | ✅ Decision made | Free-tier models disqualified — see below |
| **T25** | Permadeath UI | ⏳ Backlog | Design (post-T19) |
| **T27** | Art Edit Chain | ⏳ Research | Reference image handling |

---

## P0 Fixes (Complete)

✅ **T19 P0 Blocker** (2026-08-07)
- turnNumber parameter missing → fixed (was dead code)
- chronicleId scope missing → fixed (multi-chronicle isolation)
- Recall now executes turn 2+ with correct context

See `docs/production/P0_FIX_PLAN.md` for detail.

---

## T15 Finding — Free-Tier Models Disqualified (2026-08-07)

**Test:** 100-turn volume run via `npm run test:volume` (LOGIC_MODEL/CREATIVE_MODEL both `:free` tier on OpenRouter).

**Results:**
- Success: 100/100 (100%) — masked by fail-open fallback (deterministic template), not a real pass
- Latency: min 11.9s, max 134.6s, **avg 36.9s/turn** — unacceptable for real-time gameplay
- Primary narration model failed intermittently: `TypeError: Cannot read properties of undefined (reading '0')` in `@langchain/openrouter`'s `_generate()` — package doesn't guard against `data.choices` being absent

**Root cause:** Free-tier OpenRouter models return malformed/error payloads under rate-limit pressure (no `choices` field, HTTP 200). Not a bug in our code — `narrateWithFallback` already catches and falls back correctly (by design, CEO Review Hardening 2026-08-06).

**Decision:** Free-tier models (`nvidia/nemotron-3-*:free`) disqualified for production. Need paid-tier model or dedicated quota before launch. Latency alone (avg 37s/turn) rules them out regardless of reliability.

**Next step:** Re-run `npm run test:volume` with a paid-tier `CREATIVE_MODEL`/`LOGIC_MODEL` to get real latency/cost baseline before picking final model.

---

## Locked Decisions

**Tech Stack** (immutable per CEO):
- Frontend: DOM + CSS + Motion.dev (no Phaser)
- LLM: LangGraph.js + OpenRouter (model swap via ENV)
- Narrative: Ink + inkjs (permadeath consistency)
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

- **Now (2026-08-07):** T14 volume test (unblock T15 model choice)
- **2026-Q3:** T15 decision, T25 design, T27 art chain
- **2026-Q4:** Beta test, Itch.io launch
- **2026-Q4+:** Balance patches, permadeath tuning

---

## Quality Gates (Pre-Launch)

- [ ] T14 volume test pass (1000+ turns, <5% failure rate)
- [ ] NPC recall verified (5-turn E2E test)
- [ ] Permadeath flow tested (character death → chronicle end → retry)
- [ ] Art generation <50ms p95 latency
- [ ] No soft-locks (timeout recovery)

---

## Known Issues

| ID | Severity | Status |
|----|----------|--------|
| T19 P0 | 🔴 BLOCKER | ✅ FIXED (2026-08-07) |
| Docs roadmap | 🟡 MINOR | ✅ FIXED (links updated) |

See `docs/testing/TEST_RESULTS_FINAL.md` for full quality report.

---

## Decision References

Original decisions archived in git history (commit `d80cace` deleted planning docs; see `git log --all` for Decision #15, #22, #26 context). Tech stack decisions persisted in `docs/research/`.

---

Generated 2026-08-07.
