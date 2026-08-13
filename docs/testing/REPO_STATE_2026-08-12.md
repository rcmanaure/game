---
version: 1.0.0
date: 2026-08-12
scope: forensic repo-state audit
instrument: docs/GAME_REPO_STATE_AUDITOR_EN.md
supersedes: docs/testing/TEST_RESULTS_FINAL.md (2026-08-06)
---

# REPO STATE — ai-dm-platform (AI DM Coterie-Sim) — 2026-08-12

Produced by running `docs/GAME_REPO_STATE_AUDITOR_EN.md` against the repo at
commit `6017c0d` (branch `feat/fun`). This is a state audit, not a viability
audit — the "is this a good idea" question belongs to `docs/game-auditor.md`.

**Method.** Full source read, git history, `npm test`, both `tsc --noEmit`
passes, and two live harness turns actually executed. Every "Functional" row
below has one of: I ran it, or a passing test covers it. Everything else is
capped at "Implemented, unverified" per §1 Pass 3 of the instrument.

---

## Executive summary

The harness (CLI single-player pipeline) is real and I ran it: two live turns,
end to end, correct rolls, coherent gothic narration, art placeholder. That part
works. The backend is a scaffold that **nobody can log into** — `AuthService`
exists but no controller, no route, no password hashing calls it, so no JWT can
ever be issued, so the WebSocket gateway (the only gameplay entry point) is
unreachable by any client. That was not in `TODO.md`.

The single most important signal: **`CHANGELOG.md` v0.1.0.0 claimed features the
code does not have.** "The story remembers characters… recalled and threaded into
the narration" — `npcContext` is computed at `graph.service.ts:76-90` and never
passed into `harnessGraph.invoke()`; no code anywhere writes an `npcs` row, so
the query reads an always-empty table. "Log in and stay logged in" — there is no
login. `TODO.md` M2 already called this "ship theater"; the CHANGELOG then
shipped it as done anyway. (Corrected 2026-08-12 — see *Corrections applied*.)

Second signal: **permadeath is mechanically unreachable on the common path.**
`rules.ts` only ever sets `statDeltas.hp` for `opposedCheck` + `eventType ==
"combat"` + failure. A live turn — "I lunge at the ghoul with my blade" —
resolved as `rollType: "attack"`, failed, and cost the character exactly nothing.
Player HP cannot drop on the `attack` or `check` paths. `craving` is computed but
`validator.ts:60` reads only `hp`, so it never applies either.

---

## Systems map

