# P0 Fix Plan — Recall Feature Blockers

**Priority:** BLOCKER  
**Effort:** 5 hours total (1h code, 2h validation, 2h buffer)  
**Timeline:** Today (2026-08-06)  
**Owner:** Gameplay Engineer  

---

## Blocker 1: turnNumber Parameter Missing

### Problem
`graph.service.ts:59` checks `if (input.turnNumber === 1)` but `runTurn()` signature has no turnNumber parameter.

**Result:** Recall query never executes (dead code).

### Current Code
```typescript
async runTurn(input: {
  turnId: string;
  userId: string;
  chronicleId: string;
  playerAction: string;
  character: CharacterSchema;
}) {
  // Line 59: unreachable code
  if (input.turnNumber === 1) {
    // This never runs because turnNumber undefined
  }
}
```

### Fix

**Step 1: Add turnNumber to runTurn signature**
```typescript
async runTurn(input: {
  turnId: string;
  userId: string;
  chronicleId: string;
  playerAction: string;
  character: CharacterSchema;
  turnNumber: number;  // ADD THIS
}) {
  // Now this works
  if (input.turnNumber > 1) {
    // Recall query can execute
  }
}
```

**Step 2: Calculate turnNumber in TurnReservationService.reserve()**
```typescript
async reserve(
  turnId: string,
  userId: string,
  chronicleId: string
) {
  const existingTurns = await this.turnRepository.count({
    where: {chronicleId}
  });
  const turnNumber = existingTurns + 1;
  
  // Pass to runTurn
  return this.graphService.runTurn({
    turnId,
    userId,
    chronicleId,
    playerAction,
    character,
    turnNumber  // NOW PASSED
  });
}
```

**Step 3: Test**
- [ ] Create character, take 1 action (turnNumber = 1, no recall expected)
- [ ] Take 2nd action (turnNumber = 2, recall should execute)
- [ ] Verify NPC context populated in narration

### Effort: 30 minutes code + 15 min test = 45 minutes

---

## Blocker 2: chronicleId Scope Missing

### Problem
NPC recall query filters only by `userId`, not `{userId, chronicleId}`.

**Result:** Multi-chronicle users get wrong NPC (mixes contexts across chronicles).

### Current Code
```typescript
const npc = await this.npcRepository.findOne({
  where: {userId: input.userId},  // ← WRONG, missing chronicleId
  order: {createdAt: 'DESC'}
});
```

### Fix

**Step 1: Add chronicleId scope**
```typescript
const npc = await this.npcRepository.findOne({
  where: {
    userId: input.userId,
    chronicleId: input.chronicleId  // ADD THIS
  },
  order: {createdAt: 'DESC'}
});
```

### Validation

**Scenario:** User has 2 chronicles (A, B), each with different NPC.

| Turn | Chronicle | Expected NPC | Actual (buggy) | Fixed |
|---|---|---|---|---|
| 1 | A | null (first turn) | null | ✅ null |
| 2 | A | NPC_A | NPC_A (maybe) | ✅ NPC_A |
| 1 | B | null (first turn) | NPC_A (WRONG) | ✅ null |
| 2 | B | NPC_B | NPC_A (WRONG) | ✅ NPC_B |

### Effort: 5 minutes code + 10 min test = 15 minutes

---

## Full Fix Execution (5 Hours)

### Hour 1: Code Changes (45 min code + 15 min review)
- **45 min:** Fix 2 P0s (turnNumber param + chronicleId scope)
- **15 min:** Code review (self or peer)
- **Status:** ✅ Code ready to test

### Hour 2-3: Validation (120 minutes)
**Test Suite (60 min):**
- [ ] Unit test: turnNumber calculation
- [ ] Unit test: chronicleId scoping
- [ ] E2E test: recall across 5 turns
- [ ] E2E test: multi-chronicle switching
- [ ] Edge case: parallel turns (same user, different chronicles)

**Quality Review (60 min):**
- [ ] TurnEntity schema audit (check for cosmetic debt)
- [ ] Art error handling audit (should emit error, not crash)
- [ ] Permadeath validation (doesn't interfere with recall)

### Hours 3-4: QA Regression (60 minutes)
- [ ] 10 random turn sequences (ensure no side effects)
- [ ] Memory profile (no leaks in NPC fetching)
- [ ] Performance check (recall query <50ms)

### Hours 4-5: Buffer + Sign-Off (60 minutes)
- [ ] Deployment checklist review
- [ ] Documentation update (if needed)
- [ ] Ready to ship sign-off

---

## Deployment Checklist

- [ ] 2 P0s code-reviewed
- [ ] All unit tests pass
- [ ] E2E tests pass (5 turn sequences)
- [ ] QA regression pass (10 sequences)
- [ ] Performance verified (<50ms recall query)
- [ ] Memory profile clean
- [ ] Recall feature tested with 2+ NPCs
- [ ] Ship sign-off

---

## Rollback Plan (If Needed)

**If recall still broken after fixes:**
1. Revert both commits
2. Disable recall feature via environment flag
3. Ship without T19
4. Debug post-launch (lower risk than shipping broken)

**Likelihood of needing rollback:** <5% (fixes are straightforward)

---

## Success Criteria

✅ Recall feature executes correctly (not dead code)  
✅ Multi-chronicle users get correct NPC (scoped properly)  
✅ No performance regression (<50ms query)  
✅ All tests pass  
✅ Ready to ship with confidence

---

## Sign-Off

**Code Owner:** [Engineer name]  
**Reviewed By:** [Code reviewer]  
**QA Sign-Off:** [QA lead]  
**Ready to Deploy:** [ ] YES / [ ] NO

**If NO, blockers:**
- [List any additional issues found]

---

**Timeline:** Today (2026-08-06)  
**Status:** Ready to execute  
**Risk:** LOW (straightforward fixes, good test coverage planned)
