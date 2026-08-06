# LLM Orchestration Frameworks Research
**Date:** August 6, 2026  
**Context:** Evaluating alternatives to LangGraph.js for AI DM Platform  
**Current Use:** LangGraph.js for 4-node linear pipeline (resolve → validate → narrate → art)

---

## Executive Summary

**Recommendation: Keep LangGraph.js for now, but raw async/await is a viable alternative if simplicity is prioritized.**

The game's current orchestration is deliberately simple: a linear 4-node pipeline with no branching, no retries, and no state persistence between turns. This aligns with **neither** LangGraph's strengths (durable multi-turn agents, complex conditional routing) nor typical raw-loop pain points (multi-step tool sequencing, state management across turns).

**Bottom line:** LangGraph.js works fine and adds negligible overhead for this scope. Switching to raw async/await saves ~100 lines of boilerplate but gains no functionality. Advanced frameworks (Vercel AI SDK, Anthropic Agent SDK) are overengineered unless the game evolves toward persistent multi-turn memory or human-in-the-loop approval gates.

---

## Framework Analysis

### 1. LangGraph.js

**Status:** ✅ Actively maintained, widely adopted, MIT licensed (core only)  
**Latest:** v1.1.0 (in your package.json)

#### What It Solves

- Explicit control over node-level state transitions
- Native checkpointing and pause/resume (if you need it later)
- Debugging tools (LangGraph Studio for visualization)
- Multi-agent orchestration patterns

#### For Your Game Scope

**Honest assessment:** LangGraph is a *reasonable* choice but not necessary.

Your current graph:
- No branching (every node runs)
- No retries or fallback edges (resolve catches errors internally)
- No state persistence across HTTP requests (each turn is independent)
- No human-in-the-loop gates

LangGraph's value is *diminished* here because you're not using its core strengths:
- ❌ No cycles (loops for retries/reflection)
- ❌ No interruption/checkpointing
- ❌ No multi-agent patterns

**However:** It's *not* wrong. The overhead is minimal (~5-10ms for graph setup, negligible vs. LLM latency). You get:
- ✅ Clear visual structure (each node is an async function)
- ✅ Type-safe state schema (Zod integration)
- ✅ Explicit edges (no ambiguous control flow)

**License:** MIT-licensed core. LangGraph API (server runtime) requires commercial license for production scale, but you're not using that.

**Complexity Overhead:** Moderate. StateGraph and node definitions add ~50 lines vs. raw async/await, but readability is arguably better. Agent workflows spend most of their time waiting on LLM API calls, so framework overhead rarely affects performance.

---

### 2. LangChain.js (Agents Only)

**Status:** ✅ Maintained, widespread adoption, MIT licensed

#### What It Is

LangChain provides **composable, reusable components** (chains, tools, memory) and a **prebuilt agent abstraction** (`createReactAgent`). It is NOT a graph orchestrator; it's a toolkit for building pipelines.

#### Relationship to LangGraph

As of October 2025, LangChain's `createReactAgent` runs on LangGraph's execution engine under the hood. They are **complementary**, not alternatives:
- **LangChain:** utilities, integrations, pre-built agent patterns
- **LangGraph:** low-level graph execution, state management, checkpointing

#### For Your Game Scope

**Not a direct replacement for LangGraph.js in your case.**

If you wanted to use only LangChain:
- You'd lose explicit graph visualization (chains are less transparent than StateGraph)
- You'd gain access to LangChain's extensive integrations (vector stores, API chains, etc.) — which you don't need yet
- You'd still need custom logic for the narration retry-then-fallback pattern (narration.ts's `narrateWithFallback`)

**Better as a complement:** LangChain's tool integrations might simplify art generation (if you later add image search, model selection, etc.), but not the orchestration itself.

**License:** MIT

**Complexity Overhead:** Similar to LangGraph.js (~50 lines), but less explicit about control flow.

---

### 3. Vercel AI SDK

**Status:** ✅ Actively maintained, production-grade, free (Vercel commercial entity)

#### What It Is

A **provider-agnostic wrapper** for AI model calls (text, structured, tool use) that abstracts over 25+ LLM providers (OpenAI, Anthropic, Google, xAI, etc.). It includes **agent patterns** for multi-step tool orchestration and real-time streaming.

#### Capabilities

- ✅ Multi-step tool sequencing (`maxSteps` parameter)
- ✅ Streaming tool results to client
- ✅ Framework-agnostic (works with React, Vue, Next.js, Node.js)
- ✅ Provider switching without code changes

