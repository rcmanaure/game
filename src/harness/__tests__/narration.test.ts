import { test } from "node:test";
import assert from "node:assert/strict";
import { isRefusal, deterministicNarration, narrateWithFallback } from "../narration.js";
import type { ResolvedEvent } from "../state.js";

// T2 verify criterion: "forced-refusal test case resolves to a non-empty
// narration, never a silent no-op." Covers detection (isRefusal) and the
// retry-then-template chain (narrateWithFallback) without any live API call.

function makeEvent(overrides: Partial<ResolvedEvent> = {}): ResolvedEvent {
  return {
    rollType: "attack",
    attribute: "strength",
    skillOrDiscipline: null,
    modifier: 1,
    targetNumber: 15,
    roll: 12,
    cravingDie: null,
    opponentTier: null,
    opponentRoll: null,
    success: true,
    criticalTier: "none",
    statDeltas: {},
    consequences: [],
    npcSignal: null,
    rejected: false,
    archetype: "test-scene",
    summary: "the wretch lunges and is repelled",
    ...overrides,
  };
}

test("isRefusal: finish_reason content_filter is always a refusal", () => {
  assert.equal(
    isRefusal({ content: "some narration text here", response_metadata: { finish_reason: "content_filter" } }),
    true,
  );
});

test("isRefusal: empty content is a refusal (soft-refusal / free-tier empty-response quirk)", () => {
  assert.equal(isRefusal({ content: "" }), true);
  assert.equal(isRefusal({ content: "   " }), true);
});

test("isRefusal: a refusal-phrase response is detected without a finish_reason signal", () => {
  assert.equal(isRefusal({ content: "I cannot narrate this violent scene." }), true);
  assert.equal(isRefusal({ content: "I'm not able to help with that request." }), true);
});

test("isRefusal: normal narration text is not a refusal", () => {
  assert.equal(
    isRefusal({ content: "The blade finds its mark and the beast staggers back." }),
    false,
  );
});

test("deterministicNarration: never empty, reflects success/failure", () => {
  const success = deterministicNarration(makeEvent({ success: true }));
  const failure = deterministicNarration(makeEvent({ success: false, criticalTier: "none" }));
  assert.ok(success.length > 0);
  assert.ok(failure.length > 0);
  assert.match(success, /succeeds/);
  assert.match(failure, /fails/);
});

test("narrateWithFallback: primary success is used directly, alt never called", () => {
  let altCalled = false;
  const result = narrateWithFallback({
    event: makeEvent(),
    invokePrimary: async () => ({ content: "A clean narration from the primary model." }),
    invokeAlt: async () => {
      altCalled = true;
      return { content: "should not be reached" };
    },
  });
  return result.then((narration) => {
    assert.equal(narration, "A clean narration from the primary model.");
    assert.equal(altCalled, false);
  });
});

test("narrateWithFallback: primary refuses, alt succeeds -> uses alt narration", async () => {
  const narration = await narrateWithFallback({
    event: makeEvent(),
    invokePrimary: async () => ({ content: "I cannot narrate this." }),
    invokeAlt: async () => ({ content: "The alt model narrates the beat instead." }),
  });
  assert.equal(narration, "The alt model narrates the beat instead.");
});

test("narrateWithFallback: primary and alt both refuse -> deterministic template, never empty", async () => {
  const event = makeEvent({ success: false, criticalTier: "none" });
  const narration = await narrateWithFallback({
    event,
    invokePrimary: async () => ({ content: "" }),
    invokeAlt: async () => ({ response_metadata: { finish_reason: "content_filter" }, content: "" }),
  });
  assert.ok(narration.length > 0);
  assert.equal(narration, deterministicNarration(event));
});

// CEO Review Hardening (2026-08-06) added try/catch around both invokes. A
// thrown LLM error (network, 429, timeout) must fall through the same chain as
// a refusal, not propagate and kill the turn.
test("narrateWithFallback: primary throws -> alt still runs and its narration is used", async () => {
  const narration = await narrateWithFallback({
    event: makeEvent(),
    invokePrimary: async () => {
      throw new Error("429 rate limited");
    },
    invokeAlt: async () => ({ content: "The alt model carries the beat after the primary died." }),
  });
  assert.equal(narration, "The alt model carries the beat after the primary died.");
});

test("narrateWithFallback: primary and alt both throw -> deterministic template, never throws", async () => {
  const event = makeEvent({ success: false, criticalTier: "none" });
  const narration = await narrateWithFallback({
    event,
    invokePrimary: async () => {
      throw new Error("ECONNRESET");
    },
    invokeAlt: async () => {
      throw new Error("upstream 503");
    },
  });
  assert.ok(narration.length > 0);
  assert.equal(narration, deterministicNarration(event));
});
