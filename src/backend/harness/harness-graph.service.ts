import { Injectable } from "@nestjs/common";
import { type Character } from "../../harness/character";
import { createHarnessGraphFromEnv, type HarnessGraph, type HarnessGraphState } from "../../harness/graph";

@Injectable()
export class HarnessGraphService {
  // A plain default, no parameter decorator: HarnessGraph is an interface,
  // not a registered provider token, so Nest's own constructor-injection
  // reflection would fail on it. game.module.ts registers this class behind
  // a factory provider instead (`new HarnessGraphService()`), which never
  // asks Nest to reflect this constructor — the plain JS default just fires.
  // Tests build one with stub collaborators via createHarnessGraph
  // (`new HarnessGraphService(stubGraph)`), exercising this class's actual
  // wiring with no live API calls.
  constructor(private readonly graph: HarnessGraph = createHarnessGraphFromEnv()) {}

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
    const input: HarnessGraphState = {
      playerAction,
      character,
      gameEvent: null,
      narration: null,
      artUrl: null,
      artError: null,
      lastReferenceUrl: null,
    };

    const output = await this.graph.invoke(input);

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
