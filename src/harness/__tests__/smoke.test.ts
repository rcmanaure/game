import { test } from "node:test";
import assert from "node:assert/strict";
import { LogicIntentSchema, HarnessStateSchema } from "../state.js";
import { STYLE_FORMULA, STYLE_TOKEN } from "../style-formula.js";

// Assert-based smoke tests only — no live API calls (those cost money and
// need OPENROUTER_API_KEY; narration/art quality is eyeballed manually via
// `npm run harness`, per T22's actual verify criteria). Battle-logic
// correctness (rolls, modifiers, critical tiers) is covered in rules.test.ts.

const VALID_INTENT = {
  eventType: "combat" as const,
  archetype: "cornered-wretch",
  summary: "the wretch lunges and is repelled",
  rollType: "attack" as const,
  attribute: "strength" as const,
  skill: null,
  targetNumber: 15,
  cravingElevated: false,
};

test("LogicIntentSchema accepts a well-formed intent", () => {
  const intent = LogicIntentSchema.parse(VALID_INTENT);
  assert.equal(intent.eventType, "combat");
});

test("LogicIntentSchema rejects an illegal eventType", () => {
  assert.throws(() =>
    LogicIntentSchema.parse({ ...VALID_INTENT, eventType: "not-a-real-type" }),
  );
});

test("LogicIntentSchema rejects an illegal attribute", () => {
  assert.throws(() =>
    LogicIntentSchema.parse({ ...VALID_INTENT, attribute: "luck" }),
  );
});

test("LogicIntentSchema rejects a missing archetype", () => {
  assert.throws(() =>
    LogicIntentSchema.parse({ ...VALID_INTENT, archetype: undefined }),
  );
});

test("HarnessStateSchema defaults gameEvent/narration/art fields to null", () => {
  const state = HarnessStateSchema.parse({
    playerAction: "look around",
    characterId: "mira-ashgrave",
  });
  assert.equal(state.gameEvent, null);
  assert.equal(state.narration, null);
  assert.equal(state.artUrl, null);
});

test("STYLE_FORMULA and STYLE_TOKEN are non-empty and distinct", () => {
  assert.ok(STYLE_FORMULA.length > 100);
  assert.ok(STYLE_TOKEN.length > 0);
  assert.ok(STYLE_TOKEN.length < STYLE_FORMULA.length);
});
