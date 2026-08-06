# Edge Cases — @game-dev Boundary Testing

Casos extremos que podrían romper delegación. Tests para blindar jerarquía.

---

## Category 1: Ambiguous Requests (Design vs Code)

### Edge Case 1a: "Is the permadeath system good?"

**Ambiguity:** Could be design (fun factor) OR code (implementation quality)

**Routing Gamble:**
- Game-lead routes to @gameplay-designer (PRIMARY, assumes design question)
- But could be engineer asking about code quality of permadeath resolver

**Expected:** Game-lead asks clarification OR routes to both  
**Bad:** Game-lead assumes one, misses the other

**Test Prompt:**
```
@game-dev/game-lead
Is the permadeath system good?
```

**Validation Checklist:**
- [ ] Game-lead clarifies what "good" means (fun vs maintainable vs performant?)
- [ ] OR game-lead routes to multiple specialists if ambiguous
- ❌ FAIL if game-lead assumes only one dimension

---

### Edge Case 1b: "Core loop is slow"

**Ambiguity:** Could be performance issue OR design flaw (loop is boring = takes mental effort)

**Expected:** Game-lead routes to perf-engineer AND designer (parallel)  
**Bad:** Routes only to perf-engineer, misses design angle

**Test Prompt:**
```
@game-dev/game-lead
Core loop feels slow. Players complain.
```

**Validation:**
- [ ] Routes to both perf-engineer (is it actually slow?) + designer (is it boring?)
- ❌ FAIL if routes only to perf

---

## Category 2: Missing Context (Incomplete Brief)

### Edge Case 2a: "Fix the bug"

**Problem:** No context. Which bug? Where? How to reproduce?

**Expected:** Game-lead asks for clarification before delegating  
**Bad:** Game-lead delegates to QA with incomplete info

**Test Prompt:**
```
@game-dev/game-lead
Fix the bug.
```

**Validation:**
- [ ] Game-lead asks: "Which bug? Reproduction steps? Severity?"
- [ ] Doesn't delegate without context
- ❌ FAIL if routes to QA without clarification

---

### Edge Case 2b: "Optimize everything"

**Problem:** Too vague. What metric? CPU? Memory? FPS?

**Expected:** Game-lead asks: "What's slow? Measured how?"  
**Bad:** Game-lead routes to perf-engineer who can't help without data

**Test Prompt:**
```
@game-dev/game-lead
Performance is bad. Optimize.
```

**Validation:**
- [ ] Game-lead clarifies: "What metric? Measured where? What's target?"
- [ ] Doesn't delegate without specificity
- ❌ FAIL if routes to perf without metrics

---

## Category 3: Conflicting Requirements (Tradeoffs)

### Edge Case 3a: "Add feature X but don't break performance"

**Conflict:** Feature X might require 100ms latency (unacceptable for perf).

**Expected:** Game-lead routes to designer + perf, surfaces tradeoff  
**Bad:** Routes only to designer, perf discovers conflict later

**Test Prompt:**
```
@game-dev/game-lead
Add portrait evolution (AI generates new portrait each run).
Can't sacrifice performance (must stay <1s turn time).
Is this possible?
```

**Validation:**
- [ ] Routes to designer (is it fun?) + perf (is it possible at scale?)
- [ ] Game-lead surfaces tradeoff if conflict exists
- [ ] Recommendation addresses both constraints
- ❌ FAIL if ignores one constraint

---

### Edge Case 3b: "Ship fast but maintain code quality"

**Conflict:** Both might not be possible simultaneously.

**Expected:** Game-lead routes to engineer + researcher (precedent on tech debt), discusses tradeoff  
**Bad:** Routes only to engineer, engineer says "code quality requires time" but no guidance on tradeoff

**Test Prompt:**
```
@game-dev/game-lead
We need to ship in 2 weeks but I want maintainable code.
Is this realistic?
```

**Validation:**
- [ ] Routes to engineer (scalability + maintainability vs timeline)
- [ ] Game-lead discusses realistic expectations
- [ ] Recommends MVP scope or tech debt acceptance
- ❌ FAIL if promises both without tradeoff

---

## Category 4: Novel Features (No Precedent)

### Edge Case 4a: "AI that learns player behavior and adapts difficulty"

**Novelty:** Has shipped? No clear precedent.

**Expected:** Researcher says "no precedent found" → risk mitigation  
**Bad:** Researcher speculates ("sounds cool, players will like it")

**Test Prompt:**
```
@game-dev/game-researcher
Can we do AI difficulty adaptation that learns player skill over time?
```

**Validation:**
- [ ] Researcher admits "no precedent found"
- [ ] Researcher suggests similar systems that HAVE shipped (dynamic difficulty)
- [ ] Researcher assesses innovation risk
- [ ] No speculation ("players will love it")
- ❌ FAIL if speculates instead of mitigating

---

### Edge Case 4b: "NPC personality shifts based on player choices"

**Novelty:** Has shipped in Creatures (neuroevolution), but not in narrative context.

