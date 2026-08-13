import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clampAttributeModifier,
  modifierFor,
  SAMPLE_CHARACTERS,
} from "../character.js";
import {
  rollD20,
  resolveCheck,
  rejectedEvent,
  computeCriticalTier,
  generateConsequences,
} from "../rules.js";
import { LogicIntentSchema } from "../state.js";

// generateConsequences: the player-visible consequence strings. Every branch
// asserted directly — resolveCheck rolls a real d20, so the criticalTier arms
// are unreachable deterministically through the public path.

test("generateConsequences: critical success reports a critical", () => {
  assert.deepEqual(generateConsequences({}, true, "critical", "check"), [
    "Critical success!",
  ]);
});

test("generateConsequences: cravingCritical and cravingFailure each get their own line", () => {
  assert.deepEqual(generateConsequences({}, true, "cravingCritical", "check"), [
    "Extraordinary success through Craving!",
  ]);
  assert.deepEqual(generateConsequences({}, false, "cravingFailure", "check"), [
    "Catastrophic failure!",
  ]);
});

test("generateConsequences: a lost opposedCheck falters, a lost plain check says nothing", () => {
  assert.deepEqual(generateConsequences({}, false, "none", "opposedCheck"), [
    "The attempt falters.",
  ]);
  assert.deepEqual(generateConsequences({}, false, "none", "check"), []);
});

test("generateConsequences: a won opposedCheck does not falter", () => {
  assert.deepEqual(generateConsequences({}, true, "none", "opposedCheck"), []);
});

// "attack" resolves through the same contested-roll path as "opposedCheck"
// now (D-1, 2026-08-13), so it falters the same way on a loss.
test("generateConsequences: a lost attack falters too", () => {
  assert.deepEqual(generateConsequences({}, false, "none", "attack"), [
    "The attempt falters.",
  ]);
});

test("generateConsequences: craving, self damage and target damage each report", () => {
  assert.deepEqual(
    generateConsequences({ craving: 1, hp: -3, targetHp: -5 }, true, "none", "attack"),
    ["Craving increased.", "Took 3 damage.", "Target took 5 damage."],
  );
});

test("generateConsequences: healing is never reported as damage", () => {
  // Only negative deltas are damage. A positive hp/targetHp delta must not
  // produce a "Took -N damage" line.
  assert.deepEqual(generateConsequences({ hp: 4, targetHp: 2 }, true, "none", "check"), []);
});

test("generateConsequences: no deltas and no critical yields no consequences, never null", () => {
  const result = generateConsequences({}, true, "none", "check");
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 0);
});

test("generateConsequences: a critical stacks with its stat deltas, critical line first", () => {
  assert.deepEqual(
    generateConsequences({ hp: -2 }, true, "critical", "attack"),
    ["Critical success!", "Took 2 damage."],
  );
});

test("clampAttributeModifier bounds to -5..+10", () => {
  assert.equal(clampAttributeModifier(99), 10);
  assert.equal(clampAttributeModifier(-99), -5);
  assert.equal(clampAttributeModifier(3), 3);
});

test("modifierFor: attribute only, no skill", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  assert.equal(modifierFor(mira, "charisma", null), 4);
});

test("modifierFor: proficient skill adds proficiency bonus", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  // charisma +4, persuasion proficient, proficiencyBonus 2
  assert.equal(modifierFor(mira, "charisma", "persuasion"), 6);
});

test("modifierFor: non-proficient skill grants no bonus", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  // strength +1, athletics NOT proficient for Mira
  assert.equal(modifierFor(mira, "strength", "athletics"), 1);
});

test("modifierFor: skill/attribute mismatch falls back to attribute only", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  // "persuasion" is a charisma skill, asking for it under "strength" should
  // not grant the bonus (server never trusts the LLM's attribute/skill
  // pairing blindly)
  assert.equal(modifierFor(mira, "strength", "persuasion"), 1);
});

test("rollD20 always returns 1-20", () => {
  for (let i = 0; i < 200; i++) {
    const roll = rollD20();
    assert.ok(roll >= 1 && roll <= 20, `roll ${roll} out of range`);
  }
});

test("computeCriticalTier: natural 20 (no Craving) -> critical", () => {
  assert.equal(computeCriticalTier(20, null, true), "critical");
});

test("computeCriticalTier: natural 20 via Craving die -> cravingCritical", () => {
  assert.equal(computeCriticalTier(20, 20, true), "cravingCritical");
});

test("computeCriticalTier: failure with Craving die at 1 -> cravingFailure", () => {
  assert.equal(computeCriticalTier(8, 1, false), "cravingFailure");
});

