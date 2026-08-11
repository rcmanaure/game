# LLM Orchestration Frameworks Research
**Date:** August 6, 2026  
**Context:** Eval alternatives to LangGraph.js for AI DM Platform  
**Current Use:** LangGraph.js for 4-node linear pipeline (resolve → validate → narrate → art)

---

## Executive Summary

**Recommendation: Keep LangGraph.js for now. Raw async/await viable alt if simplicity priority.**

Game's current orchestration deliberately simple: linear 4-node pipeline, no branching, no retries, no state persistence between turns. Aligns with **neither** LangGraph's strengths (durable multi-turn agents, complex conditional routing) nor typical raw-loop pain points (multi-step tool sequencing, state management across turns).

**Bottom line:** LangGraph.js works fine, negligible overhead for this scope. Raw async/await saves ~100 lines boilerplate, gains no functionality. Advanced frameworks (Vercel AI SDK, Anthropic Agent SDK) overengineered unless game evolves toward persistent multi-turn memory or human-in-the-loop approval gates.

---

## Framework Analysis

### 1. LangGraph.js

**Status:** ✅ Actively maintained, widely adopted, MIT licensed (core only)  
**Latest:** v1.1.0 (in your package.json)

#### What It Solves

- Explicit control over node-level state transitions
- Native checkpointing and pause/resume (if needed later)
- Debugging tools (LangGraph Studio for visualization)
- Multi-agent orchestration patterns

#### For Your Game Scope

**Honest assessment:** LangGraph *reasonable* choice, not necessary.

Your current graph:
- No branching (every node runs)
- No retries or fallback edges (resolve catches errors internally)
- No state persistence across HTTP requests (each turn independent)
- No human-in-the-loop gates

LangGraph's value *diminished* here, not using core strengths:
- ❌ No cycles (loops for retries/reflection)
- ❌ No interruption/checkpointing
- ❌ No multi-agent patterns

**However:** Not *wrong*. Overhead minimal (~5-10ms graph setup, negligible vs LLM latency). Get:
- ✅ Clear visual structure (each node async function)
- ✅ Type-safe state schema (Zod integration)
- ✅ Explicit edges (no ambiguous control flow)

**License:** MIT-licensed core. LangGraph API (server runtime) needs commercial license for production scale — not used here.

**Complexity Overhead:** Moderate. StateGraph and node definitions add ~50 lines vs raw async/await, readability arguably better. Agent workflows spend most time waiting on LLM API calls, framework overhead rarely affects performance.

---

### 2. LangChain.js (Agents Only)

**Status:** ✅ Maintained, widespread adoption, MIT licensed

#### What It Is

LangChain provides **composable, reusable components** (chains, tools, memory) and **prebuilt agent abstraction** (`createReactAgent`). NOT graph orchestrator — toolkit for building pipelines.

#### Relationship to LangGraph

As of October 2025, LangChain's `createReactAgent` runs on LangGraph's execution engine under hood. **Complementary**, not alternatives:
- **LangChain:** utilities, integrations, pre-built agent patterns
- **LangGraph:** low-level graph execution, state management, checkpointing

#### For Your Game Scope

**Not direct replacement for LangGraph.js here.**

