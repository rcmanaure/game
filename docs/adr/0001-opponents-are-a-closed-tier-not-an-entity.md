# Opponents are a closed difficulty tier, not an entity

An opposedCheck resolves against a closed enum (trivial/minor/moderate/dangerous/deadly) the logic model picks from, not an object with its own hp or stats — set when the check/attack/opposedCheck mechanic was built, to stop the model self-selecting its own opponent's difficulty. `StatDeltas.targetHp` (a leftover from an earlier draft) was deleted because there is no entity for a successful attack's damage to target under this model.

## Consequences

A successful "attack" currently resolves narratively with no mechanical stat change — there is nothing to route damage to. Introducing real opponent damage means deciding what an opponent *is* first (a new entity, not just a delta key), not reintroducing the deleted field.
