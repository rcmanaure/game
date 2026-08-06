# P2 Decision: Core Loop Validation Checkpoint

**Status:** PLANNING (post-T14, pre-T26/T27)  
**Priority:** P2 — sequencing decision between accepted phases, not a scope question  
**Timeline:** Review immediately after T14 ships (est. 2026-08-12)  
**Decision maker:** User (CEO review)  
**Purpose:** Validate core loop feels right before shipping T26/T27 (novel, unproven features)

## Context

### Why This Checkpoint?

T26 (predefined-character coterie assembly) and T27 (portrait evolution via image-to-image) are **structurally novel** — no shipped product keeps free-form portraits consistent across generations, and few let players "build a team" with permadeath mechanics.

**Risk:** Ship these features, discover core loop is broken, sunk cost on novel features.

**Mitigation:** Stop after T14 (core DM + recall working end-to-end), validate the loop feels intentional before T26/T27.

This is not a scope question (T19, T26, T27 stay v1 per CEO review 2026-08-06). It's a sequencing question: **can we trust the novel features will be fun if we build them on top of a validated core loop?**

## What "Core Loop" Means

After T14 ships:

1. **Player launches game** → AI DM greets them
2. **Player acts** (free text) → D20 roll + LLM narration
3. **Outcome:** Consistent narration, fair dice, art cache coherence, permadeath feels intentional
4. **Consequence:** Turn result persists (T14b/T14d complete), NPC recall works (T19 complete)

**Success criteria:**
- Narration voice is coherent across multiple turns (Ink templates + LLM working together)
- Permadeath feels *earned*, not random
- Players want to retry after death (retention signal)
- Art cache archetype keys feel satisfying (not too generic, not too specific)

**Failure criteria:**
- Narration falls flat (hallucinations, tone breaks, off-topic)
- Permadeath feels unfair (dice feel rigged, or rules unclear)
- Players quit after first death (high churn)
- Art mismatches narration (archetype cache doesn't work as intended)

## Checkpoint Format

### What We'd Validate (2-3 hour session)

```
1. Run T14 code end-to-end (backend + harness)
   - 10+ turns, multiple characters, varied actions
   - Check: Ink templates structure narration consistently?
   - Check: D20 rolls feel fair (stat bonuses apply correctly)?
   - Check: Art cache keys match narration tone?

2. Play as end-user (via harness CLI)
   - Kill a character (trigger permadeath)
   - Restart with same user (trigger recall node)
   - Check: Does the game feel like a *world* remembers you?
   - Check: Does permadeath feel intentional or unfair?

3. Gather feedback
   - Narration quality: 1-10 scale, notes on breakage
   - Permadeath perception: Does it feel earned?
   - Retry desire: Would you play again?

4. Decision
   - GO: Loop feels solid, ship T26/T27
   - HOLD: Loop has issues, fix first, then T26/T27
   - PIVOT: Scope/architecture issue, escalate to full review
```

### Expected Outcomes

**GO (most likely):** Core loop validated, T26/T27 schedule unaffected

**HOLD (medium risk):** Core loop needs fixes (e.g., narration inconsistency, recall node bugged)
- Effort: Variable (1-5 days to patch)
- Impact: T26/T27 slip by 1-2 weeks
- Example: "Narration voice breaks mid-session, need to rewrite LLM prompt"

**PIVOT (low risk):** Fundamental architecture issue found
- Example: "Ink templates don't work with streaming narration, need redesign"
- Impact: Escalate to full architecture review
- Effort: Unknown, potentially major

## Not in Scope (This Checkpoint)

- [ ] Frontend UI refinement (T5+ feature)
- [ ] Monetization validation (Decision #22 decision, not T14 feature)
- [ ] Completion of T26/T27 (that's post-checkpoint)
- [ ] Post-v1 roadmap (TTS, chronicle ledger, etc.)

**In scope only:** Does T14 output feel like a *game* or a *tech demo*?

## Who Should Attend

- **User (CEO):** Final call on GO/HOLD/PIVOT
- **Code:** You (can walk through T14 implementation, answer architecture questions)
- **Optional:** Beta tester (if available) to play a turn and give gut feeling

## Timeline

- **T14 completes:** ~2026-08-12 (est.)
- **Checkpoint session:** Same day or within 2 days
- **Decision:** <1 hour meeting
- **T26 start:** Immediately after GO decision, or delay if HOLD

## Preparation (Before Checkpoint)

For the session to be efficient:

```
[ ] T14 code is buildable (npm install, npm run test pass)
[ ] Harness runs without errors (npm run harness "test action")
[ ] At least one full turn logged (with narration + art output)
[ ] CLAUDE.md updated with any blockers discovered during T14 build
```

## Questions to Answer

Go through these during checkpoint:

1. **Narration Quality**
   - Does Ink templating structure the output as intended?
   - Are there broken fantasy-voice breaks (modern slang, out-of-character)?
   - Does fallback narration (on LLM refusal) feel acceptable?

2. **Permadeath Psychology**
   - Does a character's death feel like a consequence of player choice?
   - Or does it feel random / unfair / due to poor dice?
   - Would a player retry after death, or quit?

3. **Recall Node (T19)**
   - Does NPC resurface naturally in the opening narration?
   - Is it helpful (adds continuity) or confusing (feels like a non-sequitur)?

4. **Art Cache**
   - Do repeated archetypes feel like the "same enemy" or unrelated?
   - Is the STYLE_FORMULA coherent across images?

5. **Pacing**
   - Does a full turn (resolve → narrate → art-gen) complete in acceptable time (<10s)?
   - If slow, is it LLM latency, art gen, or data layer?

## Success Criteria Summary

| Aspect | Pass | Fail |
|--------|------|------|
| **Narration** | Voice consistent, no major hallucinations | Off-topic, tone breaks, incoherent |
| **Permadeath** | Feels earned, player would retry | Feels random, player would quit |
| **Recall** | Adds continuity, feels natural | Confusing, feels forced |
| **Art** | Archetypes coherent, style consistent | Mismatched, style broken |
| **Perf** | <10s per turn | >30s, unplayable |

**Gate:** ≥4/5 aspects pass → GO  
**Gate:** <4/5 aspects pass → HOLD (analyze failures, fix, retest)

## Post-Checkpoint Action

**If GO:**
- Merge T14 to main
- Start T26 (character assembly)

**If HOLD:**
- File blockers to TODOS.md
- Estimate fix effort
- Update roadmap
- Rerun checkpoint after fixes

**If PIVOT:**
- Escalate to full architecture review
- May need to reconsider Ink scope or LLM orchestration

## References

- **T14 Implementation:** `src/harness/graph.ts`, `src/backend/graph/graph.service.ts`
- **Ink Integration:** `docs/research/narrative-frameworks.md`
- **NPC Recall (T19):** `src/backend/graph/graph.service.ts` lines 56-72
- **Permadeath Design:** `docs/designs/ai-dm-platform.md` Section "Permadeath Mechanic"

---

**Owner:** User  
**Estimated time:** 2-3 hours (1h checkpoint + 1-2h analysis if needed)  
**Blocker on:** T26/T27 start  
**Next:** Schedule for 2-3 days after T14 merge-ready
