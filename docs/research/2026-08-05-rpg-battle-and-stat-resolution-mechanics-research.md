---
status: DRAFT
---
# Research: Battle/Stat-Resolution Mechanics for the AI-DM Coterie-Sim

**Scope:** this pass is narrowly about the core resolver mechanic — the
"Attribute+Skill/Discipline vs roll -> event -> narration -> state update"
pattern carried forward from the superseded plan (see the `Supersedes`
section of `docs/designs/ai-dm-platform.md`) and referenced by Foundational
Decision #7/#19-21's two-model architecture. **Not re-litigated here:** IP
naming (Decision #1 — "the Craving," "bloodlines," "Humanity" stay as
already named), the permadeath/Torpor model (Decision #5), the fixed
art-archetype taxonomy (Decision #6), the 18+ content boundary (Decision
#14), or the LangGraph.js orchestration substrate (Decisions #19-21). This
file does not edit `docs/designs/ai-dm-platform.md`, `TODOS.md`, or
`DESIGN.md` — findings below are candidates for a future `/plan-ceo-review`
or `/plan-eng-review` pass only.

**Why this research now:** `src/harness/state.ts` and `src/harness/graph.ts`
already have a working LangGraph pipeline (`resolve` -> `narrate` ->
`artTrigger`), but the `resolve` node's prompt (`graph.ts` line 29) asks the
logic model to freely invent `statDeltas: Record<string, number>` with no
dice mechanic, no target number, and no opposed-check structure behind it —
the exact gap this research is meant to close. `GameEventSchema` (`state.ts`)
currently only checks JSON *shape*, not rules *legality* (see the comment at
the top of that file), which matches Decision #7's framing exactly: schema
validity and rules legality are explicitly two different gates, and only the
first one is wired up yet.

**Sources note:** both official rulebooks below were fetched directly (not
paraphrased from secondary blog posts) and converted to text locally for
exact quotes and page numbers.

---

## 1. D&D 5th Edition SRD 5.1 — the d20-vs-DC model

Source: **System Reference Document 5.1**, Wizards of the Coast, released
under CC-BY-4.0 (2023-01-27). Official PDF:
[media.wizards.com/2023/downloads/dnd/SRD_CC_v5.1.pdf](https://media.wizards.com/2023/downloads/dnd/SRD_CC_v5.1.pdf).
All citations below are to this document, "Using Ability Scores" and
"Combat" chapters.

### Ability scores and modifiers (p. 76)
Six abilities — Strength, Dexterity, Constitution, Intelligence, Wisdom,
Charisma (the SRD's "Using Ability Scores" chapter covers each in turn).
"Each ability also has a modifier, derived from the score and ranging from
−5 (for an ability score of 1) to +10 (for a score of 30)... To determine an
ability modifier without consulting the table, subtract 10 from the ability
score and then divide the total by 2 (round down)." A score of 10-11 is
average; modifiers range roughly −5 to +10 across the full 1-30 range a
character or monster could have.

### The ability check mechanic (p. 76-77)
"An ability check tests a character's or monster's innate talent and
training in an effort to overcome a challenge... For every ability check,
the GM decides which of the six abilities is relevant to the task at hand
and the difficulty of the task, represented by a Difficulty Class." The
SRD's own **Typical Difficulty Classes** table: Very easy 5, Easy 10, Medium
15, Hard 20, Very hard 25, Nearly impossible 30. Resolution: "roll a d20 and
add the relevant ability modifier... compare the total to the DC. If the
total equals or exceeds the DC, the ability check is a success."

### Proficiency bonus (p. 76)
A separate, level-derived bonus "used in the rules on ability checks, saving
throws, and attack rolls," added on top of the ability modifier when the
character is proficient in the relevant skill/weapon/save — i.e. the full
check formula is `d20 + ability modifier + proficiency bonus (if
proficient) vs DC`, not just ability modifier alone.

### Advantage and disadvantage (p. 76)
"You roll a second d20 when you make the roll. Use the higher of the two
rolls if you have advantage, and use the lower roll if you have
disadvantage... If multiple situations affect a roll and each one grants
advantage or imposes disadvantage on it, you don't roll more than one
additional d20... If circumstances cause a roll to have both advantage and
disadvantage, you are considered to have neither of them, and you roll one
d20." This is a clean, fully-specified state machine (at most one extra d20,
net-cancel to neutral) — trivially representable as a boolean or tri-state
flag in structured data.

### Skill list mapped to ability (p. 77-78)
Directly from the SRD's own list ("No skills are related to Constitution"):
- **Strength:** Athletics
- **Dexterity:** Acrobatics, Sleight of Hand, Stealth
- **Intelligence:** Arcana, History, Investigation, Nature, Religion
- **Wisdom:** Animal Handling, Insight, Medicine, Perception, Survival
- **Charisma:** Deception, Intimidation, Performance, Persuasion

The SRD also documents a **passive check** variant (no die roll: `10 + all
modifiers`, ±5 for advantage/disadvantage, p. 78) and a **group check**
variant (majority of the group must individually succeed, p. 78) — both
relevant if this project ever wants a non-dice "ambient" check (e.g. a
standing Perception score for a stealth encounter) without spending a full
resolve-node LLM call on it.

### Contests / opposed checks (p. 77)
"Both participants in a contest make ability checks appropriate to their
efforts... instead of comparing the total to a DC, they compare the totals
of their two checks. The participant with the higher check total wins the
contest... If the contest results in a tie, the situation remains the same
as it was before the contest" — i.e. **ties favor the status quo, not a
reroll**, a detail worth carrying forward since it's a free, zero-extra-roll
tie-break rule.

### Combat resolution (p. 89-96)

**Order of combat (p. 89):** a strict 5-step sequence — (1) determine
surprise, (2) establish positions, (3) roll initiative, (4) take turns in
initiative order, (5) begin the next round, repeating step 4 until the fight
ends. "Initiative determines the order of turns during combat. When combat
starts, every participant makes a Dexterity check... The GM ranks the
combatants in order from the one with the highest Dexterity check total to
the one with the lowest... The initiative order remains the same from round
to round."

**Turn structure — action/bonus action/reaction economy (p. 89-90):** "On
your turn, you can move a distance up to your speed and take one action...
Various class features, spells, and other abilities let you take an
additional action on your turn called a bonus action... You can take only
one bonus action on your turn... Certain special abilities, spells, and
situations allow you to take a special action called a reaction. A reaction
is an instant response to a trigger of some kind, which can occur on your
turn or on someone else's... When you take a reaction, you can't take
another one until the start of your next turn." So per-turn budget is
exactly: one move + one action + (conditionally) one bonus action, plus at
most one reaction per full round regardless of whose turn it is.

**Attack roll vs Armor Class (p. 94):** "roll a d20 and add the appropriate
modifiers. If the total of the roll plus modifiers equals or exceeds the
target's Armor Class (AC), the attack hits." Critically, **AC is a static,
precomputed defense number** ("determined at character creation" for PCs,
"in its stat block" for monsters) — the defender does not roll anything on
a normal attack. Natural 20 always hits (critical hit) and natural 1 always
misses, regardless of modifiers or AC (p. 94).

**Damage rolls (p. 96):** "roll the damage die or dice, add any modifiers,
and apply the damage to your target... it is possible to deal 0 damage, but
never negative damage." Critical hits "roll all of the attack's damage dice
twice and add them together. Then add any relevant modifiers as normal" —
i.e. crit doubles the dice only, not the flat modifier.

**True opposed rolls do exist inside combat, but only for specific actions**
(p. 95, "Contests in Combat"): grappling and shoving are each resolved as a
Strength (Athletics) check by the attacker contested by the target's
Strength (Athletics) or Dexterity (Acrobatics) check (target's choice of
ability) — the general "attack roll vs AC" pattern is the exception-to-the-
opposed-check-norm in D&D combat, not the rule; most attacks are roll-vs-
static-number, and only grapple/shove (and any GM-improvised contest) are
roll-vs-roll.

---

## 2. Vampire: The Masquerade 5th Edition — the dice-pool-vs-difficulty model

**Source correction on the brief:** the task named "Paradox Interactive /
By Night Studios' official free Quickstart PDF." By Night Studios publishes
*Laws of the Night* — the V5 **LARP** ruleset, a different game with
different mechanics, not the tabletop V5 dice-pool system this project is
actually inspired by. The correct free official primary source for
**tabletop V5's core mechanics** is **"The Monster(s): A Vampire: The
Masquerade 5th Edition Quickstart"**, published free (2018 Free RPG Day
release) by Modiphius Entertainment, V5's licensed tabletop publisher, under
license from Paradox Interactive (who owns the White Wolf/World of Darkness
IP). PDF fetched directly:
[archive.org — VtM5 - The Monsters.pdf](https://ia800705.us.archive.org/13/items/world-of-darkness-fifth-edition-books_202503/VtM5%20-%20The%20Monsters.pdf).
Page citations below refer to this quickstart's own numbering (its "Chapter
1" rules-intro section, pp. 5-7, and its combat section, pp. 14-15).

### The Attribute + Skill dice-pool mechanic (p. 5-6)
"Basic rolls are simple - whenever a character wants to accomplish
something that is difficult and the outcome is uncertain, add one character
attribute (Strength, Composure, etc) to one character skill (Drive,
Larceny, etc.), roll that many dice and count all that come up 6 or more:
this is the number of successes. If the number of successes equals or
exceeds the Difficulty of the task (set by the Storyteller) the character
succeeds." The quickstart's own worked example: Manipulation 3 + Subterfuge
3 = 6 dice rolled, results "6, 3, 5, 7, 7, 8" = four successes (6, 7, 7, 8
all count), beating a stated Difficulty of 3. So this is a **d10 dice pool,
success-counting** system (die size d10, success threshold ≥6 per die), not
a single-die-plus-modifier system — structurally distinct from D&D's model
at the most basic level.

### Criticals (general, p. 6)
"Whenever you make a roll and get two or more tens ('0' on many ten-sided
dice), you have scored a critical, and get two extra successes!" — a flat
+2-successes bonus, not doubled dice like D&D's crit.

### The Hunger dice mechanic (p. 6) — precise mechanics
"Keep track of each player character's hunger level with off-color ten
sided dice (one dice per level of hunger). It ranges from zero (satisfied)
to five (ravenous)... Whenever you make a roll, substitute as many dice for
hunger dice as your level of hunger." Worked example: a character at Hunger
3 rolling a 5-dice pool substitutes 3 of those 5 dice for Hunger dice (the
other 2 stay normal dice) — **Hunger dice are not extra/bonus dice, they
replace a subset of the normal pool 1-for-1**, up to the character's current
Hunger level (capped at 5, since the pool of colored dice never exceeds 5).

### Messy Critical (p. 6)
"Whenever you score a critical and at least one '10' ('0') comes from a
hunger dice, the character's vampiric nature (also known as 'The Beast')
makes itself known. You get two extra successes, but perform the action as
a vampire would" (worked example: succeeding at research but breaking an
archivist's arm out of vampiric annoyance). So Messy Critical = (general
critical condition: ≥2 tens) AND (at least one of those tens came
specifically from a Hunger die) → same mechanical benefit as a plain
critical, but the GM/player must narrate a beastial complication alongside
the success.

### Bestial Failure (p. 6)
"If you fail your roll and at least one hunger die shows a '1', the Hunger
interferes with your action and the Beast manifests. You cause some kind of
problem for you (and probably the coterie)... while also failing
spectacularly." Structurally the inverse of Messy Critical: failure
condition + a specific Hunger die showing 1 → same failure outcome as a
plain failure, but with a narrated bestial complication layered on.

### Willpower (p. 6)
A separate, scarce resource: "spend a point of their character's Willpower...
to re-roll up to three non-hunger dice. Note that this may negate messy
criticals and bestial failures." This quickstart explicitly has no way to
regain Willpower mid-scenario — a hard-capped resource for the session,
notable as a design pattern (a small number of "override the dice" tokens,
not a stat you roll against).

### Rouse checks (p. 6-7)
"Hunger increases whenever a player fails a Rouse check, and decreases when
the vampire feeds. Rouse checks are made whenever the vampire uses its
Blood, and every evening when it rises from sleep. To make a Rouse check,
simply roll one die, and if isn't a success, the vampire's Hunger increases
by one." This is the mechanism that *feeds* the Hunger-dice pool over time —
a single-d10, no-pool check, structurally the simplest roll type in the
whole system (1 die, one binary outcome: Hunger +1 or not).

### Conflict/combat resolution — genuinely different shape from D&D (p. 14-15)
V5 has **no separate static defense number analogous to AC.** Every combat
action is an **opposed dice-pool roll**: "Both the attacker and defender
roll their pools simultaneously in a basic conflict. The side that scores
the most successes wins their turn of that conflict. The winner subtracts
the loser's successes from their total and applies the remainder as
damage." Worked example: Composure + Firearms vs. the target's Dexterity +
Athletics; a tie "results in both parties inflicting one point of damage on
the other." There is no attack-roll-then-separate-damage-roll split like
D&D — **margin of the single opposed roll directly becomes the damage
number** (plus a flat weapon-rating bonus, e.g. "a knife might be +1, a
rifle +3").

Turn structure is also scene-based rather than strict initiative order:
"At the start of every turn of the conflict, each player declares their
intent... Once all players have decided on their courses of action, the
Storyteller makes the same decisions for all [NPCs] and tells the troupe
which dice pools to build. The players then roll to attempt it." No
per-character initiative ranking, no action/bonus-action/reaction economy —
every participant in a scene acts on the same "turn," resolved by
simultaneous opposed rolls per pairing.

Damage has two types (Superficial vs. Aggravated, p. 15) tracked on
separate trackers, and an "Impaired" threshold state when a tracker fills —
a two-tier durability model, distinct from D&D's single hit-point pool.

---

## 3. How stat/dice resolution is architected as structured data in real engines

Two documented open-source implementations, chosen because both show the
same underlying pattern this project needs: **the roll is computed as
data first, narration/output is a separate downstream consumer of that
data — never the reverse.**

### Foundry VTT's `Roll`/`RollTerm` classes
Source: [Foundry VTT API docs — `Roll` class](https://foundryvtt.com/api/classes/foundry.dice.Roll.html),
[`RollTerm` class](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html).
A `Roll` is constructed from a formula string plus a data object for
variable substitution (e.g. `new Roll("1d20 + @strMod", {strMod: 4})`), then
parsed into an array of typed `terms` (each a `RollTerm` subclass — dice
terms, operator terms, numeric terms). Evaluating the roll is a distinct,
explicit step (`Roll#evaluate`) that populates `total` (the final number)
and `result` (the resolved arithmetic string, e.g. "16 + 4"), while the
unevaluated `formula`/`terms` stay available for inspection or re-rolling.
The class enforces immutability post-evaluation (an internal `_evaluated`
flag). **The load-bearing architectural idea:** roll *definition* (formula +
input data) and roll *result* (evaluated terms + total) are distinct,
separately-inspectable objects — exactly the "roll -> event" split this
project's resolver already names as its pattern.

### `OpenCombatEngine` — an open-source, SRD-5.1-compliant D&D combat engine
Source: [github.com/jamesplotts/opencombatengine](https://github.com/jamesplotts/opencombatengine)
(C#/.NET 8). Interface-first design: an `IDiceRoller` interface handles all
randomization (standard notation like `"1d20+5"`, plus advantage/
disadvantage), actions are modeled via a command pattern (`IAction`/
`AttackAction`), and the README documents an explicit **Result pattern**
("robust error handling without exceptions") — a roll call like
`roller.Roll("3d6+2")` returns a `Result<T>` with an `IsSuccess` flag and a
typed `Value`, not a thrown exception or a plain number. Creatures are
composed from `ICreature`/`IAbilityScores` interfaces rather than a
monolithic class. The repo's own stated design explicitly separates
deterministic, seed-reproducible roll resolution from any narrative/output
layer — output formatting is not part of the core roll/check interfaces at
all.

**The pattern both examples confirm:** neither engine lets narration or
free text touch the roll's mechanical result directly. The mechanical layer
produces a typed, inspectable data object (terms+total, or a `Result<T>`)
first; a presentation/narration layer consumes that object afterward. This
is architecturally identical to what this project's two-model split already
requires — the resolve node needs to emit exactly this kind of typed roll
result as its `GameEvent`, and the narrate node should be a pure downstream
consumer of it, never a co-author of the numbers.

---

## 4. Opposed-check patterns compared side by side

| | D&D 5e SRD | VTM V5 Quickstart |
|---|---|---|
| Normal attack | Roll (attacker) vs. **static** AC (defender rolls nothing) | Roll (attacker's pool) vs. **roll** (defender's pool) — always opposed |
| True contests | A separate, explicitly-named category (grapple, shove, or GM-improvised) — the exception | The *only* mode — there is no static-defense-number concept in this system at all |
| Success measure | Binary hit/miss (total ≥ target); damage is a **separate**, independently-rolled step | Continuous margin (winner's successes − loser's successes) **is** the damage, in the same roll |
| Tie handling | Situation stays as it was before the contest (p. 77) | Both sides take 1 damage (p. 14) — ties are not "no effect" in combat specifically |
| Turn structure | Strict initiative order, one turn per combatant, action/bonus-action/reaction budget per turn | Scene-based: all participants declare intent, GM builds NPC pools, resolution happens per-pairing without a strict per-actor turn order |

The practical implication for a schema-validated `GameEvent`: D&D's version
needs the validator to check two independent, separately-bounded numbers
(an attack-roll-vs-AC boolean, then a damage-roll magnitude) — each cheap to
sanity-check in isolation (e.g. "damage roll must be within the weapon's
declared dice range + modifier bounds"). VTM's version needs the validator
to check a *single* number (successes-margin) that is itself the output of
subtracting two independently-generated pool totals, then re-derive whether
a Messy Critical/Bestial Failure narrative tag is warranted from *which
specific dice* (not just how many) rolled what — provenance-per-die, not
just a final integer, has to survive into the JSON.

---

## Recommendations for the next `/plan-ceo-review` or `/plan-eng-review` pass

**Closing synthesis — this is the opinionated part of this research, given
everything already locked (two-model JSON-`GameEvent` architecture,
original-IP constraint, "the Craving" already named as a differentiator):**

**Recommended direction: closer to D&D's discrete d20-vs-DC model as the
base resolution primitive, with a small bolt-on for the Craving — not a
full VTM-style dice pool, and not a literal two-system hybrid running side
by side.**

Reasoning, mapped directly to what's already locked:

1. **The logic model has to emit this deterministically and get it
   validated cheaply (Decision #7).** A single d20 roll + a bounded
   modifier + a target number is two integers in, one boolean-plus-margin
   out — the validator's whole job is "does `roll + modifier >= dc` match
   the claimed `success`, and is `modifier` within the character's declared
   bounds." A dice pool needs the schema to carry an *array* of typed dice
   with per-die provenance (was this specific die a Craving-swap die?) so
   the validator can independently confirm a claimed Messy
   Critical/Bestial-Failure tag — meaningfully more surface for the logic
   model to fabricate and for the validator to have to re-derive. Given
   `GameEventSchema` today is a flat object (`state.ts`), the d20 shape is
   a smaller, more natural extension of what already exists than a pool
   shape would be.

2. **The Craving can't just be dropped, but it doesn't need a whole second
   dice-pool subsystem to survive the port.** D&D's own advantage/
   disadvantage mechanic (§1 above) is already a "roll 2d20, pick one"
   primitive — reusable almost as-is as the Craving's substrate: when the
   Craving is elevated, a tagged second d20 gets rolled alongside the
   normal one, and specific results on *that* die (not the pool-membership
   trick VTM uses) trigger a Craving-flavored critical/failure narrative
   beat, analogous to Messy Critical/Bestial Failure but expressed as "one
   extra d20 with a special result band," not "some fraction of an N-die
   pool got swapped for special dice." This keeps the whole roll model to
   *one type of check* (d20 + modifier vs. target, optionally with a second
   tagged d20) instead of two parallel resolution engines.

3. **Opposed checks (coterie vs. NPC) should follow D&D's contest shape,
   not VTM's simultaneous-pool-margin-as-damage shape.** Two independently
   bounded numbers (hit/miss, then damage) are each individually cheap to
   validate against Decision #7's "delta bounds per stat" rules-validator;
   a single subtracted-pool-margin number conflates "did it hit" and "how
   hard" into one output that's harder to bound in isolation (a huge
   damage number and "no hit at all" are both theoretically representable
   by the same kind of integer, so the validator needs more context to
   catch a fabricated one).

4. **Concrete schema-evolution suggestion** for `GameEventSchema`
   (`src/harness/state.ts`) — replace the current free `statDeltas` with
   something the resolve node's prompt can be constrained to and the
   validator can literally recompute:
   ```
   rollType: "check" | "opposedCheck" | "attack"
   attribute: string            // one of the 6, or this project's equivalent
   skillOrDiscipline: string | null
   modifier: number             // bounded server-side by the character sheet
   targetNumber: number         // DC-equivalent, or opponent's rolled total
   roll: number                 // 1-20
   cravingDie: number | null    // 1-20, only present when Craving is elevated
   success: boolean             // recomputable: roll+modifier >= targetNumber
   criticalTier: "none" | "critical" | "cravingCritical" | "cravingFailure"
   statDeltas: Record<string, number>
   ```
   Every field except `statDeltas` itself is either an input the validator
   already has bounds for (character sheet) or a value the validator can
   independently recompute and reject on mismatch — closing exactly the
   "schema-valid but not rules-legal" gap Decision #7 already names as
   open.

5. **Explicitly do NOT adopt D&D's initiative/turn/action-bonus-action-
   reaction economy for v1.** That machinery assumes a multi-round tactical
   combat UI tracking several actors' turn order simultaneously — nothing
   in the current `V1 Launch Scope` or `src/harness/graph.ts` (one
   `resolve` call per single player action, no round tracker) calls for
   that yet. VTM's simpler "one beat, one resolution" scene model is
   actually the closer fit to the *existing* graph shape (`resolve` ->
   `narrate` -> `artTrigger` per player action) than D&D's turn-order
   engine is — take VTM's pacing model even while taking D&D's roll math.
   Flag initiative/action-economy as a distinct, larger follow-up scope
   item only if/when true multi-round tactical combat becomes an actual
   Launch Scope line item — it isn't one today.

6. **Worth a follow-up before implementation, not resolved here:** the
   exact numeric ranges for this project's own attribute/skill scale (5e's
   1-20 ability scores + proficiency-bonus-by-level table vs. inventing a
   smaller original scale) is a design-balance question this research
   didn't attempt to answer — flagging it as open rather than guessing a
   specific number range that wasn't asked for.
