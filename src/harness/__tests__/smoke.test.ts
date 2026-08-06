import { test } from "node:test";
import assert from "node:assert/strict";
import { GameEventSchema, HarnessStateSchema } from "../state.js";
import { STYLE_FORMULA, STYLE_TOKEN } from "../style-formula.js";

// Assert-based smoke tests only — no live API calls (those cost money and
// need OPENROUTER_API_KEY; narration/art quality is eyeballed manually via
// `npm run harness`, per T22's actual verify criteria).

test("GameEventSchema accepts a well-formed event", () => {
  const event = GameEventSchema.parse({
    eventType: "combat",
    archetype: "cornered-wretch",
    summary: "the wretch lunges and is repelled",
  });
  assert.equal(event.eventType, "combat");
});

test("GameEventSchema rejects an illegal eventType", () => {
  assert.throws(() =>
    GameEventSchema.parse({
      eventType: "not-a-real-type",
      archetype: "x",
      summary: "y",
    }),
  );
});

test("GameEventSchema rejects a missing archetype", () => {
  assert.throws(() =>
    GameEventSchema.parse({ eventType: "combat", summary: "y" }),
  );
});

test("HarnessStateSchema defaults gameEvent/narration/art fields to null", () => {
  const state = HarnessStateSchema.parse({ playerAction: "look around" });
  assert.equal(state.gameEvent, null);
  assert.equal(state.narration, null);
  assert.equal(state.artUrl, null);
});

test("STYLE_FORMULA and STYLE_TOKEN are non-empty and distinct", () => {
  assert.ok(STYLE_FORMULA.length > 100);
  assert.ok(STYLE_TOKEN.length > 0);
  assert.ok(STYLE_TOKEN.length < STYLE_FORMULA.length);
});
