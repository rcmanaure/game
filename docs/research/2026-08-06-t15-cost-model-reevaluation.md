# T15 Cost-Model Re-evaluation (Quality > Velocity Pass)

**Date:** 2026-08-06  
**Status:** RESEARCH (decision pending T14 running live)  
**Priority:** P2 — should land before Foundational Decision #22 (monetization) free-turn-cap finalization  
**Blocker on:** Decision #22 turn-cap numbers, model selection for v1 launch

## Context

### Prior Decision (Decision #15, 2026-08-03)

Cost-driven model selection:
- **LOGIC_MODEL:** `google/gemini-2.0-flash-001` (~$0.0004 / call, 1M tokens context)
- **CREATIVE_MODEL:** `anthropic/claude-3.5-sonnet` (~$0.003 / call, cost trade-off accepted for quality)
- **IMAGE_MODEL:** OpenRouter image models (Nano Banana/Seedream, ~$0.04/image)

Rationale: Minimize LLM costs for MVP, trade off narration quality for affordability.

### New Constraint: Quality > Velocity

CEO review 2026-08-06 locked "Quality > Velocity" principle: when trade-offs arise, pick slower + better.

- **Ink + inkjs:** Pulled into v1 scope (narration consistency overrides schedule)
- **T19 recall:** Pulled into v1 scope (permadeath stakes overrides schedule)
- **Model selection:** Untouched. No re-evaluation of LOGIC_MODEL/CREATIVE_MODEL substance itself.

**Gap:** Models are the actual narration substance (Ink is just the template wrapper). If we're buying narration quality with Ink, we should also re-evaluate the underlying LLM choice.

### The Question

**Are the current models optimal for v1 launch under "quality > velocity"?**

Current assumptions:
- Gemini 2.0 Flash (fast, cheap, logic-only) adequate for D20 resolution
- Claude 3.5 Sonnet (expensive, high-quality) adequate for narration
- Fallback to Nemotron (free) on refusals

Reality checks needed:
1. Does Gemini 2.0 Flash actually pass D20 validation tests? (logic correctness)
2. Does Claude 3.5 Sonnet narrate consistently with Ink templates?
3. What's the actual cost per turn, per user, at scale?
4. Are there cheaper alternatives that don't sacrifice quality?

## Research Findings

### 1. Logic Model: Gemini 2.0 Flash

**Current:** `google/gemini-2.0-flash-001`

**Pros:**
- Fast (100-500ms latency per OpenRouter benchmarks)
- Cheap (~$0.0004 per call)
- Strong JSON output (native structured generation)
- 1M token context (overkill for D20 but future-proof)

