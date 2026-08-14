import { test } from "node:test";
import assert from "node:assert/strict";
import { NotFoundException } from "@nestjs/common";
import { GameService } from "./game.service";
import type { CharacterRepository } from "../database/character.repository";
import type { HarnessGraphService } from "../harness/harness-graph.service";
import { SAMPLE_CHARACTERS, type Character } from "../../harness/character";

// Providers here are constructed directly rather than through a DI container:
// every one of them has a plain constructor, so the container buys nothing a
// `new` doesn't, and it keeps this suite on the same node:test runner the
// harness tests already use.
//
// The graph (not GameService) owns the character mutation — rulesValidate
// already computes it while gating the state transition, so these mocks
// return the mutated character directly, the same contract playTurn() now
// has against the real HarnessGraphService.

function makeService(opts: {
  found: Character | null;
  graphResult?: Awaited<ReturnType<HarnessGraphService["playTurn"]>>;
}) {
  const saved: Character[] = [];
  const graphCalls: Array<[Character, string]> = [];

  const charRepo = {
    findById: async () => opts.found,
    save: async (character: Character) => {
      saved.push(character);
    },
  } as unknown as CharacterRepository;

  const graph = {
    playTurn: async (character: Character, playerAction: string) => {
      graphCalls.push([character, playerAction]);
      return (
        opts.graphResult ?? {
          character,
          gameEvent: null,
          narration: "You take a hit.",
          artUrl: "https://example.com/art.jpg",
        }
      );
    },
  } as unknown as HarnessGraphService;

  return { service: new GameService(charRepo, graph), saved, graphCalls };
}

test("playTurn: loads the character, hands it to the graph, persists what the graph returns", async () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"]; // 12/12 hp
  const mutated = { ...mira, hp: 7 };
  const { service, saved, graphCalls } = makeService({
    found: mira,
    graphResult: { character: mutated, gameEvent: null, narration: "You take a hit.", artUrl: null },
  });

  const result = await service.playTurn(mira.id, "dodge the blow");

  assert.deepEqual(graphCalls, [[mira, "dodge the blow"]]);
  assert.equal(saved.length, 1);
  assert.equal(saved[0], mutated); // persists exactly what the graph returned, no re-derivation
  assert.equal(result.narration, "You take a hit.");
});

test("playTurn: an unknown character id raises NotFoundException and never calls the graph or persists", async () => {
  const { service, saved, graphCalls } = makeService({ found: null });

  await assert.rejects(
    () => service.playTurn("nobody", "look around"),
    (err: unknown) => err instanceof NotFoundException,
  );
  assert.equal(saved.length, 0);
  assert.equal(graphCalls.length, 0);
});

test("playTurn: a turn with no game event still persists the character the graph returned", async () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  const { service, saved } = makeService({ found: mira });

  await service.playTurn(mira.id, "wait");

  assert.equal(saved.length, 1);
  assert.equal(saved[0], mira);
});
