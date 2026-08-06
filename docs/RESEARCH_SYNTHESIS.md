# Research Synthesis: Tech Stack Validation (2026-08-06)

## Status: UPDATED 2026-08-06 (post-agent-review). Quality > Velocity principle locked. Ink + inkjs NOW. T19 pulled to v1.

**Decisions locked this session**:
- Ink + inkjs in T14 scope now (not post-v1): +1-2d for narration consistency
- T19 (recall node) pulled to v1: quality enabler for permadeath
- DISABLE_IMAGE_GEN=true stays (drift testing deferred)

---

## What We Have

| Component | Decision | Status | Notes |
|-----------|----------|--------|-------|
| Backend | NestJS + Postgres | ✓ Locked (Decision #19) | Infrastructure scaffolded (T7 auth done). Ready for T3/T4/T14. |
| LLM Orchestration | LangGraph.js | ✓ Locked (Decision #21) | Works. No refactor needed. |
| Frontend Engine | Phaser/PixiJS | ✓ Locked (Decision #2/#19-21) | Research suggests DOM+CSS lighter; Phaser not over-engineered for scope, just heavier than minimum. No break. |
| Narrative Engine | Custom LLM prompt | ✓ Current | Works (T2/T22 validated). Ink integration candidate (post-v1). |
| Art Generation | OpenRouter image models | ✓ Locked (Decision #15) | STYLE FORMULA frozen (T13). Drift mitigation tested (T22 harness). |
| IP + Aesthetic | Dark-fantasy + retro 70s-90s TTRPG | ✓ Locked (DESIGN.md) | Coherent vision. No change. |

---

## What We Can Adopt (Candidate, Not Blocking)

### 1. Ink + inkjs for T14 Narration Templating (Post-v1)

**Current state**: T14 `narrate` node fires raw LLM prompts → returns free-text.

**Ink pattern**: Structure narration via Ink templates → LLM fills blanks → Ink runtime handles flow.

**Evidence**: 
- Ink explicitly supports game-side function calls (documented in WritingWithInk.md, Part 3, Section 7).
- poltergink (TypeScript LLM wrapper for inkjs) proves pattern works without modifying Ink.
- 4,889 GitHub stars, MIT, actively maintained (2026-05-05).

**Decision**: 
- **v1 scope**: Ship with raw prompts (current T14 design). No Ink dependency.
- **Post-v1**: If narration quality needs structuring (e.g., cliffhanger consistency), refactor `narrate` node to use Ink templates. Effort: low (new prompt template only, no graph restructure).
- **Blocker**: None. Ink is optional infrastructure, not critical path.

### 2. DOM+CSS-First Frontend (Post-v1 Optimization)

**Current state**: Phaser 3 decision locked (Decision #2/#19-21).

**Research finding**: Phaser (71+ KB custom build gzipped) is heavier than necessary for text + card UI (DOM's native sweet spot).

**Evidence**:
- Phaser solves: physics, collision detection, tilemap rendering. **None needed.**
- Phaser solves: input/animation. **Both doable in DOM+CSS+Motion.dev (5 KB).**
- Bundle impact: Phaser 71+ KB vs DOM+CSS+Motion.dev 5–10 KB.
- Historical use case: Phaser optimizes for 2D games with lots of sprites + physics. Text games = different class.

**Decision**:
- **v1 scope**: Ship with Phaser per Decision #2/#19-21. No change.
- **Post-v1**: If frontend bundle size matters (sub-200 KB target), migrate core UI to DOM+CSS + Konva.js (55 KB) or Pixi.js (90 KB, pure renderer) for any heavy animations. Effort: medium (CSS + Phaser-to-Canvas swap), but post-launch.
- **Blocker**: None. Bundle size is not a blocker for MVP.

### 3. Narrative Structuring via Ink (Post-v1 Quality Gate)

**Current state**: T17 "narration hooks + recap" is stubbed. `narrate` node fires open-ended prompts.

**Ink enables**: Structured narration (e.g., "always include [cliffhanger]", "[recap this choice]", "[plant plot seed]").

**Evidence**: Ink's variable + function architecture lets game layer inject prompts like: `{ playerChoice: $lastChoice, cliffhanger: true }` → Ink template produces: "After [choice], suddenly [LLM-generated complication]. What do you do?"

**Decision**:
- **v1 scope**: T17 ships as fire-and-forget recap (no Ink, raw prompt).
- **Post-v1**: Adopt Ink templates for `narrate` node structure. Elevates session consistency without LLM instruction tuning.
- **Blocker**: None.

---

## What We Should NOT Adopt

### 1. Rivets / Rivet.dev (Visual AI App Builder)

**Finding**: Rivet is real (open-source visual AI DAG builder by Ironclad), but:
- Designed for prototyping + design-time composition, not production game code.
- No multiplayer/persistence features.
- No game-specific affordances (input validation, state machine, etc.).
- Overkill for this scope (graph is already in code via LangGraph.js).

**Decision**: Skip. LangGraph.js in code is simpler than visual builder overhead.

### 2. Godot Web Export

**Finding**: Godot 4.x can export to web (35–100 MB WASM blob).

**Why not**: 
- Bundle size prohibitive for casual browser game (vs. 100–200 KB expected for JS-based).
- No feature win over Phaser for 2D text + card.
- Build complexity (C# or GDScript, separate CI pipeline).

**Decision**: Skip. Stick with NestJS backend + JS frontend.

### 3. Kaboom.js / KaPlay (Arcade Game Toolkit)

**Finding**: Kaboom.js is unmaintained (Replit discontinued). KaPlay successor exists (actively maintained) but is geared toward rapid arcade prototypes.

**Why not**:
- Not designed for narrative-heavy games.
- Community size too small (vs. Phaser's 3M+ downloads/week).
- No clear advantage over Phaser for this scope.

**Decision**: Skip. Phaser is the right breadth even if slightly heavier.

---

## Risk Assessment

### 1. Voyage (Latitude) Competitive Threat

**Finding**: Voyage launched April 2026 (beta), multiplayer RPG + world memory, freemium model. Direct competitor.

**If Voyage reaches GA in 2H 2026**:
- Early adopters will flock to multiplayer (we ship single-player v1).
- Persistent world memory is a Voyage native feature (we defer to post-v1 `recall` node).
- We lose "first mover" in the "AI RPG + world memory" bucket.

**Mitigation**:
- Ship v1 with exceptional DM quality + permadeath stakes. Differentiate on *game feel*, not features.
- Accelerate post-v1 `recall` node (cross-playthrough NPC persistence) as response. It's genuinely novel (no competitor ships it).
- Monitor Voyage's Q3 2026 feature set + user retention. If traction, plan v1.1 roadmap accordingly.

**No blocker**: v1 still ships on schedule. Risk is market capture speed, not technical feasibility.

### 2. One-Time-Unlock Monetization (Decision #22)

**Finding**: Industry standard is freemium or subscription ($5–$99/mo). Decision #22 bets on $15–$25 one-time unlock + limited free turns.

**Risk**: If conversion falls short, free-turn cap may frustrate casual players before they unlock.

**Mitigation**:
- Playtest retention during T22 (current harness validation).
- Lock STYLE FORMULA + bestiary quality early (T13 deliverable) so free session *feels* intentional, not restricted.
- Post-launch: Monitor free-to-unlock conversion rate. If <5%, pivot to freemium + optional $5/mo tier (Decision #22 contingency already discussed).

**No blocker**: Monetization is post-launch tuning, not v1 gate.

---

## Candidate Amendments to Decisions

### Decision #2 (Phaser/PixiJS) — Candidate for Post-v1 Review

**Current**: Phaser 3 locked for frontend.

**Evidence**: DOM+CSS-first is lighter + sufficient for text + card UI.

**Action**: Do not amend now. Monitor bundle size + animation performance in v1 beta. If <50 KB target is critical, revisit for post-v1 refactor.

### Decision #19 (NestJS Backend) — VALIDATED

**Evidence**: LangGraph.js orchestration is appropriate. Alternatives (Anthropic Agent SDK, raw async/await) are no better.

**Action**: No change.

### Decision #15 (OpenRouter Image Models) — VALIDATED

**Evidence**: STYLE FORMULA frozen, drift mitigation tested (T22). No alternative framework better.

**Action**: No change. Monitor Higgsfield Soul ID as post-launch contingency per TODOS.md.

---

## Research Summary

**Total research effort**: 4 agents, 10 docs (6 prior, 4 new this session), ~3,200 lines, primary sources only.

**Key docs**:
- `narrative-frameworks.md` — Ink + inkjs recommended (post-v1 adoption candidate).
- `game-engines-lightweight.md` — DOM+CSS-first lighter; Phaser okay but heavier than minimum.
- `llm-orchestration-frameworks.md` — LangGraph.js validated; no refactor needed.
- `ai-game-platforms.md` — Voyage is threat; differentiators are post-v1 features (recall node, permadeath).

**Conclusion**: No breaks. Stack is solid. Two candidate optimizations (Ink templating, DOM+CSS frontend) are post-v1 improvements, not blockers. Ship v1 as planned.

---

## What Needs Execution, Not Research

| Task | Owner | Timeline | Status |
|------|-------|----------|--------|
| T7 (JWT auth + WS) | Done (2026-08-06) | ✓ | Implemented. |
| T14 (DM-graph resolver) | Pending | Next (blocking almost all P1s) | Design ready. Start after T3/T4 entities or in parallel. |
| T3/T4 (Rate-limit + idempotency) | Pending | Next | Entities + guards needed before DM turn endpoint live. |
| T11 (Design/a11y inputs) | Deferred (blocking pre-build) | Before any frontend shipped | Checklist ready (8-item a11y in TODOS.md). Slot after next CEO review. |
| T22 (Harness verify) | Done (tested live) | ✓ | Harness validated; no live LLM call issues found. |
| T25 (Eval suite) | Deferred | Post-T14 | Depends on T14 backend integration. |

---

**Last updated**: 2026-08-06 (9:30 UTC)  
**Research quality**: Primary sources only (GitHub, official docs, benchmarks).  
**Next review trigger**: Voyage GA release, T14 completion, or post-launch monetization data.
