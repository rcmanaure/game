# Test Results — @game-dev Hierarchy Validation

**Date:** [YYYY-MM-DD]  
**Tester:** [Your name]  
**Iteration:** 1 / 2 / 3...

---

## Executive Summary

**Overall Grade:** A / B / C / F  
**Pass Rate:** X% (target >90%)  
**Blockers:** None / [List]  
**Status:** ✅ Production Ready / ⚠️ Ready with Caveats / ❌ Needs Refinement

---

## Test 1: Game-Lead Delegates Correctly (Feature Design)

**Prompt Sent:**
```
[Copy prompt from GAME_DEV_TEST_CASES.md Test 1]
```

**Expected Routing:**
- ✅ @gameplay-designer (PRIMARY)
- ✅ @game-researcher (PRIMARY)
- ❌ NOT @gameplay-engineer
- ❌ NOT @qa-tester
- ❌ NOT @performance-engineer

**Actual Output:**
```
[Paste actual response here]
```

**Validation:**
- [ ] Correct specialists called
- [ ] Game-lead doesn't repeat, synthesizes
- [ ] Recommendation is actionable
- [ ] Timeline provided
- [ ] Next step clear

**Result:** ✅ PASS / ⚠️ PARTIAL / ❌ FAIL  
**Notes:** [Observations]

---

## Test 2: Gameplay-Engineer Stays in Code Domain

**Prompt Sent:**
```
@game-dev/gameplay-engineer
[Copy prompt from GAME_DEV_TEST_CASES.md Test 2]
```

**Expected Criteria:**
- ✅ Focuses on code: maintainability, scalability, coupling
- ❌ NO design talk ("should we rethink...")
- ✅ Concrete fix provided
- ✅ Effort estimate

**Actual Output:**
```
[Paste actual response here]
```

**Validation:**
- [ ] Stays in code domain (no design)
- [ ] Specific + measurable (no vague)
- [ ] Fix is concrete (not pseudo-code)
- [ ] Effort estimate provided

**Result:** ✅ PASS / ⚠️ PARTIAL / ❌ FAIL  
**Notes:** [Observations]

---

## Test 3: QA-Tester Doesn't Do Code Review

**Prompt Sent:**
```
@game-dev/game-lead
[Copy prompt from GAME_DEV_TEST_CASES.md Test 3]
```

**Expected Routing:**
- ✅ @qa-tester (PRIMARY)
- ✅ @gameplay-engineer (SECONDARY, for root cause)

**Expected QA Output:**
- ✅ Reproducible steps (exact, not vague)
- ✅ Severity tier (P0/P1/P2/P3)
- ❌ NO code analysis ("the algorithm is wrong")
- ✅ Exploit risk assessed

**Actual Output:**
```
[Paste QA response here]
[Paste Engineer response here]
```

