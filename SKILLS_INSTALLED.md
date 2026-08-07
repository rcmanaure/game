# Installed Skills Reference

**Installation Date:** 2026-08-06  
**Total Skills Installed:** 15 (Tier 1 + 2)  
**Scope:** Global (`-g`) — available to all agents in Claude Code ecosystem

---

## Tier 1: Critical (Your Stack)

### Backend Engineering

#### `nestjs-expert` (jeffallan/claude-skills)
- **When:** Reviewing NestJS modules, services, guards, interceptors, DTOs
- **Agents:** gameplay-engineer, (optionally game-lead for architecture)
- **Invocation:** `/nestjs-expert` or mention "NestJS patterns"
- **Coverage:** DI configuration, controller design, modular structure

#### `nestjs-clean-typescript` (mindrally/skills)
- **When:** TypeScript strict mode, SOLID principles, clean architecture
- **Agents:** gameplay-engineer
- **Invocation:** `/nestjs-clean-typescript`
- **Coverage:** Type safety, maintainability scoring, design patterns

### Database Engineering

#### `supabase-postgres-best-practices` (supabase/agent-skills)
- **When:** Before writing/modifying any Postgres code (schema, migrations, queries)
- **Agents:** gameplay-engineer
- **Invocation:** Auto-loads for DB work; manually `/supabase-postgres-best-practices`
- **Coverage:** Schema design, migrations, RLS, indices, performance, security

#### `prisma-postgres` (prisma/skills)
- **When:** Using Prisma ORM, migrations, database setup
- **Agents:** gameplay-engineer
- **Invocation:** `/prisma-postgres`
- **Coverage:** Prisma schema, migrations, provisioning, console operations

#### `sql-optimization-patterns` (wshobson/agents)
- **When:** Analyzing slow queries, N+1 detection, index strategy
- **Agents:** gameplay-engineer, performance-engineer
- **Invocation:** `/sql-optimization-patterns`
- **Coverage:** Query tuning, EXPLAIN plans, index design

### Testing & QA

#### `qa-testing-strategy` (vasilyu1983/ai-agents-public)
- **When:** Defining test coverage, setting CI gates, release criteria
- **Agents:** qa-tester
- **Invocation:** `/qa-testing-strategy`
- **Coverage:** Risk-based testing, flaky test management, coverage goals

#### `jest` (mindrally/skills)
- **When:** Writing unit/integration tests in JavaScript/TypeScript
- **Agents:** qa-tester
- **Invocation:** `/jest` or mention "Jest tests"
- **Coverage:** Test structure, mocking, assertions, fixtures

#### `e2e-playwright-testing` (asyrafhussin/agent-skills)
- **When:** End-to-end browser testing, user flow validation
- **Agents:** qa-tester
- **Invocation:** `/e2e-playwright-testing`
- **Coverage:** Playwright API, test scenarios, form/flow automation

### Performance

#### `performance-optimization` (addyosmani/agent-skills)
- **When:** Web performance issues, Core Web Vitals, optimization strategy
- **Agents:** performance-engineer
- **Invocation:** `/performance-optimization`
- **Coverage:** Frontend/backend perf, rendering, queries, load times

#### `cpu-profiling` (aj-geddes/useful-ai-prompts)
- **When:** CPU bottlenecks, hotspot location, profiling methodology
- **Agents:** performance-engineer
- **Invocation:** `/cpu-profiling`
- **Coverage:** CPU measurement, flame graphs, hot path identification

#### `memory-leak-detection` (aj-geddes/useful-ai-prompts)
- **When:** Memory leaks, heap growth analysis, OOM errors
- **Agents:** performance-engineer
- **Invocation:** `/memory-leak-detection`
- **Coverage:** Heap snapshots, GC analysis, leak diagnosis

#### `observability-llm-obs` (elastic/agent-skills)
- **When:** LLM latency monitoring, token tracking, cost analysis
- **Agents:** performance-engineer, game-researcher (cost analysis)
- **Invocation:** `/observability-llm-obs`
- **Coverage:** LLM metrics, response time, token efficiency, cost tracking