If using only LangChain:
- Lose explicit graph visualization (chains less transparent than StateGraph)
- Gain LangChain's extensive integrations (vector stores, API chains, etc.) — not needed yet
- Still need custom logic for narration retry-then-fallback pattern (narration.ts's `narrateWithFallback`)

**Better as complement:** LangChain's tool integrations might simplify art generation (later, if adding image search, model selection), not orchestration itself.

**License:** MIT

**Complexity Overhead:** Similar to LangGraph.js (~50 lines), less explicit about control flow.

---

### 3. Vercel AI SDK

**Status:** ✅ Actively maintained, production-grade, free (Vercel commercial entity)

#### What It Is

**Provider-agnostic wrapper** for AI model calls (text, structured, tool use), abstracts over 25+ LLM providers (OpenAI, Anthropic, Google, xAI, etc). Includes **agent patterns** for multi-step tool orchestration, real-time streaming.

#### Capabilities

- ✅ Multi-step tool sequencing (`maxSteps` parameter)
- ✅ Streaming tool results to client
- ✅ Framework-agnostic (React, Vue, Next.js, Node.js)
- ✅ Provider switching without code changes

#### For Your Game Scope

**Overkill, not by much.**

Pros:
- Provider agnostic (swap Anthropic ↔ OpenAI in config)
- Streaming support useful for live progress to client
- Cleaner abstraction than raw Messages API

Cons:
- Adds layer between you and LLM (minor latency, minor complexity)
- Designed for **UI-driven agents** (chat interfaces, UI progressively built by tool outputs)
- Game's tool orchestration (resolve → validate → narrate → art) not really Vercel SDK's target — built for "iterative refinement" (user asks AI build UI, AI calls tools fetch data, progressively updates UI)
- **Lock-in risk:** SDK maintained by Vercel; priorities shift, you're dependent

**Complexity Overhead:** Lower than LangGraph.js (simpler API), lose graph-level visibility.

**License:** Apache 2.0 (open-source, permissive).

---

### 4. Anthropic Claude Agent SDK

**Status:** ✅ New (actively developed), production-ready

**License:** Governed by Anthropic's Commercial Terms of Service (not open-source). Pricing per-message API usage.

#### What It Is

**Dedicated agent framework** from Anthropic, bundles:
- Tool execution loops
- MCP (Model Context Protocol) server support
- Permission system for tool execution
- Subagent spawning

"Claude Code engine" packaged as reusable library.

#### Messages API vs. Agent SDK

**Raw Messages API:**
```typescript
// You manage the loop manually
while (true) {
  response = await client.messages.create({ ... tools });
  if (response.stop_reason === "tool_use") {
    execute_tool(response.content);
    // Append result, loop again
  } else break;
}
```
- No state persistence
- Manual loop management
- ~40 lines boilerplate per agent

**Agent SDK:**
```typescript
// Declarative, framework manages the loop
const agent = new Agent({
  tools: [resolve, validate, narrate, art],
});
await agent.run("Player does X");
```
- State handled automatically
- Tool execution + error handling built-in
- ~10 lines setup

#### For Your Game Scope

**Best fit if want simplicity.**

Pros:
- ✅ Built by LLM provider (Anthropic); tight integration with Claude
- ✅ Minimal boilerplate
- ✅ MCP support useful if later add external tools (databases, APIs, local binaries)
- ✅ Permission system prevents accidental tool abuse
- ✅ Native to Claude ecosystem (matches your models.ts usage)

Cons:
- ❌ Locked to Anthropic/Claude models (no provider flexibility)
- ❌ Fewer integrations/utilities than LangChain (no vector store connectors, etc)
- ❌ Newer, smaller ecosystem

**Complexity Overhead:** Lowest. Declarative DSL, minimal code.

---

### 5. Rivet (Visual AI App Builder)

**Status:** ✅ Open-source, actively maintained (built and maintained by Ironclad), free

**Note:** Two different products named "Rivet":
- **rivet.ironcladapp.com** (this one) — visual node-based workflow builder for AI agents
- **rivet.dev** — separate infra platform for running/hosting agents (not design tool)

This section covers Ironclad visual builder.

#### What It Is

**Visual node-based IDE** for building AI workflows, maintained by Ironclad (digital contracting platform). "No-code LangGraph with GUI."

#### Capabilities

- ✅ Drag-and-drop node graph
- ✅ Node types: LLM, tool invocation, conditionals, loops, data transforms
- ✅ Built-in debugger
- ✅ Export to TypeScript code
- ✅ Self-hosted or cloud deploy
- ✅ Active development, recent product integrations, community support

#### For Your Game Scope

**Not suitable for production, good for prototyping.**

Pros:
- ✅ Great for rapid prototyping, visualization
- ✅ No coding required
- ✅ Good for stakeholder demos (non-technical folks understand flow)

Cons:
- ❌ Visual tools don't scale for complex logic (validator, rules.ts, etc need code)
- ❌ Exporting to TypeScript loses visual tool's value (back to code)
- ❌ Lock-in to Rivet's data model if staying in visual editor
- ❌ Rivet workflows not naturally version-controllable (node positions, visual state, vs source code)

**When it makes sense:** Want **design tool to document flow** or **let non-developers design game scenarios** (drag-and-drop dialogue trees, encounter flows) — Rivet has promise. For production harness, detour.

**License:** Open-source (check repo for exact license; appears permissive).

---

### 6. Steamship

**Status:** ❌ No longer maintained (archived Sep 2024)

#### What It Was

**Managed cloud platform** for deploying LLM apps as hosted APIs. Included:
- Low-code framework (Python-based)
- Auto-scaling execution
- Model abstraction layer
- Integrations to major LLM providers

#### Current Status

Steamship's main packages org archived September 2024, no longer actively maintained. No new versions released to PyPI past 12+ months, project receives no active maintenance.

#### For Your Game Scope

**Not applicable** (not viable for new projects).

Framework **deprecated**, should not be considered for any new development.

**License:** Was SaaS (commercial licensing).

---

### 7. HuggingFace Transformers Agents

**Status:** ✅ Maintained (experimental API, subject to change), Python-focused, MIT licensed

#### What It Is

**Python library** for building agents with pluggable LLM backends (local models or HF's Inference API). Includes:
- ReAct agents (reasoning + acting)
- Default tool set (search, document QA, image QA, code execution)
- Custom tool support
- Support for local inference (TransformersEngine) and API-based (HfApiEngine)

#### For Your Game Scope

**Not a fit for JavaScript/Node.js backend.**

Your project stack:
- TypeScript/Node.js backend
- Anthropic Claude models (API-based)

HuggingFace Transformers Agents:
- Python-only
- Designed for local LLM inference (or HF's API)
- Heavier use of code execution tools (security trade-off)

**If using Python + Llama-3 locally:** Transformers Agents solid choice. Not the case here.

**License:** MIT

---

## Raw Async/Await (No Framework)

For completeness, raw loop:

```typescript
async function harness(playerAction: string, character: Character) {
  // Resolve intent
  const intent = await resolveIntent(playerAction, character);
  
  // Validate rules
  const { gameEvent, character: updatedChar } = applyMutation(character, intent);
  
  // Narrate
  const narration = await narrateWithFallback(gameEvent);
  
  // Generate art
  const artUrl = await generateArt(gameEvent.archetype);
  
  return { gameEvent, character: updatedChar, narration, artUrl };
}
```

**Complexity:** ~30 lines (vs 147 in graph.ts with LangGraph boilerplate)

**Trade-offs:**
- ✅ Minimal overhead
- ✅ Easier debug (straightforward async/await)
- ✅ No external dependency
- ❌ No state schema validation (Zod schema in LangGraph helps catch bugs)
- ❌ Later need branching/retries/persistence → refactoring from scratch
- ❌ Less explicit about state mutations (harder review what each step changes)

**When to use:** Game **never** branches (always resolve → validate → narrate → art, no exceptions), raw async/await defensible.

---

## Comparison Table

| Framework | Maintained | License | JS/TS | Use Case | Overkill? | Complexity |
|-----------|-----------|---------|-------|----------|-----------|-----------|
| **LangGraph.js** | ✅ Yes | MIT | ✅ Yes | Graph-based multi-step agents | ⚠️ Slightly | Moderate |
| **LangChain.js** | ✅ Yes | MIT | ✅ Yes | Toolkit + prebuilt agents | ✅ Yes | Moderate |
| **Vercel AI SDK** | ✅ Yes | Apache 2.0 | ✅ Yes | Provider-agnostic UI agents | ✅ Yes | Low |
| **Anthropic Agent SDK** | ✅ Yes (new) | Commercial Terms | ✅ Yes | Claude-native agents | ❌ No | Low |
| **Rivet** | ✅ Yes | OSS | ✅ Yes (export) | Visual workflow design | ✅ Yes (for prod) | Visual only |
| **Steamship** | ❌ Archived (Sep 2024) | SaaS | ⚠️ Python | Managed LLM API hosting (DEPRECATED) | N/A | N/A |
| **HuggingFace Agents** | ✅ Yes (experimental) | MIT | ❌ Python | Local LLM agents | ✅ Yes | Moderate |
| **Raw async/await** | N/A | N/A | ✅ Yes | Simple sequential flows | ❌ No | Minimal |

---

## Known Pain Points in Current LangGraph.js Usage

1. **Retry logic spread across nodes:** `resolve` and `narrate` both implement retry-once-then-fallback. Conditional edges could consolidate, not needed for linear flow.

2. **State mutation opacity:** Not immediately obvious from StateSchema that `character` might be mutated by `rulesValidate`. Explicit return `{ character }` helps, documentation would help future maintainers.

3. **Tool integration friction:** Art generation fire-and-forget; if fails, game doesn't know. Conditional edge (`if artError, return safe-default-art`) cleaner, doesn't affect gameplay.

**None of these reasons to abandon LangGraph.js.** Refinements for T14 (conditional edges, multi-turn memory).

---

## Decision: LangGraph.js vs. Alternatives

### Keep LangGraph.js If:

✅ Plan to add **branching logic** (e.g. "if critical success, branch to special narration")
✅ Want **conditional edges** and **explicit control flow visualization** (easy review, easier for future team members understand)
✅ Might need **state persistence** later (e.g. "resume interrupted games" or "undo last turn")
✅ Value **Zod schema validation** at state boundaries

### Switch to Anthropic Agent SDK If:

✅ Want **minimal boilerplate** and **direct Claude integration** (already your LLM provider)
✅ Might add **MCP tools** (external services, databases, local binaries)
✅ Prefer **framework maintained by LLM provider** (Anthropic owns it, not LangChain)
✅ Don't need **complex graph routing** (simple tool sequencing fine)

### Switch to Raw Async/Await If:

✅ Game **never branches** or adds conditional logic
✅ Value **minimal dependencies** and **code clarity** over framework benefits
✅ OK **refactoring when complexity grows**

---

## Recommendation Summary

**Primary:** Stick with **LangGraph.js**. Fit-for-purpose, actively maintained, negligible overhead for your scope. Investment already made (in package.json), code already written and working.

**If starting fresh:** Use **Anthropic Agent SDK**. Simpler, more directly aligned with Claude, less conceptual overhead than LangGraph for current linear pipeline. Migration from LangGraph to Agent SDK not significant though, no urgency to refactor.

**Avoid:** 
- Vercel AI SDK (provider abstraction not needed, designed for UI-driven agents)
- LangChain.js agents (overlaps with LangGraph, no clear win)
- Rivet (not for production code, useful for design prototyping only)
- Steamship (archived since Sep 2024, no longer maintained — do not use)
- HuggingFace Agents (Python-only, local inference not applicable)

---

## Production Readiness Notes

All three viable options (LangGraph.js, Anthropic Agent SDK, raw async/await) production-ready:

- **LangGraph.js:** MIT-licensed core. LangGraph API (paid tier) optional; not used.
- **Anthropic Agent SDK:** Governed by Anthropic's Commercial Terms of Service. Pricing per-message API usage (same as current Claude usage).
- **Raw async/await:** No external dependencies, no licensing concerns.

For your scope, **licensing and uptime non-issues.** LangGraph.js genuinely open-source (MIT); Anthropic Agent SDK commercial terms but same pricing model as current Claude usage.

---

## Sources

**Primary sources (official docs/repos):**
- [LangGraph.js - Docs by LangChain](https://docs.langchain.com/oss/javascript/langgraph/overview)
- [Anthropic Claude Agent SDK for TypeScript - GitHub](https://github.com/anthropics/claude-agent-sdk-typescript)
- [Claude Agent SDK License - Anthropic Commercial Terms](https://www.anthropic.com/legal/commercial-terms)
- [Vercel AI SDK - GitHub](https://github.com/vercel/ai)
- [Vercel AI SDK License - Apache 2.0](https://github.com/vercel/ai/blob/main/LICENSE)
- [Rivet (Ironclad) - Open-source visual AI programming](https://rivet.ironcladapp.com/)
- [Rivet.dev - Infrastructure platform for AI agents (different product)](https://rivet.dev/)
- [HuggingFace Transformers Agents - Official Docs](https://huggingface.co/docs/transformers/v4.51.3/en/agents)
- [Steamship Core - GitHub Organization (Archived Sep 2024)](https://github.com/orgs/steamship-core/repositories)

**Secondary sources (analysis/comparison):**
- [LangGraph vs LangChain: Which to Use for Production AI Agents in 2026 | Spheron Blog](https://www.spheron.network/blog/langgraph-vs-langchain/)
- [LangGraph Tutorial (2026): Stateful, Controllable LLM Agents](https://www.metacto.com/blogs/a-developer-s-guide-to-langgraph-building-stateful-controllable-llm-applications)
- [The Complete Guide for LangChain & LangGraph - AI with Aish](https://aishwaryasrinivasan.substack.com/p/the-complete-guide-for-langchain)
- [LangGraph overview - Docs by LangChain](https://docs.langchain.com/oss/javascript/langgraph/overview)
- [The Ultimate Guide to Building AI-Powered Web Apps with the Vercel AI SDK in 2026 - DEV Community](https://dev.to/bean_bean/the-ultimate-guide-to-building-ai-powered-web-apps-with-the-vercel-ai-sdk-in-2026-1c6a)
- [Vercel AI SDK 6 Deep Dive: Features + Tool Calls 2026](https://www.digitalapplied.com/blog/vercel-ai-sdk-6-deep-dive-features-tool-calls-2026)
- [Claude Agent SDK (Anthropic) - Quickstart - Requesty Docs](https://docs.requesty.ai/integrations/anthropic-agent-sdks)
- [Rivet: Visual AI agent builder – HeadOfAgents](https://headofagents.ai/rivet)
- [Introducing Rivet Workflows - Rivet](https://rivet.dev/changelog/2026-02-24-introducing-rivet-workflows/)
- [Top 5 Prompt Orchestration Platforms for AI Agents in 2026](https://www.getmaxim.ai/articles/top-5-prompt-orchestration-platforms-for-ai-agents-in-2026/)
- [10 Best AI Orchestration Platforms in 2026](https://www.scrumlaunch.com/blog/top-ai-orchestration-platforms-2026)
- [LLM Orchestration Frameworks Compared: LangChain vs. LlamaIndex vs. Raw API Calls - MachineLearningMastery.com](https://machinelearningmastery.com/llm-orchestration-frameworks-compared-langchain-vs-llamaindex-vs-raw-api-calls/)
- [LangGraph vs LangGraph.js: Python vs TypeScript | Crewship](https://www.crewship.dev/learn/langgraph-vs-langgraphjs)
- [Why I Switched to Async LangChain and LangGraph (And You Should Too) | by Nishant Mishra | Medium](https://nishant-mishra.medium.com/why-i-switched-to-async-langchain-and-langgraph-and-you-should-too-c30635c9cf19)
- [LangChain vs LangGraph: Complete Comparison 2026](https://www.digitalapplied.com/blog/langchain-vs-langgraph-comparison-2026)
- [LangChain vs LangGraph: Key Differences Explained (2026)](https://atlan.com/know/ai-agent/ai-agent-memory/langchain-vs-langgraph/)
- [Agents and tools · Hugging Face](https://huggingface.co/docs/transformers/v4.49.0/agents)
- [MIT License - langchain-ai/langgraph](https://github.com/langchain-ai/langgraph/blob/main/LICENSE)
- [LLM Orchestration in 2026: Top 22 frameworks and gateways](https://aimultiple.com/llm-orchestration/)
- [Choosing an agent framework: LangChain vs LangGraph vs CrewAI vs PydanticAI vs Mastra vs Vercel AI SDK](https://www.speakeasy.com/blog/ai-agent-framework-comparison/)