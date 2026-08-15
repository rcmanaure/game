# AI DM Platform

An AI-orchestrated dark-fantasy coterie-sim TTRPG: an LLM proposes intent and narrates outcomes, but dice, modifiers, and state transitions are always resolved server-side and never trusted from the model.

## Language

**Turn Resolution**:
The pipeline that takes one player action and produces a mechanical outcome: decide what's being attempted, validate the state transition it implies, narrate the result, trigger art. The logic model only proposes what to check — never a roll, a modifier, or a verdict.
_Avoid_: turn processing, game loop

**The Craving**:
A persisted 0-5 resource on a character, paid whenever a check is pushed for an edge. Currently write-only: the cost is charged and clamped, but nothing yet reads it to react — reaching 5 has no consequence.
_Avoid_: Hunger (VTM's proprietary term), Blood

**Stat Deltas**:
The closed set of sheet changes a resolved check can produce — hp and the Craving. Deliberately closed rather than an open bag: a new stat needs an explicit handler wherever deltas are applied, not just somewhere that emits it.
_Avoid_: mutation, effects

**Rules Rejection**:
A turn the engine refused to apply — e.g. any mutation targeting an already-dead character — as distinct from an ordinary mechanical failure. The roll still happened, but the state transition it implied was illegal; the reason travels with the turn rather than overwriting what was attempted.
_Avoid_: failure, error

**Opponent Tier**:
The closed difficulty band (trivial/minor/moderate/dangerous/deadly) an opposed check resolves against. An opponent is a rating the logic model picks from, not an entity with its own hp — there is currently nothing for a successful attack's damage to target.
_Avoid_: enemy, monster, NPC (as a mechanical target)