| System | Status | Evidence | Notes |
|---|---|---|---|
| **Core loop / gameplay** |
| Turn pipeline (resolve→validate→narrate→art) | **Functional** | ran `npx tsx src/harness/run.ts` twice, both exit 0, coherent output | verified in this audit, in-memory, no DB |
| Server-authoritative dice | **Functional** | `rules.ts:8-10`, 14 passing tests | `randomInt`, LLM never supplies a roll |
| Logic-model intent + sanitize | **Functional** | `state.ts:72-82`, tests cover `"None"`/`"null"`/`"N/A"` coercion | retry-once-then-safe-default works |
| Narration + refusal fallback | **Functional** | `narration.ts`, 8 tests, live output | 3-stage chain, always non-empty |
| Damage / combat model | **In progress** | `rules.ts:147-154, 176-184` | player HP only mutates on opposedCheck+combat+fail; comments say "placeholder band" |
| Craving (genre mechanic) | **In progress** | computed `rules.ts:146`, never applied `validator.ts:60` | value stays at initial forever — confirmed live (`craving=1` before and after) |
| Permadeath (Active→Torpor→Dead) | **Implemented, unverified** | `validator.ts:20-46`, 8 tests pass | logic correct and tested; unreachable in play, see above |
| NPC recall (T19, "flagship") | **Not started** | `graph.service.ts:76-90` dead value; zero `npcRepo.save`/`INSERT INTO npcs` in repo | State schema has no `npcContext` field |
| **State & data** |
| Entities + InitSchema migration | **Implemented, unverified** | `migrations/1786034027189` | never run against a live Postgres in this audit; no container up |
| Turn idempotency / reservation | **Implemented, unverified** | `turn-reservation.service.ts` | camelCase quoting fixed, no integration test |
| LangGraph checkpointing | **Implemented, unverified** | `graph.ts:148-152` `ensureCheckpointer()` | closes TODO M5.1 |
| Chronicle lifecycle | **Not started** | `ChronicleEntity` referenced only in `data-source.ts:17` | nothing creates or ends a chronicle |
| **Auth / API** |
| JWT sign/verify + WS handshake | **Implemented, unverified** | `auth.service.ts`, `jwt-ws.gateway.ts:50-74` | |
| Login / register endpoint | **Not started** | only `@Controller("health")` in the whole backend | `AuthService` has zero call sites |
| `roles.guard` | **Placeholder** | `roles.guard.ts:29` `user.role \|\| UserRole.User` | fail-open; `jwt.strategy.ts` never hydrates a role |
| Health endpoint | **In progress** | `health.controller.ts` | no `@Public()`, global `JwtAuthGuard` → returns 401 |
| **Content vs systems** |
| Playable characters | **Placeholder** | `character.ts:76-120`, 2 samples, comment: "not the real roster" | |
| Attribute set | **Placeholder** | `character.ts:6-7` "first-pass placeholder set, not a locked decision" | plain D&D SRD attributes |
| Encounters / levels / balance data | **Not started** | none in repo | |
| **UI/UX** | **Not started** | no frontend directory, no HTML/CSS | README concedes it |
| **Art/audio** |
| Art generation | **Implemented, unverified** | `art.ts:26-71` real OpenRouter REST call | never exercised live — `DISABLE_IMAGE_GEN` path returns `picsum.photos` |
| Drift harness (T27) | **Implemented, unverified** | `drift.ts` | needs paid image calls |
| Audio | **Not started** | nothing | `PROJECT_FACTS.local.md`: "audio undecided" |
| **Tooling / build** |
| CI | **Functional** | `.github/workflows/ci.yml` | 2 typechecks + harness tests; both `tsc --noEmit` pass locally (exit 0) |
| Docker Compose (Postgres) | **Implemented, unverified** | `docker-compose.yml` | no container running; credentials disagree with `.env.example` |
| Buildable executable | **Not started** | no build script, no `dist` target, no deploy config | `npm run backend:dev` is `ts-node` only |
| **Tests/QA** |
| Harness tests | **Functional** | 62 pass, 0 fail, 1.5s | README says 52 — stale |
| Backend tests | **Placeholder** | `src/backend/graph/__tests__/*` | jest not installed and not in `package.json`; `npm test` globs `src/harness/__tests__` only, so these have never executed |

---

## What ACTUALLY works today

Verified in this audit, nothing inferred:

1. `npm test` — 62 tests, 62 pass.
2. `npx tsc --noEmit -p tsconfig.json` and `-p tsconfig.backend.json` — both exit 0.
3. Two full live turns via the harness. Sample output:

```
=== Turn 1 (mira-ashgrave): "I try to pick the lock on the crypt door" ===
Check: check dexterity+lockpicking roll=19 mod=3 vs DC 15 -> SUCCESS (none)
Character: 12/12 hp, status=active, craving=1
Narration: The rusted tumblers surrender with a reluctant *click*, as if the
crypt itself exhales after centuries of holding its breath. …
Art: https://picsum.photos/seed/crypt-door/512/512
```

The narration quality is genuinely good and on-tone. It is the strongest asset in
the repo.

4. Latency, measured here: **81.4s wall for one turn** (`time`, minus ~3s tsx
   startup). A second turn exceeded 120s. Both worse than the 36.9s average
   recorded in the T15 volume test.

Everything else in the backend is read-verified only. Nothing has ever been run
against a live Postgres.

---

## What's broken or half-done

1. **No way to authenticate.** `grep -rn "AuthService" src/` returns the class
   definition and one `providers:` line. No `@Post('/login')`, no
   `@Post('/register')`, no bcrypt/argon dependency. `users.passwordHash` is a
   column nothing writes. The WS gateway rejects unauthenticated sockets
   correctly and then there is no path to a valid token.
2. **NPC recall is dead code.** `graph.service.ts:76-90` builds `npcContext`,
   then `invoke()` at :96 omits it; `graph.ts:20-29` has no field for it.
   Combined with (3), the feature has two independent reasons it can't work.
3. **`npcs` is a write-nothing table.** Only `npcRepo.findOne` exists.
   `graph.service.ts:141-145` is a comment where the write should be.
4. **`GET /health` returns 401.** Global `APP_GUARD: JwtAuthGuard`
   (`app.module.ts:57`), no `@Public()` on the controller. `auth.decorators.ts`
   exports `Public` — unused.
5. **`'placeholder-chronicle-id'`** (`jwt-ws.gateway.ts:113,116`) — every user
   without an `activeChronicleId` shares one bucket. Nothing ever sets
   `activeChronicleId`, so that is every user.
