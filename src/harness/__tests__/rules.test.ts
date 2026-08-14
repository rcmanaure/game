import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clampAttributeModifier,
  modifierFor,
  SAMPLE_CHARACTERS,
} from "../character.js";
import { rollD20, resolveCheck, computeCriticalTier, rejectedEvent, buildResolvePrompt } from "../rules.js";
import { LogicIntentSchema } from "../validator.js";

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

test("buildResolvePrompt: names the character and the action, without an adapter or a graph State", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  const prompt = buildResolvePrompt(mira, "search the crypt for exits");
  assert.match(prompt, /Mira Ashgrave/);
  assert.match(prompt, /search the crypt for exits/);
  assert.match(prompt, /opposedCheck/);
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
  });
  const event = resolveCheck(mira, intent);
  assert.ok(event.cravingDie !== null && event.cravingDie >= 1 && event.cravingDie <= 20);
  assert.equal(event.statDeltas.craving, 1);
});

test("resolveCheck: successful attack has no statDeltas — no opponent entity exists to damage (Decision #25)", () => {
  const toren = SAMPLE_CHARACTERS["toren-vale"];
  // Force a guaranteed success: strength +4, huge modifier vs trivial DC.
  const intent = LogicIntentSchema.parse({
    eventType: "combat",
    archetype: "cornered-wretch",
    summary: "swings a blade at the wretch",
    rollType: "attack",
    attribute: "strength",
    skill: "athletics",
    targetNumber: 5, // minimum legal DC, near-guaranteed hit with +6 modifier
    opponentTier: null,
    cravingElevated: false,
  });
  // Run several times since the roll is random — DC 5 with modifier 6 only
  // fails on a natural 1 (1+6=7 >= 5 is still a hit) so this should always
  // succeed; assert deterministically over a few trials to be safe.
  for (let i = 0; i < 5; i++) {
    const event = resolveCheck(toren, intent);
    assert.equal(event.success, true);
    assert.deepEqual(event.statDeltas, {});
  }
});

test("rejectedEvent: keeps summary as the attempt description, moves the reason to rejectionReason", () => {
  const resolved = resolveCheck(SAMPLE_CHARACTERS["mira-ashgrave"], {
    eventType: "combat",
    archetype: "test-scene",
    summary: "drinks from the stranger's throat",
    rollType: "attack",
    attribute: "strength",
    skill: null,
    targetNumber: 10,
    opponentTier: null,
    cravingElevated: false,
  });
  const rejected = rejectedEvent("Mira Ashgrave has met Final Death — no further mutation is legal", resolved);
  assert.equal(rejected.summary, "drinks from the stranger's throat");
  assert.equal(rejected.rejectionReason, "Mira Ashgrave has met Final Death — no further mutation is legal");
  assert.equal(rejected.success, false);
  assert.deepEqual(rejected.statDeltas, {});
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
  });
  const event = resolveCheck(mira, intent);
  assert.ok(event.cravingDie !== null); // player's side got a second die
  assert.equal(event.statDeltas.craving, 1);
  // opponentRoll is a single plain d20 — no craving mechanic on that side,
  // nothing in resolveCheck ever rolls a second die for the opponent.
  assert.ok(event.opponentRoll! >= 1 && event.opponentRoll! <= 20);
});
