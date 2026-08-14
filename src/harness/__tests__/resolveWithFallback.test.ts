import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveWithFallback } from "../rules.js";
import { SAMPLE_CHARACTERS } from "../character.js";
import { SAFE_DEFAULT_INTENT } from "../state.js";

const MOCK_ADAPTER = {
  getModel: () => ({
    invoke: async (prompt: string) => ({
      eventType: "combat",
      archetype: "test",
      summary: "test attack",
      rollType: "attack",
      attribute: "strength",
      skill: null,
      targetNumber: 15,
      opponentTier: null,
      cravingElevated: false,
    }),
    withStructuredOutput: (schema: any) => ({
      invoke: async (prompt: string) => ({
        eventType: "combat",
        archetype: "test",
        summary: "test attack",
        rollType: "attack",
        attribute: "strength",
        skill: null,
        targetNumber: 15,
        opponentTier: null,
        cravingElevated: false,
      }),
    }),
  }),
};

test("resolveWithFallback returns intent and wasFallback=false on success", async () => {
  const character = SAMPLE_CHARACTERS["mira-ashgrave"];
  const prompt = "Test prompt";

  const { intent, wasFallback } = await resolveWithFallback(
    MOCK_ADAPTER as any,
    prompt
  );

  assert.equal(intent.eventType, "combat");
  assert.equal(wasFallback, false);
});

test("resolveWithFallback returns SAFE_DEFAULT_INTENT and wasFallback=true on parse failure", async () => {
  const failingAdapter = {
    getModel: () => ({
      withStructuredOutput: () => ({
        invoke: async (prompt: string) => {
          throw new Error("Parse failed");
        },
      }),
    }),
  };

  const character = SAMPLE_CHARACTERS["mira-ashgrave"];
  const prompt = "Test prompt";

  const { intent, wasFallback } = await resolveWithFallback(
    failingAdapter as any,
    prompt
  );

  assert.equal(intent.eventType, SAFE_DEFAULT_INTENT.eventType);
  assert.equal(intent.archetype, SAFE_DEFAULT_INTENT.archetype);
  assert.equal(wasFallback, true);
});

test("resolveWithFallback returns SAFE_DEFAULT_INTENT and wasFallback=true on retry failure", async () => {
  let callCount = 0;
  const alwaysFailAdapter = {
    getModel: () => ({
      withStructuredOutput: () => ({
        invoke: async (prompt: string) => {
          callCount++;
          throw new Error(`Failure ${callCount}`);
        },
      }),
    }),
  };

  const character = SAMPLE_CHARACTERS["mira-ashgrave"];
  const prompt = "Test prompt";

  const { intent, wasFallback } = await resolveWithFallback(
    alwaysFailAdapter as any,
    prompt
  );

  // Should have tried twice (initial + retry)
  assert.equal(callCount, 2);
  assert.equal(intent.eventType, SAFE_DEFAULT_INTENT.eventType);
  assert.equal(wasFallback, true);
});

test("resolveWithFallback detects semantic incompleteness (missing targetNumber on check)", async () => {
  const incompleteAdapter = {
    getModel: () => ({
      withStructuredOutput: () => ({
        invoke: async (prompt: string) => ({
          eventType: "combat",
          archetype: "test",
          summary: "test check",
          rollType: "check", // needs targetNumber
          attribute: "strength",
          skill: null,
          targetNumber: null, // missing
          opponentTier: null,
          cravingElevated: false,
        }),
      }),
    }),
  };

  const character = SAMPLE_CHARACTERS["mira-ashgrave"];
  const prompt = "Test prompt";

  const { intent, wasFallback } = await resolveWithFallback(
    incompleteAdapter as any,
    prompt
  );

  // Should use safe default, mark as fallback
  assert.equal(intent.eventType, SAFE_DEFAULT_INTENT.eventType);
  assert.equal(wasFallback, true);
});