6. **Client-supplied `chronicleId` is trusted unvalidated**
   (`jwt-ws.gateway.ts:109`) and `countTurns` filters on `chronicleId` with no
   `userId` (`graph.service.ts:176`). Cross-user turn insertion.
7. **`roles.guard.ts:29` fails open.** `user.role` is never set anywhere, so
   `|| UserRole.User` grants User to everyone. Dormant — no `@Roles` usage yet.
8. **No timeout on any LLM call.** `narrateWithFallback` catches throws but has
   no deadline; `resolve` has none either. A hung free-tier request hangs the
   turn indefinitely, and the WS client has no cancel path.
9. **`.env.example` and `docker-compose.yml` disagree.** Example says
   `postgresql://postgres:postgres@localhost:5432/ai_dm_platform`; compose
   defaults to `game/game/game`. Following the README verbatim,
   `npm run migration:run` fails. `.env.example` is also missing `FRONTEND_URL`,
   `LOGIC_MODEL`, `CREATIVE_MODEL`, `IMAGE_MODEL`, `CREATIVE_MODEL_ALT` — all
   documented in the README, all read by the code.
10. **`env.ts` is a no-op** — `loadEnv()` has an empty body and a `path`
    parameter it ignores.

---

## Contradictions found (reported, not resolved in favour of either side)

| Source A | Source B | Reality |
|---|---|---|
| `CHANGELOG.md`: "The story remembers characters… threaded into the narration" | `TODO.md` M2: "ship theater… Flagship = lie" | TODO was right |
| `CHANGELOG.md`: "Log in and stay logged in" | no controller exists | CHANGELOG was wrong |
| `ROADMAP.md`: "T19 ✅ Fixed — Recall now executes turn 2+ with correct context" | `graph.service.ts:96` | ROADMAP was wrong |
| `CLAUDE.md` + `ROADMAP.md` "Locked Decisions": "Narrative: Ink + inkjs" | `docs/research/2026-08-04-text-format-tooling-research.md:193`: "No action needed on narrative-engine tooling — Ink/Twine/Yarn [ruled out]"; `package.json` has no inkjs | locked to a dependency the project's own research rejected and that was never installed |
| `README.md`: "52 tests" | 62 | stale |
| `ROADMAP.md` gate: "T14 volume test pass (1000+ turns, <5% failure)" | T15 ran 100 turns, and its own text calls the 100% "masked by fail-open fallback" | gate unmet and the number is not what it looks like |

---

## Technical debt detected

- **A test suite that certifies the half that works.** 62 green tests cover pure
  functions in `src/harness` — dice, schema, validator. Zero cover the backend,
  which is where every open P0 lives. Green CI reads as "the project is healthy."
- **Tests that assert nothing.** `graph.service.test.ts:83-106` mocks `runTurn` —
  the method under test — with `jest.spyOn(service, 'runTurn').mockImplementationOnce(...)`
  and then never calls it. Two adjacent tests contain only comments where
  assertions should be ("Simplified version shown here"). If jest were installed,
  these would pass while testing nothing.
- **Three unpinned Node versions**: CI 24, dev 26.5.1, `@types/node` ^22. Already
  flagged in `ci.yml`, still open.
- **Hand-written SQL with quoted camelCase** in four places. Symptom fixed, class
  alive — the next hand-edited column name reintroduces it. `TODO.md` M1.1 says
  this itself.
- **Doc mass**: 6,159 tracked lines of Markdown vs 3,245 of TypeScript (1,056 of
  that tests). `TODO.md` alone is 513 lines. The docs are unusually high quality
  — `TODO.md` and `PROJECT_FACTS.local.md` are more honest than most shipped
  postmortems — but the ratio is where the hours went.

---

## Scope risks

1. **Content:systems is inverted the rare way — there is no content.** Two sample
   characters explicitly marked "not the real roster", a placeholder attribute
   set, zero encounters, zero balance data. This is not the usual indie failure
   (40 levels, 2 systems); it is the mirror image, and it means the "is it fun"
   question has never been askable.
2. **Art is not the bottleneck; the loop's mechanical stakes are.** Art is
   model-generated and the pipeline is written. But a failed attack costs
   nothing, craving never rises, and death is unreachable — so the permadeath
   premise the whole design rests on has never fired once, in any run, by anyone.
3. **Latency is a design constraint, not a tuning issue.** 81s measured.
   `PROJECT_FACTS.local.md` threshold set 2 KILLs above p95 25s. That is 3× over
   the KILL line on the tier being shipped, and streaming narration (the PIVOT
   path) needs a frontend that does not exist.