**Validation:**
- [ ] QA owns reproducibility
- [ ] Engineer owns root cause
- [ ] No bleed (QA doesn't do code analysis)
- [ ] Game-lead directs action

**Result:** ✅ PASS / ⚠️ PARTIAL / ❌ FAIL  
**Notes:** [Observations]

---

## Test 4: Performance-Engineer Prioritizes Player-Visible Gains

**Prompt Sent:**
```
@game-dev/game-lead
[Copy prompt from GAME_DEV_TEST_CASES.md Test 4]
```

**Expected Criteria:**
- ✅ Identifies bottleneck (art generation)
- ✅ Measures before/after clearly
- ❌ NO micro-optimization of unchangeable things (LLM latency)
- ✅ Prioritizes player-visible (FPS, latency) over micro (allocations)

**Actual Output:**
```
[Paste actual response here]
```

**Validation:**
- [ ] Bottleneck correctly identified
- [ ] Before/after metrics clear
- [ ] Doesn't over-optimize
- [ ] Prioritization correct

**Result:** ✅ PASS / ⚠️ PARTIAL / ❌ FAIL  
**Notes:** [Observations]

---

## Test 5: Game-Researcher Cites Sources, No Speculation

**Prompt Sent:**
```
@game-dev/game-researcher
[Copy prompt from GAME_DEV_TEST_CASES.md Test 5]
```

**Expected Criteria:**
- ✅ Separates facts from analysis
- ✅ Cites primary sources (GDC, postmortems, public data)
- ❌ NO speculation ("maybe players will like it")
- ✅ Innovation risk identified

**Actual Output:**
```
[Paste actual response here]
```

**Validation:**
- [ ] Facts clearly separated
- [ ] Sources cited (or "no precedent found")
- [ ] No speculation
- [ ] Risk mitigation suggested

**Result:** ✅ PASS / ⚠️ PARTIAL / ❌ FAIL  
**Notes:** [Observations]

---

## Test 6: Gameplay-Designer Measures Fun Quantitatively

**Prompt Sent:**
```
@game-dev/gameplay-designer
[Copy prompt from GAME_DEV_TEST_CASES.md Test 6]
```

**Expected Criteria:**
- ✅ Fun score 1-10 with reasoning
- ✅ Loop cycle time measured
- ✅ Retention signal assessed
- ❌ NO vague ("I think it's fun")

**Actual Output:**
```
[Paste actual response here]
```

**Validation:**
- [ ] Fun score quantified
- [ ] Reasoning provided
- [ ] Retention signal measured
- [ ] Industry baseline cited

**Result:** ✅ PASS / ⚠️ PARTIAL / ❌ FAIL  
**Notes:** [Observations]

---

## Test 7: Multi-Specialist Convergence & Synthesis

**Prompt Sent:**
```
@game-dev/game-lead
[Copy prompt from GAME_DEV_TEST_CASES.md Test 7]
```

**Expected Routing:**
- ✅ @gameplay-designer (parallel)
- ✅ @qa-tester (parallel)
- ✅ @gameplay-engineer (parallel or sequential)
- ✅ @performance-engineer (async, if needed)

**Expected Game-Lead Synthesis:**
- ✅ 1-2 paragraph synthesis (not repetition)
- ✅ Decision matrix (3+ options)
- ✅ Recommendation clear
- ✅ Timeline + next step

**Actual Output:**
```
[Paste all specialist responses here]
[Paste game-lead synthesis here]
```

**Validation:**
- [ ] Correct specialists called in right order
- [ ] Each specialist in domain
- [ ] Game-lead synthesizes (not repeats)
- [ ] Decision matrix provided
- [ ] Actionable recommendation

**Result:** ✅ PASS / ⚠️ PARTIAL / ❌ FAIL  
**Notes:** [Observations]

---

## Test 8: Specialist Refuses Out-of-Domain (Error Recovery 1)

**Prompt Sent:**
```
@game-dev/gameplay-engineer
[Copy prompt from GAME_DEV_TEST_CASES.md Test 8]
```

**Expected Response:**
- ✅ Engineer redirects to designer
- ❌ Engineer does NOT answer design question
- ✅ Engineer clarifies: "I can tell you CODE impact, but DESIGN is designer's call"

**Actual Output:**
```
[Paste actual response here]
```

**Validation:**
- [ ] Redirects appropriately
- [ ] Doesn't answer out-of-domain
- [ ] Clarifies domain boundary

**Result:** ✅ PASS / ⚠️ PARTIAL / ❌ FAIL  
**Notes:** [Observations]

---

## Test 9: Researcher Refuses Speculation (Error Recovery 2)

**Prompt Sent:**
```
@game-dev/game-researcher
[Copy prompt from GAME_DEV_TEST_CASES.md Test 9]
```

**Expected Response:**
- ✅ Admits "no precedent found" (not speculation)
- ✅ Suggests proven alternative or risk mitigation
- ❌ NO guessing ("maybe players will like it")

**Actual Output:**
```
[Paste actual response here]
```

**Validation:**
- [ ] Admits lack of precedent
- [ ] Doesn't speculate
- [ ] Suggests mitigation or alternative

**Result:** ✅ PASS / ⚠️ PARTIAL / ❌ FAIL  
**Notes:** [Observations]

---

## Test 10: Crosstalk Detection & Self-Healing

**Scenario:**
[Describe if crosstalk occurred during any test]

**Expected:**
- ✅ Game-lead catches specialist drifting to other domain
- ✅ Game-lead redirects without blame
- ✅ Process self-heals

**What Happened:**
```
[Describe observation]
```

**Result:** ✅ PASS / ⚠️ PARTIAL / ❌ FAIL  
**Notes:** [Observations]

---

## Metric Summary

| Metric | Target | Actual | Result |
|---|---|---|---|
| **Routing Accuracy** | >90% | X% | ✅/❌ |
| **Crosstalk** | <5% | X% | ✅/❌ |
| **Specificity** | >85% | X% | ✅/❌ |
| **Synthesis Quality** | >80% | X% | ✅/❌ |
| **Error Recovery** | >90% | X% | ✅/❌ |

**Overall Score:** (X1 + X2 + X3 + X4 + X5) / 5 = X%

| Score | Grade |
|---|---|
| 90-100% | A (Production Ready) |
| 80-89% | B (Ready with Caveats) |
| 70-79% | C (Needs Refinement) |
| <70% | F (Needs Major Rework) |

**Final Grade:** [A/B/C/F]

---

## Issues Found

### Issue 1: [Title]
**Description:** [What went wrong]  
**Impact:** [Severity]  
**Fix:** [Proposed solution]  
**Effort:** [Quick/Medium/Major]  

### Issue 2: [Title]
...

---

## Observations & Recommendations

[General observations about system behavior]

**What Works Well:**
- [Observation]
- [Observation]

**Areas to Improve:**
- [Observation]
- [Observation]

**Recommendations for Next Iteration:**
- [Action]
- [Action]

---

## Sign-Off

**Tester:** _______________  
**Date:** _______________  
**Approved For Production:** ✅ YES / ⚠️ CONDITIONAL / ❌ NO

**Conditional Requirements (if applicable):**
- [List of requirements before production]

---

## Next Iteration Planning

**Scheduled Date:** [Date]  
**Focus Areas:** [What to test/improve]  
**Owner:** [Who runs next test]  
**Success Criteria:** [What must improve]

---

## Appendix: Raw Outputs

[Paste all raw agent responses here for reference]
