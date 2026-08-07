# @game-dev Agent Specialization Upgrades

## Summary
All 6 agents upgraded with domain-specific tools + refined prompts. No longer dependent on generic Read/Glob/Grep only.

---

## Agent Improvements

### 1. **gameplay-engineer** — Code Quality + Architecture
**Tools Added:**
- `code_callers`, `code_callees`, `code_def`, `code_blast`, `code_flow`, `code_refs` (gbrain)
- `mcp__gbrain__search` — full-text code search
- `WebSearch` — DB patterns, performance articles, framework docs

**Enhanced Prompt:**
- Use code_blast before proposing changes (10x load impact analysis)
- Review scalability ceiling (what breaks at concurrent load?)
- Check DB patterns (N+1 queries, missing indices, migrations)
- Verify concurrency safety (race conditions, idempotency, state machines)
- TypeScript strict mode compliance

**Model:** Sonnet (complex code analysis)

---

### 2. **performance-engineer** — Metrics + Profiling
**Tools Added:**
- `code_callees`, `code_def` (gbrain)
- `mcp__gbrain__search` — locate hot paths, allocations
- `WebSearch` — profiling tools, benchmarking frameworks

**Enhanced Prompt:**
- Trace hot paths using code_callees (entry point → hot loops)
- **DEMAND NUMBERS:** Before/after metrics required (ms, %, FPS)
- Player-visible first (FPS, latency, load time) before micro-opts
- LLM latency analysis (request → response time)
- DOM rendering bottlenecks (reflow, repaint)

**Model:** Sonnet (upgraded from Haiku for complex profiling)

---

### 3. **qa-tester** — Test Automation + Regression
**Tools Added:**
- `code_refs`, `code_def` (gbrain)
- `mcp__gbrain__search` — find validation, error handling
- `WebSearch` — testing frameworks, edge case patterns

**Enhanced Prompt:**
- Locate state machines and transitions (code_def)
- Exact reproduction steps required (setup, action, trigger)
- Permadeath edge cases (death during action, disconnect mid-turn)
- Concurrency testing (turn collision, NPC race conditions)
- Regression tests per major feature

**Model:** Sonnet (upgraded from Haiku for complex test planning)

---

### 4. **gameplay-designer** — Fun Metrics + Design
**Tools Added:**
- `WebSearch` — GDC talks, player retention data, game reviews
- `mcp__gbrain__search` — find progression systems, mechanics

**Enhanced Prompt:**
- **Quantify fun:** Fun Score (1-10) + why, not vague
- **Compare to shipped:** How do Hades, Disco, Slay the Spire solve this?
- Loop cycle time (seconds per iteration)
- Retention signal (would player replay? why/why not?)
- Player psychology: agency (meaningful choices?), mastery (skill expression?), autonomy (control visible?)
- Difficulty curve: tutorial friction, scaling to player skill

**Model:** Sonnet

---

### 5. **game-researcher** — Industry Precedent + Risk
**Tools Added:**
- `WebSearch` — GDC, postmortems, public data
- `mcp__gbrain__search` — local research, design docs

**Enhanced Prompt:**
- **Source hierarchy:** GDC > Official Postmortem > Public Data > Ban Speculation
- **CITE ALWAYS:** Link + date + developer quote (primary sources only)
- **Unknown → risk assessment,** not guessing
- Innovation classification: Proven Pattern / Variant / Experimental / Unknown Risk
- Failure modes: what broke in similar attempts?
- Market analysis: player retention, churn causes, competitor metrics

**Model:** Sonnet

---

### 6. **game-lead** — Orchestration (No Changes)
**Status:** ✅ Sufficient
- Read, Glob, Grep, Agent
- Orchestration role requires no tool upgrades

---

## Key Changes to Prompts

| Aspect | Before | After |
|--------|--------|-------|
| **gameplay-engineer** | Generic code review | DB + concurrency + scalability audit + type safety |
| **performance-engineer** | CPU/GPU/memory only | + LLM latency + DOM rendering + "demand numbers" |
| **qa-tester** | Bug reports | + State machine testing + regression testing + permadeath edge cases |
| **gameplay-designer** | Loop analysis | + Quantitative fun score + shipped game comps + player psychology |
| **game-researcher** | Shipped games only | + Source rigor + innovation risk classification + market data |

---

## Collaboration Pattern

All agents still route through **game-lead** for orchestration:
- game-lead classifies request → delegates to 1-3 specialists
- Specialists use tools independently
- game-lead synthesizes findings → recommends actions

No direct agent-to-agent calls (maintains clarity).

---

## Testing New Capabilities

Try these prompts with upgraded agents:

```
@gameplay-engineer
Review src/backend/graph/graph.service.ts for:
1. Scalability at 10x concurrent users (use code_blast)
2. N+1 query patterns (search for DB calls)
3. Race conditions on turn upsert (review concurrency)

@performance-engineer
Profile the turn resolution path:
1. Trace entry point runTurn → all downstream calls (code_callees)
2. Measure LLM latency vs DB latency
3. Which dominates? Recommend quickest win.

@qa-tester
Permadeath edge cases:
1. Death during NPC dialogue
2. Save file corruption during turn write
3. Concurrent turn submission
Document exact reproduction steps.

@gameplay-designer
Analyze retention for v1.1:
1. Fun Score (7/10) for core loop + why
2. How do shipped roguelikes sustain replays? (Hades, Slay the Spire)
3. Top 2 retention levers for this game

@game-researcher
Permadeath + LLM narration precedent:
1. Has this shipped before? (search GDC, postmortems)
2. Closest precedent? Risk assessment?
3. Player retention patterns in similar games?
```

---

## Impact

**Before:** Agents used only generic code reading (Read/Glob/Grep).  
**After:** Agents have domain-specific tools + refined mandates.

- **gameplay-engineer:** Can trace 10x load impact automatically
- **performance-engineer:** Can measure + profile LLM latency
- **qa-tester:** Can locate edge cases via state machine analysis
- **gameplay-designer:** Can cite shipped game precedent with metrics
- **game-researcher:** Can demand primary sources, ban speculation

No more "I don't have the tools to analyze that" — each agent now equipped for their domain.
