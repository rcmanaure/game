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
    gameEvent: HarnessGraphState["gameEvent"];
    narration: HarnessGraphState["narration"];
    artUrl: HarnessGraphState["artUrl"];
    artError?: HarnessGraphState["artError"];
  }> {
    const character = await this.charRepo.findById(characterId);
    if (!character) {
      throw new NotFoundException(`Character ${characterId} not found`);
    }

    const result = await this.graph.playTurn(character, playerAction);
    await this.charRepo.save(character);

    return result;
  }
}
