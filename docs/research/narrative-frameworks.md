# Text-Based Narrative Game Frameworks for LLM-Driven Storytelling

**Research Date:** August 6, 2026  
**Scope:** Primary sources only (official repos, first-party docs, GitHub stats)  
**Decision Framework:** Can we fork + extend minimally, or build from scratch?

---

## Executive Summary

**Recommendation: Fork Ink + inkjs**

For LLM-driven narrative generation:
- **Best fit**: Ink (4,889 stars, MIT license, actively maintained) + inkjs runtime (649 stars, TypeScript)
- **Proven integration**: poltergink (TypeScript LLM wrapper around inkjs) demonstrates the pattern works
- **Rationale**: Smallest diff to add LLM calls; game-side function architecture built for this
- **Runner-up**: Yarn Spinner (2,818 stars, very active, but dialogue-focused, more suited to branching choice-based narratives)

---

## Framework Analysis

### 1. **Ink** (by Inkle Studios)

**Repository**: `inkle/ink`  
**GitHub Stats**:
- Stars: 4,889
- Last commit: 2026-05-05
- Language: C# (compiler), multiple ports available
- License: MIT

**Official Ecosystem**:
- Compiler/spec: `inkle/ink` (C#)
- JavaScript runtime: `inkjs` (y-lohse/inkjs, 649 stars, TypeScript, last push: 2026-08-01)
- Official runtime: `inkle/inkjs` (4 stars, archived in favor of community port)
- Editor: `inky` (2,709 stars, maintained)
- Unity integration: `ink-unity-integration` (707 stars, last push: 2026-07-08)
- Godot port: `godot-ink` (768 stars, C#)

**Dynamic Content Support**: YES
- Variables and logic built in (global vars, temp vars, conditionals)
- **Game-side function declarations**: Official feature (documented in WritingWithInk.md, Part 3, Section 7)
- External functions can be called from Ink scripts; game side provides implementation
- Variable observers: callbacks fired when ink variables change

**External API Integration**: YES
- Architecture designed for game-side hooks
- Ink calls → game layer implements (fetch, LLM calls, database queries, etc.)
- No built-in HTTP, but trivial to add at game layer

**LLM Integration Proof**: YES
- **poltergink** (Eldriss-Studio/poltergink): LLM-native TypeScript wrapper around inkjs
  - Description: "An LLM holds a persona, reads the narrative, and is forced to pick from author-defined choices"
  - Status: Early development but functional (Story facade + Session orchestrator shipped)
  - Pattern: Ink handles branching; LLM is constrained to choice selection (no freeform generation)

**Maintenance Status**: Actively maintained
- Last compiler push: 2026-05-05
- Editor (Inky) pushed: 2026-05-05
- inkjs runtime pushed: 2026-08-01

**Scope**: Writing system + runtime compiler (both for authoring and execution)

**Assessment for LLM Storytelling**:
- ✅ Extensible for LLM calls via game-side functions
- ✅ Multiple language runtimes (C#, JavaScript, etc.)
- ✅ Proven pattern exists (poltergink)
- ✅ Non-over-engineered starting point
- ✅ Large active ecosystem

---

### 2. **Yarn Spinner** (by Secret Lab Pty. Ltd. / Unity)

**Repository**: `YarnSpinnerTool/YarnSpinner`  
**GitHub Stats**:
- Stars: 2,818
- Last commit: 2026-08-05 (very recent)
- Language: C#
- License: MIT

**Key Points**:
- Described as "friendly dialogue tool" (NOT a full branching narrative engine)
- **Purpose**: Engine-agnostic dialogue scripting (focus on character conversation)
- Screenplay-like syntax
- Used in: Night in the Woods, A Short Hike, DREDGE, Venba, Lost in Random

**Dynamic Content Support**: YES
- State machine approach
- Variables and conditions supported
- **Commands**: `<<command arguments>>` syntax sends commands to game loop

**External API Integration**: YES
- Command architecture allows game engine to process external calls
- Engine-agnostic design means it's meant to be embedded in host systems

**LLM Integration**: Viable
- Commands can trigger LLM calls in host engine
- Well-documented for custom integrations

**Maintenance Status**: Very active
- Last push: 2026-08-05 (today's date)
- Epic Games grant + Patreon funding mentioned
- Active Discord community

**Scope**: Dialogue/narrative scripting (narrower than Ink)

**Assessment for LLM Storytelling**:
- ✅ Actively maintained (more recent than Ink)
- ✅ Clean command architecture for external calls
- ✅ Engine-agnostic (easy to embed)
- ⚠️ Dialogue-focused, not full branching narrative
- ⚠️ Smaller ecosystem for LLM integration examples
- ✅ Would work for choice-based narratives with LLM flavor text

---

### 3. **ChoiceScript** (by Heart's Choice / dfabulich)

**Repository**: `dfabulich/choicescript`  
**GitHub Stats**:
- Stars: 457
- Last commit: 2026-05-29
- Language: JavaScript
- License: "Other" (proprietary/custom)

**Purpose**: Language for developing multiple-choice games (Part of Heart's Choice platform)

**Dynamic Content Support**: YES (within choice-based paradigm)
- Variable tracking
- Conditional branches
- Statistics tracking

**External API Integration**: Unclear
- Design is optimized for choice-based games with pre-authored branches
- Not obviously designed for procedural/LLM content generation
- Would require investigation into runtime extensibility

**Maintenance Status**: Active
- Regular commits (last push: 2026-05-29)
- Part of established platform (Heart's Choice games)

**Assessment for LLM Storytelling**:
- ⚠️ "Choice" is literal: pre-authored choices, not procedural generation
- ⚠️ Less clear integration pattern for LLM calls
- ⚠️ License uncertainty (proprietary)
- ✅ Well-maintained and proven (used in real games)
- If scope is constrained to choice-based (not procedurally generated), could work

---

### 4. **Twine** (by Chris Klimas)

**Repository**: `tweecode/twine`  
**GitHub Stats**:
- Stars: 680
- Last commit: 2022-03-31 (4 years old)
- Language: Python
- License: Not listed (unknown)

**Purpose**: UI for creating hypertext stories (authoring tool, not runtime-focused)

**Status**: Largely obsolete
- Last push: 2022-03-31 (nearly 4 years)
- Older codebase
- Smaller community

**Assessment for LLM Storytelling**:
- ❌ Avoid. Too old, less active than alternatives.
- ❌ Python-based makes runtime integration harder than Ink/Yarn (which target game engines)
- ✅ If you need only a Twine → HTML author-facing tool, might work for that niche

---

## Other Narrative Engines (Brief Scan)

- **Inkling** (pjohansson/inkling): Rust narrative language, 43 stars, small community
- **Monocle** (thesephist/monocle): Interactive fiction, 1,525 stars, but last push 2022-11-06 (old)
- **Kni** (borkshop/kni): Narrative engine, 83 stars, MIT, limited documentation

None of these match Ink or Yarn Spinner in ecosystem maturity.

---

## Decision Matrix

| Criterion | Ink | Yarn | ChoiceScript | Twine |
|-----------|-----|------|--------------|-------|
| **Maintenance** | Active (2026-05-05) | Very active (2026-08-05) | Active (2026-05-29) | Dead (2022-03-31) |
| **Stars** | 4,889 | 2,818 | 457 | 680 |
| **License** | MIT | MIT | Other | Unknown |
| **Dynamic Content** | ✅ Yes | ✅ Yes | ✅ Yes (limited) | ✅ Yes |
| **External API Calls** | ✅ Game-side functions | ✅ Commands | ⚠️ Unclear | ⚠️ Hard |
| **LLM Integration** | ✅ Proven (poltergink) | ✅ Viable | ⚠️ Unclear | ❌ No |
| **Ecosystem Size** | Large (4 runtime ports) | Medium (multi-engine) | Small (niche) | Small (old) |
| **Fork + Extend Difficulty** | Low (clear architecture) | Low (clean API) | Medium | High (outdated) |

---

## Specific Findings: LLM Extensibility

### Ink Game-Side Functions (Documented)

From `WritingWithInk.md` (Part 3, Section 7):

> "External function declarations in ink allow you to directly call C# functions in the game, and variable observers are callbacks that are fired in the game when ink variables are modified."

**Pattern**:
1. Ink script declares: `{ myFunction(arg1, arg2) }`
2. Game layer provides C# implementation
3. Ink story can trigger game-side logic (fetch, LLM call, database query)

This is exactly the architecture needed for LLM storytelling:
- Ink branches the narrative (deterministic, author-controlled)
- Game layer calls LLM for dynamic content (description, flavor text, alternative choices)
- Story state kept in sync with game state

### Yarn Spinner Commands Pattern

Yarn uses `<<command arg1 arg2>>` syntax:
- Parsed by Yarn compiler
- Passed to game engine for interpretation
- Game engine can implement custom behaviors (including LLM calls)

Slightly more boilerplate than Ink's function calls, but equally viable.

### ChoiceScript Limitations

Design assumes author-defined choices. To add LLM generation:
- Would need to modify runtime to support dynamic choice creation
- Not impossible, but not the intended use case

---

## Recommendation

**Primary Choice: Ink + inkjs**

**Why**:
1. **Proven pattern exists** (poltergink proves it works)
2. **Explicit architecture for game-side hooks** (no hacky workarounds needed)
3. **Largest ecosystem** (most documentation, tools, ports)
4. **TypeScript runtime** (inkjs) integrates easily with Node/browser LLM clients
5. **Minimal fork scope**: Can wrap inkjs + add LLM layer without modifying Ink itself

**Starting Point**:
- Use inkjs as-is (don't fork the compiler)
- Add LLM player layer (similar to poltergink's `LLMPlayer` API)
- Game side: Ink calls → fetch LLM response → pass back to story
- No need to fork Ink itself; just compose on top

**Alternative (if dialogue-focused): Yarn Spinner**

If your game is primarily dialogue-driven (NPC conversations), Yarn might be cleaner:
- Sharper focus on what it does
- Very active development
- Clear command architecture
- Still has good documentation

---

## Conclusion

**Can we fork + extend minimally?** YES, with Ink.

The existing Ink ecosystem (especially the game-side function architecture) was designed for exactly this problem. poltergink proves that adding LLM layer is straightforward.

**Build from scratch?** Not recommended.

Ink already handles:
- Branching logic
- State tracking
- Dynamic text (variables)
- Choice management

Building a custom narrative engine means re-implementing all of that. Ink is not over-engineered for its scope; it's exactly right.

---

## References

- `inkle/ink`: https://github.com/inkle/ink (4,889 ⭐, MIT, C#)
- `inkjs` (TypeScript port): https://github.com/y-lohse/inkjs (649 ⭐, TypeScript)
- `poltergink` (LLM wrapper): https://github.com/Eldriss-Studio/poltergink (MIT, early dev)
- `YarnSpinnerTool/YarnSpinner`: https://github.com/YarnSpinnerTool/YarnSpinner (2,818 ⭐, MIT, C#)
- `dfabulich/choicescript`: https://github.com/dfabulich/choicescript (457 ⭐, JavaScript)
- `tweecode/twine`: https://github.com/tweecode/twine (680 ⭐, Python, inactive)

**Last Updated**: 2026-08-06
