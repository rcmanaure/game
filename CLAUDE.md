## graphify

Quick: `graphify query "<question>"` for scoped subgraphs. Use `graphify path` for relationships, `graphify explain` for concepts. Run `graphify update .` after code changes.

## AI Game Studio

Studio: `@game-dev/game-lead` (orchestrator) + 5 specialists.

**Principles:** Ship fun. Clean code. No over-engineering. Simple solutions.

**Decision flow:** Analyze → Classify (design/code/perf/bug) → Delegate → Synthesize → Recommend.

**Code policy:** Analyze → Explain → Propose → Sign-off → Implement.

See `docs/production/RECREATE_GAME_DEV_STUDIO.md` for full setup.  
See `~/.claude/agents/game-dev/docs/USAGE_GUIDE.md` for workflows.

---

## Design System
Always read docs/reference/DESIGN.md before visual/UI decisions. Font, color, spacing defined there. No deviation without approval.

## Tech Stack (Locked)
- Frontend: DOM + CSS + Motion.dev (Phaser research: game-engines-lightweight.md ruled it out)
- LLM: LangGraph.js (proven, no refactor needed)
- Narrative: Ink + inkjs (narration consistency + permadeath v1)

Detailed rationale: See `docs/research/` directory. Tech decisions are locked; research amendments go there, not inline.

## Research Docs Convention
All framework/platform/engine research lives in `docs/research/` with `YYYY-MM-DD-topic.md` naming.
Priority research (frameworks, competitors, stack validation) is ground truth for tech decisions.
Findings are cited to primary sources (GitHub, official docs, benchmarks).
