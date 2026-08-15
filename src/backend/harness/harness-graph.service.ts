import { Injectable } from "@nestjs/common";
import { type Character } from "../../harness/character";
import type { HarnessGraph, HarnessGraphState } from "../../harness/graph";

// src/harness is ESM-scoped (root package.json: "type": "module"), while
// src/backend stays CommonJS (its own package.json overrides it back) so
// Nest's decorator metadata keeps working — esbuild-based runners (tsx)
// don't emit it, which NestJS's constructor-type injection needs. A CJS
// module can't require() an ESM one, but it CAN load it with a dynamic
// import() (Node's documented CJS->ESM interop path). ts-node's own --esm
// loader can't resolve a live ".ts" source through that import on this Node
// version, so `npm run harness:build` (a prebackend:dev step) compiles
// src/harness to real .js first — the dynamic import targets that compiled
// output, which Node's native loader resolves with no tool-specific help.
// tsconfig.json emits declarations too, so this resolves its own real
// types from dist/harness/graph.d.ts — no manual type/value split needed.
async function loadHarnessGraphFromEnv(): Promise<HarnessGraph> {
  const { createHarnessGraphFromEnv } = await import("../../../dist/harness/graph.js");
  return createHarnessGraphFromEnv();
}

@Injectable()
export class HarnessGraphService {
  // HarnessGraph is an interface, not a registered provider token — Nest
  // can't resolve it by reflection, so game.module.ts registers this class
  // behind a factory provider (`new HarnessGraphService()`) instead, which
  // never asks Nest to reflect this constructor. Tests build one with stub
  // collaborators synchronously via createHarnessGraph
  // (`new HarnessGraphService(stubGraph)`), exercising this class's actual
  // wiring with no live API calls and no dynamic import.
  private readonly graph: Promise<HarnessGraph>;

  constructor(graph?: HarnessGraph) {
    this.graph = graph ? Promise.resolve(graph) : loadHarnessGraphFromEnv();
    // The promise starts eagerly (right here, not lazily on first
    // playTurn), so a missing OPENROUTER_API_KEY would otherwise reject it
    // as an unhandled rejection — a process crash — before any request ever
    // awaits it. This tracked no-op catch only silences that; playTurn's
    // own `await this.graph` below still sees and throws the real error.
    this.graph.catch(() => {});
  }

  async playTurn(
    character: Character,
    playerAction: string,
  ): Promise<{
    character: HarnessGraphState["character"];
    gameEvent: HarnessGraphState["gameEvent"];
    narration: HarnessGraphState["narration"];
    artUrl: HarnessGraphState["artUrl"];
    artError?: HarnessGraphState["artError"];
  }> {
    const graph = await this.graph;
    const input: HarnessGraphState = {
      playerAction,
      character,
      gameEvent: null,
      narration: null,
      artUrl: null,
      artError: null,
      lastReferenceUrl: null,
    };

    const output = await graph.invoke(input);

    // rulesValidate already computed the mutated character while gating the
    // state transition — return it rather than making the caller re-derive
    // the same mutation from gameEvent (run.ts already consumes it this way).
    return {
      character: output.character,
      gameEvent: output.gameEvent,
      narration: output.narration,
      artUrl: output.artUrl,
      artError: output.artError,
    };
  }
}
