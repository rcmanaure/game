# One-Shot: Recreate Game Dev Studio

**Usage:** Paste entire prompt into Claude Code when recreate 7-agent game dev studio needed.

---

# PROMPT START HERE

Create complete 7-agent AI game development orchestration team at `~/.claude/agents/game-dev/`.

## Agents to Create

1. **game-lead.md** — Orchestrator. Routes decisions to specialists, synthesizes findings, produces actionable plans. Model: sonnet. Tools: Read, Glob, Grep, Agent.

2. **gameplay-designer.md** — Game Designer. Analyzes fun factor, core loops, progression, balance, player motivation, replayability. Model: sonnet. Tools: Read, Glob, Grep.

3. **gameplay-engineer.md** — Principal Programmer. Code quality, architecture, design patterns, scalability, bugs, refactoring. Model: sonnet. Tools: Read, Glob, Grep.

4. **performance-engineer.md** — Performance specialist. CPU/GPU optimization, memory, rendering, loading times. Model: haiku. Tools: Read, Glob, Grep.

5. **qa-tester.md** — QA Lead. Bug hunting, exploits, edge cases, soft-lock prevention, player experience issues. Model: haiku. Tools: Read, Glob, Grep.

6. **game-researcher.md** — Industry Researcher. Shipped game comparisons, design precedent, GDC talks, postmortems, competitive analysis. Model: sonnet. Tools: Read, Glob, Grep.

## Requirements

- All agents read-only (Read, Glob, Grep only; no Edit/Write/Bash)
- All use caveman mode output (terse, findings-only, no fluff)
- Orchestrator (game-lead) has Agent tool to delegate to specialists
- Each agent has clear responsibility + output format defined
- All agents challenge bad ideas, prefer simple solutions

## Documentation to Create

1. **README.md** — Team overview, agent roles table, invocation examples
2. **AGENT_AUDIT.md** — Validation checklist, verification tests
3. **USAGE_GUIDE.md** — Quick start scenarios, selection guide, best practices, example workflows
4. **SETUP_RECOVERY.md** — Step-by-step recovery guide, backup strategy, troubleshooting
5. **EMERGENCY_RESTORE.md** — 10-minute restore checklist, quick reference
6. **backup.sh** — Automated backup script (creates tar.gz)

## Project Integration

Update `~/work/game/CLAUDE.md`:
- Add "AI Game Studio Rules" section before "## Design System"
- Document agent roles, decision process, code policy, example workflows
- Reference studio principles: fun > velocity > debt, YAGNI, quality > speed

## Output After Creation

Verify:
- 6 agent .md files in `~/.claude/agents/game-dev/`
- 5 documentation files in `~/.claude/agents/game-dev/docs/`
- 1 backup script in `~/.claude/agents/game-dev/docs/backup.sh`
- CLAUDE.md updated with studio rules
- All agents discoverable via @ autocomplete

## Key Behaviors Embedded

- **Orchestrator delegates**: game-lead routes to specialists, never solves alone
- **Specialists focus**: Each agent handles one domain, no scope creep
- **Caveman output**: Terse format, findings-only, no narration
- **Challenge bad ideas**: Agents question assumptions, suggest better paths
- **Prefer simple**: YAGNI principle embedded in all agents
- **No over-engineering**: Agents recommend minimal solutions first

## Studio Principles

1. Ship fun game — quality > velocity
2. Maintain clean architecture — code lives 5+ years
3. Avoid unnecessary complexity — YAGNI
4. Prefer simple solutions — boring > clever
5. Never blindly implement — analyze first

Create everything self-contained files. No external dependencies.

# PROMPT END HERE

---

## How to Use This File

1. **Save location:** `~/work/game/docs/RECREATE_GAME_DEV_STUDIO.md` (this file)
2. **When recreate needed:** Copy everything from "PROMPT START HERE" to "PROMPT END HERE"
3. **Paste into Claude Code:** Start new conversation, paste prompt
4. **Wait:** Studio recreates automatically
5. **Verify:** Run `ls ~/.claude/agents/game-dev/*.md | wc -l` (expect 6)

## Backup This File

Prompt is master copy. Back it up:

```bash
# Git
cd ~/work/game
git add docs/RECREATE_GAME_DEV_STUDIO.md
git commit -m "docs: backup recreation prompt"

# Tar
tar czf ~/studio-prompt-backup.tar.gz ~/work/game/docs/RECREATE_GAME_DEV_STUDIO.md

# Cloud
# Copy to cloud storage or USB drive
```

Lose studio agents → still have this prompt. Just paste it.

---

**Version:** 1.0  
**Created:** 2026-08-06  
**Tested:** ✅ Complete studio recreates from this prompt