**Expected:** Researcher compares to Creatures, identifies novel angle, assesses risk  
**Bad:** Researcher says "this is totally new, ship it"

**Test Prompt:**
```
@game-dev/game-researcher
Should NPC personality change based on player interaction history?
```

**Validation:**
- [ ] Researcher finds closest precedent (Creatures, or AI learning systems)
- [ ] Identifies what's novel (applying it to NPC narrative)
- [ ] Assesses risk (personality drift could be confusing)
- [ ] Recommends scope mitigation
- ❌ FAIL if declares it novel without precedent search

---

## Category 5: Extreme Scale (Stress Testing)

### Edge Case 5a: "Scale to 1M concurrent players"

**Problem:** Backend designed for 100 concurrent. What breaks at 1M?

**Expected:** Engineer identifies cascade of failures (DB first, then API, then logic)  
**Bad:** Engineer says "just optimize" without identifying actual ceiling

**Test Prompt:**
```
@game-dev/gameplay-engineer
How do we scale to 1M concurrent players?
Current architecture: NestJS + PostgreSQL. Works at 100 concurrent.
```

**Validation:**
- [ ] Engineer identifies scalability ceiling (DB at ~1K concurrent)
- [ ] Engineer specifies what breaks first (DB bottleneck)
- [ ] Engineer recommends architectural changes (read replicas, sharding, microservices)
- [ ] Effort estimate realistic (major refactor)
- ❌ FAIL if says "optimize queries" as solution for 1M

---

### Edge Case 5b: "Support 10K art generation requests/minute"

**Problem:** Current art pipeline = 1-2 requests/second. 10K/min = 166 requests/sec.

**Expected:** Perf identifies bottleneck (API rate limit, image generation model capacity)  
**Bad:** Perf suggests "add caching" which doesn't solve model capacity problem

**Test Prompt:**
```
@game-dev/performance-engineer
Turn resolution includes art generation. At 10K players, we need 166 requests/sec.
Current pipeline: 1-2 requests/sec. What's the fix?
```

**Validation:**
- [ ] Perf identifies true bottleneck (image generation model capacity, not caching)
- [ ] Perf recommends: batch requests, model optimization, or third-party API
- [ ] Perf provides specific numbers (current: 2 req/sec, target: 166 req/sec, gap: 83x)
- [ ] Effort and cost realistic
- ❌ FAIL if says "just cache" or "optimize" without addressing model capacity

---

## Category 6: Incomplete Bug Reports (QA Edge Cases)

### Edge Case 6a: "The game is buggy"

**Problem:** No specifics. Crash? Wrong logic? Confusing UI?

**Expected:** QA asks for reproduction steps before accepting report  
**Bad:** QA files vague bug report with no repro

**Test Prompt:**
```
@game-dev/qa-tester
The game is buggy.
```

**Validation:**
- [ ] QA asks: "What's the symptom? How do I trigger it? What's expected vs actual?"
- [ ] QA doesn't accept vague reports
- ❌ FAIL if files bug without reproduction steps

---

### Edge Case 6b: "Sometimes permadeath doesn't work"

**Problem:** Intermittent bug. Not reproducible every time.

**Expected:** QA asks for pattern (happens at specific HP? After N turns? On specific actions?)  
**Bad:** QA can't help without pattern

**Test Prompt:**
```
@game-dev/game-lead
Permadeath sometimes doesn't trigger. I see it happen maybe 1 in 10 times.
```

**Validation:**
- [ ] Game-lead routes to QA (with instruction: find pattern)
- [ ] QA asks: "Happens at specific HP? After N turns? With specific actions?"
- [ ] QA designs test to reproduce (e.g., "run 100 test permadeaths, measure failure rate")
- [ ] QA doesn't file report until reproducible
- ❌ FAIL if QA files "intermittent, unknown cause" without pattern

---

## Category 7: Performance vs Code Quality Tradeoff

### Edge Case 7a: "We can ship 5x faster if we duplicate code in 3 places"

**Tradeoff:** Performance (speed to ship) vs maintainability (code quality).

**Expected:** Game-lead routes to engineer + researcher (precedent on tech debt costs)  
**Bad:** Routes only to engineer, engineer says "yes but bad idea" with no prioritization

**Test Prompt:**
```
@game-dev/game-lead
We can ship feature X in 1 week with code duplication, or 3 weeks with clean architecture.
What should we do?
Context: Core loop is already shipping, this is post-launch feature.
```

**Validation:**
- [ ] Routes to engineer (tech debt cost) + researcher (precedent on post-launch scope)
- [ ] Game-lead surfaces tradeoff clearly (time vs debt)
- [ ] Game-lead recommends based on priority (if retention critical: ship fast, refactor later)
- [ ] Recommendation is specific (tech debt roadmap if duplicating)
- ❌ FAIL if ignores tradeoff or defaults to "always clean code"

---

## Category 8: Specialist Crosstalk (Self-Healing)

### Edge Case 8a: Engineer Overscopes Design Decision

**Problem:** Engineer says "permadeath is bad design because the code is complex"

**Expected:** Game-lead catches crosstalk, redirects  
**Bad:** Game-lead accepts engineering opinion on design merit

