# Documentation Structure

## Folders

### `production/` — Studio Setup & Roadmap (2 files)

- **RECREATE_GAME_DEV_STUDIO.md** ← Setup reference, @game-dev agents
- **ROADMAP.md** ← Scope, decisions, T-numbers, deployment timeline (referenced from root README)

### `testing/` — Quality Snapshot (2 files)

- **REPO_STATE_2026-08-12.md** ← Forensic repo-state audit: what exists, what runs, what's placeholder. Current source of truth for state.
- **TEST_RESULTS_FINAL.md** ← Test coverage snapshot from 2026-08-06, superseded by the above (referenced from root README)

### `reference/` — Reference & System Design (1 file)

- **DESIGN.md** ← Design system (locked, do not modify)

### `research/` — Technology Research (locked decisions)

- `game-engines-lightweight.md` — Why DOM+CSS (not Phaser)
- `llm-orchestration-frameworks.md` — Why LangGraph.js
- `ai-game-platforms.md` — Competitive analysis
- `2026-08-*.md` — Decision research (dated)

## How to Use

1. **Setting up @game-dev?** → Read `production/RECREATE_GAME_DEV_STUDIO.md`
2. **Visual/UI decision?** → Read `reference/DESIGN.md` first, no deviation without approval
3. **Tech stack question?** → Check `research/` before re-litigating a locked decision