#### For Your Game Scope

**Overkill, but not by much.**

Pros:
- Provider agnostic (swap Anthropic ↔ OpenAI in config)
- Streaming support useful if you want live progress to client
- Cleaner abstraction than raw Messages API

Cons:
- Adds a layer between you and the LLM (minor latency, minor complexity)
- Designed for **UI-driven agents** (chat interfaces, UI progressively built by tool outputs)
- Your game's tool orchestration (resolve → validate → narrate → art) isn't really what Vercel SDK targets—it's built for "iterative refinement" (e.g., user asks AI to build a UI, AI calls tools to fetch data, progressively updates UI)
- **Lock-in risk:** The SDK is maintained by Vercel; if their priorities shift, you're dependent

**Complexity Overhead:** Lower than LangGraph.js (simpler API), but you lose graph-level visibility.

**License:** Apache 2.0 (open-source, permissive).

---

### 4. Anthropic Claude Agent SDK

**Status:** ✅ New (actively developed), production-ready

**License:** Governed by Anthropic's Commercial Terms of Service (not open-source). Pricing per-message API usage.

#### What It Is

A **dedicated agent framework** from Anthropic that bundles:
- Tool execution loops
- MCP (Model Context Protocol) server support
- Permission system for tool execution
- Subagent spawning

It's the "Claude Code engine" packaged as a reusable library.

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
- ~40 lines of boilerplate per agent

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
- ~10 lines of setup

#### For Your Game Scope

**Best fit if you want simplicity.**

Pros:
- ✅ Built by the LLM provider (Anthropic); tight integration with Claude
- ✅ Minimal boilerplate
- ✅ MCP support useful if you later add external tools (databases, APIs, local binaries)
- ✅ Permission system prevents accidental tool abuse
- ✅ Native to Claude ecosystem (matches your models.ts usage)

Cons:
- ❌ Locked to Anthropic/Claude models (no provider flexibility)
- ❌ Fewer integrations/utilities than LangChain (no vector store connectors, etc.)
- ❌ Newer, smaller ecosystem

**Complexity Overhead:** Lowest. Declarative DSL, minimal code.

---

### 5. Rivet (Visual AI App Builder)

**Status:** ✅ Open-source, actively maintained (built and maintained by Ironclad), free

**Note:** There are two different products named "Rivet":
- **rivet.ironcladapp.com** (this one) — visual node-based workflow builder for AI agents
- **rivet.dev** — separate infrastructure platform for running/hosting agents (not a design tool)

This section covers the Ironclad visual builder.

#### What It Is

A **visual node-based IDE** for building AI workflows, maintained by Ironclad (digital contracting platform). Think of it as "no-code LangGraph with a GUI."

#### Capabilities

- ✅ Drag-and-drop node graph
- ✅ Node types: LLM, tool invocation, conditionals, loops, data transforms
- ✅ Built-in debugger
- ✅ Export to TypeScript code
- ✅ Self-hosted or cloud deploy
- ✅ Active development with recent product integrations and community support

#### For Your Game Scope

**Not suitable for production, good for prototyping.**

Pros:
- ✅ Great for rapid prototyping and visualization
- ✅ No coding required
- ✅ Good for stakeholder demos (non-technical folks can understand the flow)

Cons:
- ❌ Visual tools don't scale well for complex logic (your validator, rules.ts, etc. need code)
- ❌ Exporting to TypeScript loses the visual tool's value (you're back to code)
- ❌ Lock-in to Rivet's data model if you stay in the visual editor
- ❌ Rivet workflows aren't naturally version-controllable (node positions, visual state, vs. source code)

**When it makes sense:** If you want a **design tool to document your flow** or **let non-developers design game scenarios** (drag-and-drop dialogue trees, encounter flows), Rivet has promise. But for your production harness, it's a detour.

**License:** Open-source (check repo for exact license; appears to be permissive).

---

### 6. Steamship

**Status:** ❌ No longer maintained (archived Sep 2024)

#### What It Was

A **managed cloud platform** for deploying LLM apps as hosted APIs. It included:
- Low-code framework (Python-based)
- Auto-scaling execution
- Model abstraction layer
- Integrations to major LLM providers

#### Current Status

Steamship's main packages organization was archived in September 2024 and is no longer actively maintained. No new versions have been released to PyPI in the past 12+ months, and the project receives no active maintenance.