**Cons:**
- Minimal tone control (no system prompt support, only user prompt)
- No fine-tuning (can't lock in "always return JSON" behavior)
- Hallucination risk on edge cases (does it *always* return valid JSON when requested?)

**Quality Risk:**
Turn validation depends on Gemini returning strict JSON. If hallucination causes invalid output, turn fails + narrate_fallback. Is this acceptable at scale?

**Alternative:** Anthropic Claude 3.5 Sonnet for logic
- Pros: Stronger guarantees on instruction-following, better error handling
- Cons: ~7x more expensive per call ($0.003 vs $0.0004)
- Verdict: If logic errors cause 5%+ turn failures, upgrade cost justified

**Recommendation (pending test data):**
- **Ship v1 with Gemini 2.0 Flash (current)**
- Monitor turn-validation failure rate
- If >2% failures from bad JSON: switch to Claude Opus (Decision #25 opens this)
- Threshold: if 1000 users × 10 turns = 10k turns, >200 failures = re-evaluate

### 2. Creative Model: Claude 3.5 Sonnet

**Current:** `anthropic/claude-3.5-sonnet`

**Pros:**
- Strong narrative instruction-following (respects Ink template structure)
- Good tone consistency (fantasy voice stays in-character across turns)
- Handles edge cases (refusals, off-topic actions) gracefully
- Tier 2 of Anthropic's latest (good baseline for quality)

**Cons:**
- Expensive ($0.003 per call, ~$0.03 per turn with retries)
- Slower than Gemini (1-2s latency vs 100-500ms)

**Quality Assessment:**
Narration is the core gameplay experience. Permadeath only feels intentional if narration is coherent. Ink templates help structure output, but LLM quality matters.

**Alternatives:**
1. **Anthropic Claude 3 Opus** (Decision #25 option)
   - Pros: Stronger instruction-following, better edge-case handling
   - Cons: Even more expensive (~$0.015 per call)
   - Use case: If Sonnet falls short on tone consistency

2. **Google Gemini 2.0 Flash**
   - Pros: Cheap, fast
   - Cons: Weaker narrative instruction-following, less reliable tone
   - Use case: Cost-cutting if narration quality not critical

3. **Open-source (Llama 3.1 via OpenRouter)**
   - Pros: Very cheap ($0.00015 per call), fast
   - Cons: Lower narrative quality, hallucination on edge cases
   - Use case: Fallback only, not primary

4. **Anthropic Claude 3 Haiku**
   - Pros: Cheap ($0.00025 per call), fast
   - Cons: Weaker narrative quality than Sonnet
   - Use case: Testing/fallback, not v1

**Recommendation (pending playtest data):**
- **Ship v1 with Claude 3.5 Sonnet (current)**
- Post-v1: Add A/B test cohort (10% Sonnet, 10% Opus, rest Gemini 2.0 Flash)
- Measure: player retention, narration-quality survey, cost per user
- Decision point: if Sonnet retention <40%, upgrade to Opus; if >60%, downgrade to Gemini Flash

### 3. Image Model: OpenRouter Image APIs

**Current:** OpenRouter (`google/gemini-2.5-flash-image`, `seedream`, `nano-banana`)

**Pros:**
- Cost capped (~$0.04/image flat via cache archetype keys, Decision #6)
- Quality acceptable for game purpose (retro TTRPG aesthetic)
- Fallback chain: Gemini → Seedream → Nano Banana

**Cons:**
- API latency (1-5s per image)
- No local control (can't retry, adjust prompt per-request)

**Status:** Locked (Decision #15). No re-evaluation needed for v1. Post-v1 candidate: migrate to Hugging Face local inference if image latency becomes bottleneck.

## Cost Analysis

### Per-Turn Breakdown (Worst Case: All LLM Calls + Retry)

| Component | Count | Unit Cost | Total |
|-----------|-------|-----------|-------|
| LOGIC_MODEL (Gemini 2.0 Flash) | 1 | $0.0004 | $0.0004 |
| CREATIVE_MODEL (Claude 3.5 Sonnet) | 1 + fallback | $0.003 | $0.003–0.006 |
| CREATIVE_MODEL_ALT (Nemotron) | 0–1 on refusal | free | $0 |
| IMAGE_MODEL | 0–1 per archetype | $0.04 | $0–0.04 |
| **Total per turn** | | | **$0.0034–0.0464** |
| **Avg (assume 50% with image)** | | | **~$0.025** |

### User Economics (Foundational Decision #22)

**Freemium + one-time unlock ($15–$25):**
- Free tier: 3 turns/day, unlimited chronicles
- Paid unlock: unlimited turns, cross-session recall

**Cost per user (assume 10 free turns → 1 unlock):**
- Free: 10 turns × $0.025 = $0.25 cost to platform
- If 20% convert to paid ($20 revenue per user):
  - Revenue: $20
  - Cost for free tier: $0.25
  - Margin: $19.75 / $20 = 98%

**Sensitivity (cost-model change):**
- If upgrade to Opus (2x more expensive): $0.04/turn average
  - Cost for free: $0.40
  - Margin: $19.60 / $20 = 98% (negligible impact)
- If downgrade to Gemini Flash (4x cheaper): $0.006/turn average
  - Cost for free: $0.06
  - Margin: $19.94 / $20 = 99.7% (minimal improvement)

**Conclusion:** Model cost is noise compared to revenue per user. Quality matters more than cost for conversion (narrative quality → perceived value → willingness to pay).

## Decision Framework

### Before Launch
- [ ] **T14 validation:** Run harness 1000+ turns, measure:
  - Logic success rate (% valid JSON from Gemini 2.0 Flash)
  - Narration consistency (subjective: tone stays in-character?)
  - Player feedback (via beta playtest, if available)

- [ ] **Cost validation:** Monitor live costs:
  - Actual OpenRouter usage (may differ from benchmarks)
  - Model fallback rates (if CREATIVE_MODEL refuses, how often used?)
  - Image cache hit rate (archetype reuse percentage)

### Go/No-Go Criteria

**Keep current models IF:**
- Logic success rate >98% (Gemini 2.0 Flash JSON reliability)
- Narration consistency rated "acceptable" by beta players
- No player complaints about narrative tone/voice

**Upgrade LOGIC_MODEL to Anthropic Opus IF:**
- Logic success rate <98% (Gemini 2.0 Flash unreliable)
- Cost impact: +$0.0008 per turn (acceptable)

**Upgrade CREATIVE_MODEL to Anthropic Opus IF:**
- Narration consistency rated "poor" by beta players
- Permadeath feels random, not intentional (quality issue)
- Cost impact: +$0.012 per turn (still acceptable per economics above)

**Downgrade CREATIVE_MODEL to Gemini 2.0 Flash IF:**
- Launch costs exceed budget (unlikely given economics above)
- Post-v1 only (not v1 launch)

## Action Items

1. **After T14 ships (T14 done ✅):**
   - Run 100+ turns via harness `npm run harness ...`
   - Log: LLM call latencies, token usage, error rates
   - Collect: narration quality samples

2. **Before v1 launch (T25+):**
   - Deploy to itch.io staging
   - Beta players run 1000+ turns
   - Measure: retention, narrative quality survey, cost per user

3. **Go/no-go meeting (post-beta):**
   - Review data against criteria above
   - Decide: keep current or switch models
   - Lock decision before Decision #22's final monetization numbers

## References

- **Original Decision #15:** `docs/designs/ai-dm-platform.md` "Amended 2026-08-03 (1)"
- **Quality > Velocity Principle:** `CLAUDE.md` Section "Quality > Velocity (2026-08-06)"
- **Monetization (Decision #22):** `docs/designs/ai-dm-platform.md` Section "Foundational Decisions" #22
- **Ink Integration (Decision #26):** `docs/research/narrative-frameworks.md`

---

**Next step:** After T14 validates, run this evaluation and update decision.