test("computeCriticalTier: plain failure -> none", () => {
  assert.equal(computeCriticalTier(8, null, false), "none");
});

test("computeCriticalTier: success on a Craving die of 1 is not a cravingFailure", () => {
  // The Craving die showing 1 only matters on a FAILED check (mirrors VTM's
  // Bestial Failure precondition), not a successful one.
  assert.equal(computeCriticalTier(15, 1, true), "none");
});

test("resolveCheck: modifier is the real character-sheet value, never LLM-supplied", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  const intent = LogicIntentSchema.parse({
    eventType: "social",
    archetype: "guard-persuasion",
    summary: "tries to talk her way past the guard",
    rollType: "check",
    attribute: "charisma",
    skill: "persuasion",
    targetNumber: 15,
    opponentTier: null,
    cravingElevated: false,
    npcSignal: null,
  });
  const event = resolveCheck(mira, intent);
  assert.equal(event.modifier, 6); // charisma +4, persuasion proficient +2
  assert.equal(event.cravingDie, null);
  assert.equal(
    event.success,
    event.roll + event.modifier >= event.targetNumber!,
  ); // recomputable, per Decision #7
});

test("resolveCheck: out-of-range targetNumber gets clamped to 5-30", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  const intent = LogicIntentSchema.parse({
    eventType: "social",
    archetype: "impossible-task",
    summary: "attempts something absurd",
    rollType: "check",
    attribute: "charisma",
    skill: null,
    targetNumber: 40,
    opponentTier: null,
    cravingElevated: false,
    npcSignal: null,
  });
  const event = resolveCheck(mira, intent);
  assert.equal(event.targetNumber, 30);
});

test("resolveCheck: cravingElevated rolls a second die and costs 1 Craving", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  const intent = LogicIntentSchema.parse({
    eventType: "social",
    archetype: "desperate-plea",
    summary: "pushes the Craving to force compliance",
    rollType: "check",
    attribute: "charisma",
    skill: "persuasion",
    targetNumber: 15,
    opponentTier: null,
    cravingElevated: true,
    npcSignal: null,
  });
  const event = resolveCheck(mira, intent);
  assert.ok(event.cravingDie !== null && event.cravingDie >= 1 && event.cravingDie <= 20);
  assert.equal(event.statDeltas.craving, 1);
});

// "attack" is routed through the same contested-roll resolution as
// "opposedCheck" (D-1, 2026-08-13) instead of a fixed DC — see rules.ts.
test("resolveCheck: attack has null targetNumber, rolls a contested opponent d20", () => {
  const toren = SAMPLE_CHARACTERS["toren-vale"];
  const intent = LogicIntentSchema.parse({
    eventType: "combat",
    archetype: "cornered-wretch",
    summary: "swings a blade at the wretch",
    rollType: "attack",
    attribute: "strength",
    skill: "athletics",
    targetNumber: null,
    opponentTier: "trivial", // +0, easiest opponent — success on almost any roll
    cravingElevated: false,
    npcSignal: null,
  });
  let sawSuccess = false;
  for (let i = 0; i < 30; i++) {
    const event = resolveCheck(toren, intent);
    assert.equal(event.targetNumber, null);
    assert.equal(event.opponentTier, "trivial");
    if (event.success) {
      sawSuccess = true;
      assert.ok(event.statDeltas.targetHp! < 0);
    }
  }
  assert.ok(sawSuccess, "expected at least one success across 30 trials");
});

// The audit's headline finding: a failed attack cost the player nothing on
// the common path, making permadeath mechanically unreachable. This is the
// regression test for the D-1 fix.
test("resolveCheck: failed combat attack costs the actor HP", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"]; // strength +1, no proficiency
  const intent = LogicIntentSchema.parse({
    eventType: "combat",
    archetype: "hulking-brute",
    summary: "swings wildly at the brute",
    rollType: "attack",
    attribute: "strength",
    skill: null,
    targetNumber: null,
    opponentTier: "deadly", // +9, hardest tier — failure is the common outcome
    cravingElevated: false,
    npcSignal: null,
  });
  let sawFailure = false;
  for (let i = 0; i < 30; i++) {
    const event = resolveCheck(mira, intent);
    if (!event.success) {
      sawFailure = true;
      assert.ok(event.statDeltas.hp! < 0, "a failed combat attack must cost HP");
    } else {
      assert.equal(event.statDeltas.hp, undefined);
    }
  }
  assert.ok(sawFailure, "expected at least one failure across 30 trials");
});

