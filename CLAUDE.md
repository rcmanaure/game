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
- Narrative: plain narration (own research 2026-08-04 rejected Ink/Twine/Yarn; inkjs never installed, no code references it — Ink+inkjs lock dropped 2026-08-13, decision D-2)

Detailed rationale: See `docs/research/` directory. Tech decisions are locked; research amendments go there, not inline.

## Research Docs Convention
All framework/platform/engine research lives in `docs/research/` with `YYYY-MM-DD-topic.md` naming.
Priority research (frameworks, competitors, stack validation) is ground truth for tech decisions.
Findings are cited to primary sources (GitHub, official docs, benchmarks).

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
