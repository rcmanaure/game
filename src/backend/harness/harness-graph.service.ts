import { Injectable } from "@nestjs/common";
import { type Character } from "../../harness/character";
import { harnessGraph, type HarnessGraphState } from "../../harness/graph";

@Injectable()
export class HarnessGraphService {
  async playTurn(
    character: Character,
    playerAction: string,
  ): Promise<{
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

    const output = await harnessGraph.invoke(input);

    return {
      gameEvent: output.gameEvent,
      narration: output.narration,
      artUrl: output.artUrl,
      artError: output.artError,
    };
  }
}
