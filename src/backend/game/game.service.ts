import { Injectable, NotFoundException } from "@nestjs/common";
import { CharacterRepository } from "../database/character.repository";
import { HarnessGraphService } from "../harness/harness-graph.service";
import { applyMutation } from "../../harness/validator";
import { type HarnessGraphState } from "../../harness/graph";

@Injectable()
export class GameService {
  constructor(
    private readonly charRepo: CharacterRepository,
    private readonly graph: HarnessGraphService,
  ) {}

  async playTurn(characterId: string, playerAction: string): Promise<{
    gameEvent: HarnessGraphState["gameEvent"];
    narration: HarnessGraphState["narration"];
    artUrl: HarnessGraphState["artUrl"];
    artError?: HarnessGraphState["artError"];
  }> {
    let character = await this.charRepo.findById(characterId);
    if (!character) {
      throw new NotFoundException(`Character ${characterId} not found`);
    }

    const result = await this.graph.playTurn(character, playerAction);

    // Apply gameEvent mutations (hp/status changes) to character before persist
    if (result.gameEvent) {
      const mutated = applyMutation(character, result.gameEvent);
      character = mutated.character;
    }

    await this.charRepo.save(character);

    return result;
  }
}
