import { test } from "node:test";
import assert from "node:assert/strict";
import { HarnessGraphService } from "./harness-graph.service";
import { createHarnessGraph } from "../../harness/graph";
import { ArtService } from "../../harness/art-service";
import { SAMPLE_CHARACTERS } from "../../harness/character";
import type { PromptAdapter, NarrationAdapter, RetryPolicy } from "../../harness/adapters";

// Proves the backend<->graph wiring (character/action in, shaped output out)
// with stub collaborators — no live OpenRouter calls, no jest. Battle-logic
// and prompt-building correctness are covered where they're computed
// (rules.test.ts, narration.test.ts); this file only covers the seam
// createHarnessGraph/HarnessGraphService expose to the rest of the backend.

function stubChatModel(response: unknown) {
  // Duck-types just what resolveWithFallback/narrateWithFallback actually
  // call on a ChatOpenRouter instance — a real one would cost money to
  // construct correctly here, and nothing else in this file's path
  // touches it.
  return {
    invoke: async () => response,
    withStructuredOutput: () => ({ invoke: async () => response }),
  } as unknown as ReturnType<PromptAdapter["getModel"]>;
}

class StubLogicAdapter implements PromptAdapter {
  constructor(private readonly intent: unknown) {}
  getModel() {
    return stubChatModel(this.intent);
  }
  getRetryPolicy(): RetryPolicy {
    return { budget: 1, strategy: "parse-error" };
  }
}

class StubNarrationAdapter implements NarrationAdapter {
  constructor(private readonly narration: string) {}
  getModel() {
    return stubChatModel({ content: this.narration });
  }
  getAltModel() {
    return this.getModel();
  }
  getRetryPolicy(): RetryPolicy {
    return { budget: 1, strategy: "content-refusal" };
  }
}

const CHECK_INTENT = {
  eventType: "social" as const,
  archetype: "test-scene",
  summary: "tries to read the room",
  rollType: "check" as const,
  attribute: "wisdom" as const,
  skill: null,
  targetNumber: 10,
  opponentTier: null,
  cravingElevated: false,
};

test("HarnessGraphService.playTurn wires character/action through the graph and shapes the output", async () => {
  const graph = createHarnessGraph({
    logic: new StubLogicAdapter(CHECK_INTENT),
    creative: new StubNarrationAdapter("The room falls quiet as you take its measure."),
    art: new ArtService(async () => ({ url: "https://example.com/art.jpg" })),
  });
  const service = new HarnessGraphService(graph);
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];

  const result = await service.playTurn(mira, "read the room");

  assert.equal(result.narration, "The room falls quiet as you take its measure.");
  assert.equal(result.artUrl, "https://example.com/art.jpg");
  assert.equal(result.gameEvent?.rollType, "check");
  assert.equal(result.character.id, mira.id);
});

test("HarnessGraphService.playTurn surfaces a rejected turn's reason on the returned event", async () => {
  const graph = createHarnessGraph({
    logic: new StubLogicAdapter({ ...CHECK_INTENT, rollType: "attack" as const }),
    creative: new StubNarrationAdapter("This could not happen."),
    art: new ArtService(async () => ({ url: "https://example.com/art.jpg" })),
  });
  const service = new HarnessGraphService(graph);
  const deadMira = { ...SAMPLE_CHARACTERS["mira-ashgrave"], hp: 0, status: "dead" as const };

  const result = await service.playTurn(deadMira, "attacks the guard");

  assert.equal(
    result.gameEvent?.rejectionReason,
    `${deadMira.name} has met Final Death — no further mutation is legal`,
  );
  assert.equal(result.character.status, "dead");
});
