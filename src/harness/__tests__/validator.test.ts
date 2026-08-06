import { test } from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_CHARACTERS, type Character } from "../character.js";
import { validateTransition, applyMutation } from "../validator.js";
import type { ResolvedEvent } from "../state.js";

// T1 verify criterion: "unit test rejects an out-of-bounds/illegal mutation;
// accepts a legal one." Battle-logic (rolls, modifiers) is rules.test.ts's
// job — this file only covers the state-transition legality validator.ts
// exists to gate (Decision #5's Active -> Torpor -> Dead lifecycle).

function makeEvent(hpDelta: number): ResolvedEvent {
  return {
    rollType: "attack",
    attribute: "strength",
    skillOrDiscipline: null,
    modifier: 0,
    targetNumber: 10,
    roll: 10,
    cravingDie: null,
    opponentTier: null,
    opponentRoll: null,
    success: true,
    criticalTier: "none",
    statDeltas: hpDelta === 0 ? {} : { hp: hpDelta },
    archetype: "test-scene",
    summary: "test event",
  };
}

test("validateTransition: legal hp loss on an active character stays active above 0", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"]; // 12/12 hp
  const result = validateTransition(mira, -5);
  assert.deepEqual(result, { legal: true, resultingHp: 7, resultingStatus: "active" });
});

test("validateTransition: hp bottoming out on an active character transitions to torpor", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"]; // 12/12 hp
  const result = validateTransition(mira, -20);
  assert.deepEqual(result, { legal: true, resultingHp: 0, resultingStatus: "torpor" });
});

test("validateTransition: hp bottoming out again in torpor transitions to dead (Final Death)", () => {
  const torporMira: Character = { ...SAMPLE_CHARACTERS["mira-ashgrave"], hp: 0, status: "torpor" };
  const result = validateTransition(torporMira, -1);
  assert.deepEqual(result, { legal: true, resultingHp: 0, resultingStatus: "dead" });
});

test("validateTransition: any mutation against an already-dead character is illegal", () => {
  const deadMira: Character = { ...SAMPLE_CHARACTERS["mira-ashgrave"], hp: 0, status: "dead" };
  const result = validateTransition(deadMira, -1);
  assert.equal(result.legal, false);
});

test("applyMutation: legal hp-reducing event returns a new, mutated character", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  const result = applyMutation(mira, makeEvent(-5));
  assert.equal(result.rejected, false);
  assert.equal(result.character.hp, 7);
  assert.equal(result.character.status, "active");
  assert.notEqual(result.character, mira); // never mutates the input
});

test("applyMutation: rejects an hp mutation targeting an already-dead character (safe no-op)", () => {
  const deadMira: Character = { ...SAMPLE_CHARACTERS["mira-ashgrave"], hp: 0, status: "dead" };
  const result = applyMutation(deadMira, makeEvent(-5));
  assert.equal(result.rejected, true);
  assert.equal(result.character, deadMira); // unchanged, safe no-op
});

test("applyMutation: rejects a zero-hp-delta event against a dead character too", () => {
  const deadMira: Character = { ...SAMPLE_CHARACTERS["mira-ashgrave"], hp: 0, status: "dead" };
  const result = applyMutation(deadMira, makeEvent(0));
  assert.equal(result.rejected, true);
});

test("applyMutation: a zero-hp-delta event against a living character is a no-op, not rejected", () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  const result = applyMutation(mira, makeEvent(0));
  assert.equal(result.rejected, false);
  assert.equal(result.character, mira);
});
