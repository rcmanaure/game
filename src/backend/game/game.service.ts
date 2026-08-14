import { Injectable, NotFoundException } from "@nestjs/common";
import { CharacterRepository } from "../database/character.repository";
import { HarnessGraphService } from "../harness/harness-graph.service";
import { type HarnessGraphState } from "../../harness/graph";

@Injectable()
export class GameService {
  constructor(
    private readonly charRepo: CharacterRepository,
    private readonly graph: HarnessGraphService,
  ) {}

  async playTurn(characterId: string, playerAction: string): Promise<{
    character: HarnessGraphState["character"];
    gameEvent: HarnessGraphState["gameEvent"];
    narration: HarnessGraphState["narration"];
    artUrl: HarnessGraphState["artUrl"];
    artError?: HarnessGraphState["artError"];
  }> {
    const character = await this.charRepo.findById(characterId);
    if (!character) {
      throw new NotFoundException(`Character ${characterId} not found`);
    }

    // rulesValidate (inside the graph) already computed the mutated
    // character while gating the state transition — persist what it
    // returned rather than re-deriving the same mutation here.
    const result = await this.graph.playTurn(character, playerAction);

    await this.charRepo.save(result.character);

    return result;
  }
}