**Test Prompt (Direct to Engineer):**
```
@game-dev/gameplay-engineer
Should we add permadeath? Code complexity is high.
```

**Validation:**
- [ ] Engineer: "I can tell you CODE cost. Designer tells you if it's FUN."
- [ ] Engineer refuses to make design call
- [ ] Redirects to designer
- ❌ FAIL if engineer says "don't add permadeath because code is complex"

---

### Edge Case 8b: Designer Ignores Technical Feasibility

**Problem:** Designer recommends feature that's technically impossible at scale

**Expected:** Game-lead catches when engineer rejects as unfeasible, surfaces conflict  
**Bad:** Design recommendation ignores implementation reality

**Test Prompt (Via Game-Lead):**
```
@game-dev/game-lead
Designer recommends: NPC portrait evolution via AI each turn (real-time generation).
Engineer says: "Impossible at scale (portrait generation = 1-2s per turn, breaks <1s target)."
How do we resolve?
```

**Validation:**
- [ ] Game-lead surfaces conflict (fun vs feasible)
- [ ] Game-lead recommends scope mitigation (pre-generate, cache, or defer to post-launch)
- [ ] Designer + engineer collaborate on solution
- ❌ FAIL if ignores engineer's feasibility concern

---

## Category 9: Researcher Admits Uncertainty

### Edge Case 9a: "I don't know if this has shipped"

**Problem:** Request asks for precedent on obscure mechanic (e.g., "NPC memory persistence + permadeath combined")

**Expected:** Researcher says "no precedent found", suggests decomposition + mitigations  
**Bad:** Researcher speculates or claims authority without finding

**Test Prompt:**
```
@game-dev/game-researcher
Has any shipped game done NPC memory persistence combined with permadeath
(NPC remembers player even across character deaths)?
```

**Validation:**
- [ ] Researcher searches honestly (GDC, major postmortems, Steam data)
- [ ] Researcher admits "no exact precedent found"
- [ ] Researcher decomposes (permadeath shipped widely, NPC memory in Creatures, but not combined)
- [ ] Researcher assesses risk (novel combination = high failure risk)
- [ ] Recommends: scope mitigation (prototype limited version first)
- ❌ FAIL if claims precedent without evidence or speculates

---

## Category 10: Decision Reversals (Context Change)

### Edge Case 10a: "Earlier we said X, now we need Y"

**Problem:** Requirements change. Game-lead must re-route.

**Expected:** Game-lead detects change, re-consults specialists  
**Bad:** Game-lead re-uses old recommendation

**Test Prompt:**
```
@game-dev/game-lead
Earlier you recommended: ship core loop first, add T26 later.
New context: investors want permadeath + character progression NOW for closed beta.
How does this change the recommendation?
```

**Validation:**
- [ ] Game-lead recognizes context change
- [ ] Game-lead re-consults designer + researcher (fun + feasibility at new timeline)
- [ ] Game-lead provides NEW recommendation (not old one)
- [ ] Timeline and risk re-assessed
- ❌ FAIL if repeats old recommendation without re-evaluating

---

## Category 11: Error Scenarios (System Under Stress)

### Edge Case 11a: Multiple Requests Arriving Simultaneously

**Problem:** 3 different game designers asking different questions at once.

**Expected:** Game-lead handles each independently, no crosstalk  
**Bad:** Game-lead confuses contexts or mixes recommendations

**Test Prompt (Hypothetical, would need parallel testing):**
```
Simultaneous:
1. @game-dev/game-lead: Is core loop fun?
2. @game-dev/game-lead: Should we add permadeath?
3. @game-dev/game-lead: Permadeath code is slow, optimize?

Expected: 3 separate, coherent responses. No bleed.
```

**Validation:**
- [ ] Each request gets independent analysis
- [ ] No mixing of contexts
- [ ] Specialist recommendations consistent across threads
- ❌ FAIL if responses contradict or mix contexts

---

## Validation Checklist (All Edge Cases)

For each edge case tested:

- [ ] Ambiguous request → game-lead clarifies or routes multi-specialist
- [ ] Missing context → game-lead asks clarification before delegating
- [ ] Conflicting requirements → game-lead surfaces tradeoff explicitly
- [ ] Novel features → researcher finds closest precedent + risk mitigation
- [ ] Extreme scale → engineer identifies cascade of failures
- [ ] Incomplete bug → QA asks for reproduction pattern
- [ ] Perf vs quality → game-lead discusses tradeoff + recommends priority
- [ ] Crosstalk → game-lead catches + redirects
- [ ] Researcher uncertainty → admits "no precedent" + suggests mitigation
- [ ] Context change → game-lead re-consults + re-recommends
- [ ] Parallel requests → independent, non-interfering responses

**Target:** >90% pass rate on edge cases.  
**Blocker:** Any crosstalk or incorrect routing = manual fix required.

---

**Status:** Edge cases cataloged, ready for testing.  
**Next:** Run all tests + edge cases, document in TEST_RESULTS_TEMPLATE.md.
