## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

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

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Tech Strategy (2026-08-06 Research Validation)

### Frontend Architecture: DOM+CSS-first (not Phaser)
- **Rationale** (research: game-engines-lightweight.md): Phaser (71+ KB gzipped) solves physics/collision/tilemap — zero of which this game needs. Text + card UI are DOM's native sweet spot.
- **Stack**: Vanilla DOM + CSS + Motion.dev (5 KB optional for tweens)
- **Bundle impact**: 5–10 KB vs Phaser 71+ KB
- **Decision**: Decision #19-21 locked Phaser/PixiJS; this research is a candidate amendment for future review, not immediate override. If animation becomes bottleneck, escalate to Konva.js (55 KB) or Pixi.js (90 KB), not Phaser full build.
- **Post-v1 option**: If sprite count explodes (100+), switch to Pixi.js as pure renderer, keep DOM for UI.

### LLM Orchestration: LangGraph.js (no change)
- **Rationale** (research: llm-orchestration-frameworks.md): Already using, works well. No urgency to refactor.
- **Alternatives evaluated**: Anthropic Agent SDK (simpler if starting fresh), raw async/await (viable only if linear forever, but T14 branches). 
- **Decision**: Stay course.

### Narrative Templating: Ink + inkjs (Post-T14, candidate adoption)
- **What it is** (research: narrative-frameworks.md): Narrative DSL (4.8k stars, MIT, actively maintained 2026-05-05) with proven LLM integration pattern (poltergink library).
- **Why it matters**: T14's `narrate` node could use Ink templates instead of raw LLM calls. Ink's game-side function architecture is built for LLM calls.
- **Scope**: Post-v1 optimization. T14 ships with raw prompts; Ink adoption is an optional refactor if narration quality needs structuring.
- **Decision**: Monitor. Not blocking, but flag for T14 design review.

### Competitive Landscape (2026-08-06 AI Platforms Research)
- **Shipped competitors**: AI Dungeon (red ocean), NovelAI (NSFW niche), Character.AI (red ocean, 20M users), Hidden Door (licensed fiction social), Voyage (Latitude, April 2026 beta, **direct competitor**).
- **Voyage threat**: Multiplayer, world memory, freemium model. If hits traction 2H 2026, will capture early adopters. Mitigation: v1 ships DM quality + permadeath stakes; post-v1 `recall` node (cross-playthrough NPC persistence) is genuine differentiator nobody else ships.
- **Our differentiators** (post-v1): NPC recall across separate campaigns (novel), permadeath as intentional design (not accident), art-cache taxonomy (bounded archetype keys, unbounded narration), frozen STYLE FORMULA + dark-fantasy coherence.
- **One-time-unlock risk**: Decision #22's $15–$25 unlock bets against freemium/subscription industry. If conversion falls short, may need pivot to freemium. Monitor post-launch conversion data before v1.1 roadmap.

## Research Docs Convention
All framework/platform/engine research lives in `docs/research/` with `YYYY-MM-DD-topic.md` naming.
Priority research (frameworks, competitors, stack validation) is ground truth for tech decisions.
Findings are cited to primary sources (GitHub, official docs, benchmarks).
