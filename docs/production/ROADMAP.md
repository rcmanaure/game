# Roadmap — AI DM Coterie-Sim

**Target Launch:** 2026-Q4 (Itch.io)  
**Status:** v1 development (T14 narration + T19 recall core loop)  
**Last Updated:** 2026-08-07

---

## Current Sprint

| T-Number | Feature | Status | Blocker |
|----------|---------|--------|---------|
| **T19** | NPC Recall (turn 2+) | ✅ Fixed | None |
| **T14** | Narration Engine | 🟢 Shipped | None (volume test pending T15) |
| **T15** | Model Cost Re-eval | ⏳ Blocked | Need T14 run with 1000+ turnos |
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