test("resolveCheck: opposedCheck has null targetNumber, rolls an opponent d20", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  const intent = LogicIntentSchema.parse({
    eventType: "social",
    archetype: "guard-standoff",
    summary: "tries to stare down the guard",
    rollType: "opposedCheck",
    attribute: "charisma",
    skill: "persuasion",
    targetNumber: null,
    opponentTier: "moderate",
    cravingElevated: false,
    npcSignal: null,
  });
  const event = resolveCheck(mira, intent);
  assert.equal(event.targetNumber, null);
  assert.ok(event.opponentRoll !== null && event.opponentRoll >= 1 && event.opponentRoll <= 20);
  assert.equal(event.opponentTier, "moderate");
  // recomputable independent of the LLM, per Decision #7
  const playerTotal = event.roll + event.modifier;
  const opponentTotal = event.opponentRoll! + 4; // moderate = +4
  assert.equal(event.success, playerTotal > opponentTotal);
});

test("resolveCheck: opposedCheck falls back to moderate tier when opponentTier is null", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  const intent = LogicIntentSchema.parse({
    eventType: "social",
    archetype: "guard-standoff",
    summary: "tries to stare down the guard",
    rollType: "opposedCheck",
    attribute: "charisma",
    skill: "persuasion",
    targetNumber: null,
    opponentTier: null,
    cravingElevated: false,
    npcSignal: null,
  });
  const event = resolveCheck(mira, intent);
  assert.equal(event.opponentTier, "moderate");
});

test("resolveCheck: opposedCheck tie is a non-success with no statDeltas, not a loss", () => {
  // Deterministic tie: trivial tier (+0 modifier) vs a character with 0
  // attribute modifier and no skill — force it by checking many trials
  // for the specific tie case (playerTotal === opponentTotal).
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  const intent = LogicIntentSchema.parse({
    eventType: "social",
    archetype: "guard-standoff",
    summary: "tries to stare down the guard",
    rollType: "opposedCheck",
    attribute: "intelligence", // Mira's intelligence modifier is 0
    skill: null,
    targetNumber: null,
    opponentTier: "trivial", // +0 modifier
    cravingElevated: false,
    npcSignal: null,
  });
  // With both modifiers at 0, playerTotal === opponentTotal exactly when
  // both d20s land the same — run enough trials to hit it at least once.
  let sawTie = false;
  for (let i = 0; i < 500 && !sawTie; i++) {
    const event = resolveCheck(mira, intent);
    if (event.roll === event.opponentRoll) {
      sawTie = true;
      assert.equal(event.success, false);
      assert.deepEqual(event.statDeltas, {});
    }
  }
  assert.ok(sawTie, "expected at least one tie in 500 trials");
});

test("resolveCheck: opposedCheck Craving only ever affects the player's roll", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  const intent = LogicIntentSchema.parse({
    eventType: "social",
    archetype: "guard-standoff",
    summary: "pushes the Craving during a standoff",
    rollType: "opposedCheck",
    attribute: "charisma",
    skill: "persuasion",
    targetNumber: null,
    opponentTier: "moderate",
    cravingElevated: true,
    npcSignal: null,
  });
  const event = resolveCheck(mira, intent);
  assert.ok(event.cravingDie !== null); // player's side got a second die
  assert.equal(event.statDeltas.craving, 1);
  // opponentRoll is a single plain d20 — no craving mechanic on that side,
  // nothing in resolveCheck ever rolls a second die for the opponent.
  assert.ok(event.opponentRoll! >= 1 && event.opponentRoll! <= 20);
});

// M2.6 (2026-08-13): rejectedEvent()'s `rejected: true` is what lets
// downstream code (narrate node, graph.service.ts) tell "the mutation was
// illegal and never happened" apart from "the character failed the check"
// — both used to look identical (success:false + flavor narration reported
// as a completed turn).
test("rejectedEvent: marks rejected true, clears stat deltas and npcSignal", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  const intent = LogicIntentSchema.parse({
    eventType: "combat",
    archetype: "cornered-wretch",
    summary: "swings a blade at the wretch",
    rollType: "attack",
    attribute: "strength",
    skill: null,
    targetNumber: null,
    opponentTier: "trivial",
    cravingElevated: false,
    npcSignal: { name: "The Wretch", fact: "cornered in the alley" },
  });
  const resolved = resolveCheck(mira, intent);
  const rejected = rejectedEvent("target has met Final Death", resolved);

  assert.equal(rejected.rejected, true);
  assert.equal(rejected.success, false);
  assert.equal(rejected.criticalTier, "none");
  assert.deepEqual(rejected.statDeltas, {});
  assert.equal(rejected.npcSignal, null);
  assert.deepEqual(rejected.consequences, ["Attempt rejected: target has met Final Death"]);
  // The roll itself is kept for transparency/debugging, not erased.
  assert.equal(rejected.roll, resolved.roll);
});