#### For Your Game Scope

**Not applicable** (and not viable for new projects).

This framework is **deprecated** and should not be considered for any new development.

**License:** Was SaaS (commercial licensing).

---

### 7. HuggingFace Transformers Agents

**Status:** ✅ Maintained (experimental API, subject to change), Python-focused, MIT licensed

#### What It Is

A **Python library** for building agents with pluggable LLM backends (local models or HF's Inference API). Includes:
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

**If you were using Python + Llama-3 locally:** Transformers Agents would be a solid choice. But you're not.

**License:** MIT

---

## Raw Async/Await (No Framework)

For completeness, here's what a raw loop looks like:

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

**Complexity:** ~30 lines (vs. 147 in graph.ts with LangGraph boilerplate)

**Trade-offs:**
- ✅ Minimal overhead
- ✅ Easier to debug (straightforward async/await)
- ✅ No external dependency
- ❌ No state schema validation (Zod schema in LangGraph helps catch bugs)
- ❌ If you later need branching, retries, or persistence, you're refactoring from scratch
- ❌ Less explicit about state mutations (harder to review what each step changes)

**When to use:** If your game **never** branches (always resolve → validate → narrate → art, no exceptions), raw async/await is defensible.

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

1. **Retry logic spread across nodes:** `resolve` and `narrate` both implement retry-once-then-fallback. Conditional edges could consolidate this, but not needed for your linear flow.

2. **State mutation opacity:** It's not immediately obvious from the StateSchema that `character` might be mutated by `rulesValidate`. Explicit return `{ character }` helps, but documentation would help future maintainers.

3. **Tool integration friction:** Art generation is fire-and-forget; if it fails, the game doesn't know. A conditional edge (`if artError, return safe-default-art`) would be cleaner, but doesn't affect gameplay.

**None of these are reasons to abandon LangGraph.js.** They're refinements for T14 (conditional edges, multi-turn memory).

---

## Decision: LangGraph.js vs. Alternatives

### Keep LangGraph.js If:

✅ You plan to add **branching logic** (e.g., "if critical success, branch to special narration")
✅ You want **conditional edges** and **explicit control flow visualization** (easy to review, easier for future team members to understand)
✅ You might need **state persistence** later (e.g., "resume interrupted games" or "undo last turn")
✅ You value **Zod schema validation** at state boundaries

### Switch to Anthropic Agent SDK If:

✅ You want **minimal boilerplate** and **direct Claude integration** (already your LLM provider)
✅ You might add **MCP tools** (external services, databases, local binaries)
✅ You prefer a **framework maintained by the LLM provider** (Anthropic owns it, not LangChain)
✅ You don't need **complex graph routing** (simple tool sequencing is fine)

### Switch to Raw Async/Await If:

✅ Your game **never branches** or adds conditional logic
✅ You value **minimal dependencies** and **code clarity** over framework benefits
✅ You're okay **refactoring when complexity grows**

---

## Recommendation Summary

**Primary:** Stick with **LangGraph.js**. It's fit-for-purpose, actively maintained, and adds negligible overhead for your scope. The investment is already made (it's in package.json), and the code is already written and working.

**If starting fresh:** Use **Anthropic Agent SDK**. It's simpler, more directly aligned with Claude, and has less conceptual overhead than LangGraph for your current linear pipeline. However, migration from LangGraph to Agent SDK isn't significant, so no urgency to refactor.

**Avoid:** 
- Vercel AI SDK (provider abstraction you don't need, designed for UI-driven agents)
- LangChain.js agents (overlaps with LangGraph, no clear win)
- Rivet (not for production code, useful for design prototyping only)
- Steamship (archived since Sep 2024, no longer maintained — do not use)
- HuggingFace Agents (Python-only, local inference not applicable)

---

## Production Readiness Notes

All three viable options (LangGraph.js, Anthropic Agent SDK, raw async/await) are production-ready:

- **LangGraph.js:** MIT-licensed core. LangGraph API (paid tier) is optional; you don't use it.
- **Anthropic Agent SDK:** Governed by Anthropic's Commercial Terms of Service. Pricing is per-message API usage (same as using Claude API).
- **Raw async/await:** No external dependencies, no licensing concerns.

For your scope, **licensing and uptime are non-issues.** LangGraph.js is genuinely open-source (MIT); Anthropic Agent SDK is commercial terms but has the same pricing model as your current Claude usage.

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
