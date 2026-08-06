import { test } from "node:test";
import assert from "node:assert/strict";
import { LogicIntentSchema, HarnessStateSchema, sanitizeIntent } from "../state.js";
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
  opponentTier: null,
  cravingElevated: false,
};

test("LogicIntentSchema accepts a well-formed intent", () => {
  const intent = LogicIntentSchema.parse(VALID_INTENT);
  assert.equal(intent.eventType, "combat");
});

test("LogicIntentSchema accepts an opposedCheck intent with opponentTier, null targetNumber", () => {
  const intent = LogicIntentSchema.parse({
    ...VALID_INTENT,
    rollType: "opposedCheck",
    targetNumber: null,
    opponentTier: "dangerous",
  });
  assert.equal(intent.opponentTier, "dangerous");
});

test("LogicIntentSchema rejects an illegal opponentTier", () => {
  assert.throws(() =>
    LogicIntentSchema.parse({ ...VALID_INTENT, opponentTier: "impossible" }),
  );
});

test("sanitizeIntent coerces Python-style \"None\" string to real null", () => {
  // Observed live (2026-08-05): a free-tier model emitted the string
  // "None" instead of JSON null for targetNumber on an opposedCheck,
  // failing withStructuredOutput's strict schema 3/3 times. This is the
  // fix — the raw (loose) schema accepts it, sanitizeIntent coerces it.
  const intent = sanitizeIntent({
    ...VALID_INTENT,
    rollType: "opposedCheck",
    targetNumber: "None",
    opponentTier: "dangerous",
  });
  assert.equal(intent.targetNumber, null);
});

test("sanitizeIntent coerces \"null\"/\"N/A\" strings too, case-insensitively", () => {
  const a = sanitizeIntent({ ...VALID_INTENT, targetNumber: "null" });
  const b = sanitizeIntent({ ...VALID_INTENT, targetNumber: "N/A" });
  const c = sanitizeIntent({ ...VALID_INTENT, skill: "NONE" });
  assert.equal(a.targetNumber, null);
  assert.equal(b.targetNumber, null);
  assert.equal(c.skill, null);
});

test("sanitizeIntent still rejects genuinely invalid values after coercion", () => {
  assert.throws(() =>
    sanitizeIntent({ ...VALID_INTENT, opponentTier: "not-a-real-tier" }),
  );
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
