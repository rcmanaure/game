import { test } from "node:test";
import assert from "node:assert/strict";
import { NotFoundException } from "@nestjs/common";
import { GameService } from "./game.service";
import type { CharacterRepository } from "../database/character.repository";
import type { HarnessGraphService } from "../harness/harness-graph.service";
import { SAMPLE_CHARACTERS, type Character } from "../../harness/character";
import type { ResolvedEvent } from "../../harness/rules";

// Providers here are constructed directly rather than through a DI container:
// every one of them has a plain constructor, so the container buys nothing a
// `new` doesn't, and it keeps this suite on the same node:test runner the
// harness tests already use.

function makeEvent(overrides: Partial<ResolvedEvent> = {}): ResolvedEvent {
  return {
    rollType: "opposedCheck",
    attribute: "dexterity",
    skillOrDiscipline: null,
    modifier: 3,
    targetNumber: null,
    roll: 8,
    cravingDie: null,
    opponentTier: "moderate",
    opponentRoll: 14,
    success: false,
    criticalTier: "none",
    statDeltas: { hp: -5 },
    archetype: "dodge-attempt",
    summary: "attempt to evade an incoming attack",
    ...overrides,
  };
}

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
          gameEvent: makeEvent(),
          narration: "You take a hit.",
          artUrl: "https://example.com/art.jpg",
        }
      );
    },
  } as unknown as HarnessGraphService;

  return { service: new GameService(charRepo, graph), saved, graphCalls };
}

test("playTurn: loads the character, hands it to the graph, persists the result", async () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"]; // 12/12 hp
  const { service, saved, graphCalls } = makeService({ found: mira });

  const result = await service.playTurn(mira.id, "dodge the blow");

  assert.deepEqual(graphCalls, [[mira, "dodge the blow"]]);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].id, mira.id);
  assert.equal(result.narration, "You take a hit.");
});

test("playTurn: the persisted character carries the event's hp delta", async () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"]; // 12/12 hp
  const { service, saved } = makeService({ found: mira });

  await service.playTurn(mira.id, "dodge the blow");

  assert.equal(saved[0].hp, mira.hp - 5);
  assert.equal(saved[0].status, "active");
});

test("playTurn: an unknown character id raises NotFoundException and never persists", async () => {
  const { service, saved } = makeService({ found: null });

  await assert.rejects(
    () => service.playTurn("nobody", "look around"),
    (err: unknown) => err instanceof NotFoundException,
  );
  assert.equal(saved.length, 0);
});

test("playTurn: a turn with no game event still persists the loaded character", async () => {
  const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
  const { service, saved } = makeService({
    found: mira,
    graphResult: { gameEvent: null, narration: null, artUrl: null },
  });

  await service.playTurn(mira.id, "wait");

  assert.equal(saved.length, 1);
  assert.equal(saved[0].hp, mira.hp);
});