4. **No buildable artifact.** No build script, no bundle, no deploy target, no
   running database. "Can an executable be generated today?" — no.
5. **Cadence is cold.** 40 of 65 commits landed on 2026-08-06. The last five days
   total 9 commits, mostly docs and audit instruments. `PROJECT_FACTS.local.md`
   field 2 already flags this.

**No global % complete is given.** The countable basis: `ROADMAP.md` lists 5
pre-launch quality gates — **0 met**. `TODO.md` M1–M3 lists 10 P0 rows — **10
still open** (M1.1 downgraded to P2 by symptom fix; M5.1 and M3.3, outside that
block, have landed). Of 8 gameplay systems the design implies, **5 have
functional code**, and 3 of those 5 are the deterministic core (dice, schema,
validator) rather than the game.

---

## What's next (prioritized)

### 1 — Blockers. Nothing below matters until these land.

| # | Item | Effort |
|---|---|---|
| B1 | Auth endpoints: `POST /auth/register` + `POST /auth/login`, password hashing, chronicle created on register and stamped to `users.activeChronicleId`. Kills M1.3 as a side effect. | **M** |
| B2 | Stand up Postgres, run migrations, complete one turn over the real WS path. Every backend "unverified" above collapses to a yes/no in one afternoon. | **S** |
| B3 | Make the player able to lose. Apply `statDeltas.craving` in `applyMutation`; give the `attack`/`check` failure path a real HP cost. Until this, permadeath does not exist. | **S** |
| B4 | `@Public()` on `HealthController`. | **S** — one line |

### 2 — High impact / low effort

| # | Item | Effort |
|---|---|---|
| H1 | Correct `CHANGELOG.md` and `ROADMAP.md` for recall and login. | **S** — ✅ done 2026-08-12 |
| H2 | Validate `chronicleId` ownership; add `userId` to `countTurns`. | **S** |
| H3 | Fix `.env.example` credentials + the five missing vars. New-machine setup currently fails at step 4. | **S** |
| H4 | `Promise.race` deadline on both LLM calls. 81s measured, no timeout anywhere. | **S** |
| H5 | Resolve the Ink/inkjs contradiction — unlock it or install it. | **S** |

### 3 — The rest, in order

| # | Item | Effort |
|---|---|---|
| R1 | Install jest + `@nestjs/testing`, delete the assertion-free tests, wire `npm run test:backend` into CI (M3.1/M3.2) | **M** |
| R2 | Wire `npcContext` into State and the narrate prompt (M2.1) | **S** |
| R3 | Decide and implement the NPC persist trigger (M2.2, open question Q2 — genuinely undecided) | **NOT ESTIMABLE** |
| R4 | Chronicle termination on death (M2.5) | **M** |
| R5 | Frontend T0 (M6) | **L** |
| R6 | `roles.guard` fail-closed + role hydration (M1.5) | **S** |

Estimates are S/M/L against the observed 25.4h burst in `PROJECT_FACTS.local.md`
field 2 — which that file itself classifies as HYPOTHESIS for any sustained rate.
Treat them as ordering, not as a schedule.

---

## Open questions

1. **Has the backend ever completed one turn against a real Postgres?**
   `TODO.md` M1.1 says no as of 2026-08-12. This audit could not run it — no
   container, no configured DB. If the answer is still no, every backend row
   above stays "unverified" no matter how the code reads.
2. **Was the login endpoint deleted, or never written?** It is absent from
   `TODO.md`'s 36 tasks despite four specialist reviews. An omission that
   consistent usually means someone believes it exists.
3. **Is `attack`-path damage deliberate?** A failed attack costing nothing may be
   an intended asymmetry being read here as a bug. If intended, permadeath needs
   a different trigger and the design should say which.
4. **Has anyone played more than a handful of CLI turns?**
   `PROJECT_FACTS.local.md` field 8 says zero external playtests. Internal is
   unrecorded either way.
5. **Art generation against the real endpoint** — has `generateArt` ever returned
   a real image? `extractImageUrl` guesses at three response shapes and fails
   loud on all three. That code path may never have executed.

---

## Work performed (2026-08-12)

Complete record of this session. Nothing outside this list was touched; no
source code under `src/` was modified.

### 1. Audit — commands actually run