---

## Tier 2: Game-Specific

### Game Design

#### `game-balancing` (absolutelyskilled/claude-skills)
- **When:** Difficulty curves, economy balance, loot table tuning
- **Agents:** gameplay-designer
- **Invocation:** `/game-balancing`
- **Coverage:** Progression balance, reward pacing, difficulty scaling

#### `game-analytics` (alphaonedev/claude-skills)
- **When:** Retention metrics, engagement tracking, churn analysis
- **Agents:** gameplay-designer, game-researcher
- **Invocation:** `/game-analytics`
- **Coverage:** Player behavior, DAU/MAU, session length, replay rates

#### `progression-systems` (omer-metin/skills-for-antigravity)
- **When:** Meta-progression, XP curves, skill trees, unlock loops
- **Agents:** gameplay-designer
- **Invocation:** `/progression-systems`
- **Coverage:** Progression math, advancement hooks, "one more turn" design

### Game Research

#### `research-methodology` (poemswe/co-researcher)
- **When:** Research design, sampling strategy, validity controls
- **Agents:** game-researcher
- **Invocation:** `/research-methodology`
- **Coverage:** Research frameworks, methodology validation, problem reframing

#### `market-sizing-analysis` (wshobson/agents)
- **When:** TAM/SAM/SOM estimation, market opportunity sizing, trends
- **Agents:** game-researcher
- **Invocation:** `/market-sizing-analysis`
- **Coverage:** Market size, addressable revenue, competitive positioning

#### `data-analysis` (claude-office-skills/skills)
- **When:** Retention/churn analysis, player metrics, trend detection
- **Agents:** game-researcher, gameplay-designer
- **Invocation:** `/data-analysis`
- **Coverage:** Statistical analysis, visualization, insights extraction

---

## Agent Configuration

Each agent's .md file has been updated to reference available skills in the "Efficiency Rules" section. **Skills are invoked on-demand, not hardcoded to agent tools.**

**Pattern for agents:**
1. Identify problem (bug, perf, design, research)
2. Invoke relevant skill(s) if needed: `/skill-name`
3. Proceed with analysis

**Example:** gameplay-engineer sees a Postgres query issue → invokes `/supabase-postgres-best-practices` + `/sql-optimization-patterns` → analyzes + recommends fix

---

## Installation Manifest

```bash
# Install command (all 15 at once):
npx skills add \
  jeffallan/claude-skills@nestjs-expert \
  mindrally/skills@nestjs-clean-typescript \
  supabase/agent-skills@supabase-postgres-best-practices \
  prisma/skills@prisma-postgres \
  wshobson/agents@sql-optimization-patterns \
  vasilyu1983/ai-agents-public@qa-testing-strategy \
  mindrally/skills@jest \
  asyrafhussin/agent-skills@e2e-playwright-testing \
  addyosmani/agent-skills@performance-optimization \
  aj-geddes/useful-ai-prompts@cpu-profiling \
  aj-geddes/useful-ai-prompts@memory-leak-detection \
  elastic/agent-skills@observability-llm-obs \
  absolutelyskilled/claude-skills@game-balancing \
  alphaonedev/claude-skills@game-analytics \
  omer-metin/skills-for-antigravity@progression-systems \
  poemswe/co-researcher@research-methodology \
  wshobson/agents@market-sizing-analysis \
  claude-office-skills/skills@data-analysis \
  -g -y
```

---

## Future Custom Skills (Post-Playtest)

If playtesting reveals domain-unique needs, create:
1. `@game-dev/ai-dm-patterns` — AI DM + permadeath + NPC persistence
2. `@game-dev/langgraph-architecture` — LangGraph node patterns
3. `@game-dev/game-state-validation` — Server-authority mutation safety

---

**Status:** ✅ Complete. All agents equipped. Skills available on-demand.