| Command | Result |
|---|---|
| `git log`, `git branch -a`, per-day commit counts | 65 commits, 2026-08-03 → 2026-08-12, 40 of them on 08-06 |
| `npm test` | 62 pass / 0 fail / 1.55s |
| `npx tsc --noEmit -p tsconfig.json` | exit 0 |
| `npx tsc --noEmit -p tsconfig.backend.json` | exit 0 |
| `npx tsx src/harness/run.ts "I try to pick the lock on the crypt door"` | exit 0, SUCCESS on DC 15, full narration + art placeholder |
| `time npx tsx src/harness/run.ts "I lunge at the ghoul with my blade"` | exit 0, **81.4s wall**, attack FAIL, zero stat deltas |
| `graphify query`, TODO/FIXME/placeholder sweep, full read of all 30 files under `src/` | see Systems map |
| `docker ps` | no containers — no Postgres was available to test against |

Two findings came out of *running* rather than reading, and would not have been
visible from the code alone: the 81.4s latency, and the fact that a failed
attack costs the character nothing.

### 2. Findings not previously recorded anywhere in the repo

These are new — they are not in `TODO.md`, `ROADMAP.md`, or
`TEST_RESULTS_FINAL.md`:

1. **No login/register endpoint exists.** `AuthService` has zero call sites. The
   backend is unreachable by any client. Absent from `TODO.md`'s 36 tasks despite
   four specialist reviews.
2. **Permadeath is unreachable on the common path.** Only `opposedCheck` +
   `eventType == "combat"` + failure ever sets `statDeltas.hp`.
3. **Measured latency 81.4s / >120s**, against a recorded average of 36.9s and a
   precommitted KILL threshold of p95 > 25s.
4. **`.env.example` credentials contradict `docker-compose.yml`** — README setup
   fails at step 4 on a clean machine. Five documented env vars missing from the
   example file.
5. **`graph.service.test.ts` mocks the method under test and never calls it**;
   two adjacent tests contain no assertions at all.

Everything else in this report either confirms or re-dates an item `TODO.md`
already had.

### 3. Files changed

| File | Change |
|---|---|
| `CHANGELOG.md` | 6 entries rewritten (below) |
| `docs/production/ROADMAP.md` | 8 sections corrected (below) |
| `docs/README.md` | `testing/` section 1 file → 2; `TEST_RESULTS_FINAL.md` marked superseded |
| `docs/testing/REPO_STATE_2026-08-12.md` | **new** — this file |

**`CHANGELOG.md`** — every claim that contradicted the code:

| Was | Now |
|---|---|
| "Log in and stay logged in" | "JWT plumbing" — no endpoint, `AuthService` has no call sites, nobody can log in |
| "The story remembers characters… threaded into the narration" | recall query runs, result discarded, no `npcs` row ever written, narration identical either way |
| "Actions have visible consequences… text the player reads" | two consequence lines describe effects that never apply (`Craving increased.`, `Target took N damage.`); no frontend, no player reads any of it |
| "Permadeath." | "Permadeath rules" — unit-tested and correct, unreachable in play, no character has ever died |
| "Turns persist." | + never exercised against a live database |
| Fixed: "NPC recall… never ran" | query runs now, result still discarded, feature remains unshipped |
| Fixed: "backend could not complete a turn against a real database" | + read-verified only; this and the two fixes below it are unconfirmed |

**`docs/production/ROADMAP.md`**:

- Status line → names the real state (harness runs; backend has no login and has never hit a live DB)
- `Last Updated` 2026-08-07 → 2026-08-12
- T19 row `✅ Fixed / None` → `🔴 Not shipped` + reason
- T25 row → notes the rules underneath it are unreachable
- `## P0 Fixes (Complete)` → `## P0 Status`; T19 marked half-fixed with the discard explained; ten open M1–M3 P0s stated; missing auth endpoint called out as the largest one, and as absent from the backlog
- T15 section → dated update with the 81.4s measurement and the p95 > 25s KILL threshold
- Locked Decisions → Ink/inkjs flagged ⚠️ contradicted: research doc rules it out, `inkjs` not a dependency, no code references it; notes `CLAUDE.md` needs the same call
- Timeline → "Now" repointed at M1–M3 (auth, live DB turn, make the player able to lose)
- Quality Gates → `0 of 5 met`, each gate annotated with why
- Known Issues → two false ✅ rows replaced with 10 open rows, severity-ranked
- Dead `docs/production/P0_FIX_PLAN.md` link removed (file does not exist)
- `TEST_RESULTS_FINAL.md` marked superseded; footer points here

### 4. Not done — deliberately out of scope

- **No source code changed.** Every blocker in *What's next* is still open. The
  corrections were to documentation only.
- `README.md` still says "52 tests" (actual 62).
- `CLAUDE.md:26` still locks `Ink + inkjs`.
- Nothing committed — all four files are uncommitted working-tree changes.
