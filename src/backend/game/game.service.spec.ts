import { Test, TestingModule } from "@nestjs/testing";
import { GameService } from "./game.service";
import { CharacterRepository } from "../database/character.repository";
import { HarnessGraphService } from "../harness/harness-graph.service";
import { SAMPLE_CHARACTERS } from "../../harness/character";

describe("GameService", () => {
  let service: GameService;
  let charRepo: CharacterRepository;
  let graphService: HarnessGraphService;

  beforeEach(async () => {
    charRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    } as any;

    graphService = {
      playTurn: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: CharacterRepository, useValue: charRepo },
        { provide: HarnessGraphService, useValue: graphService },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it("should load character, call harness, apply mutations, persist result", async () => {
    const character = SAMPLE_CHARACTERS["mira-ashgrave"];
    const playerAction = "attempt a risky dodge";
    const gameEvent = {
      rollType: "opposedCheck" as const,
      attribute: "dexterity" as const,
      skillOrDiscipline: null,
      modifier: 3,
      targetNumber: null,
      roll: 8,
      cravingDie: null,
      opponentTier: "moderate" as const,
      opponentRoll: 14,
      success: false,
      criticalTier: "none" as const,
      statDeltas: { hp: -5 },
      archetype: "dodge-attempt",
      summary: "attempt to evade incoming attack",
    };

    const mutatedCharacter = {
      ...character,
      hp: character.hp - 5,
    };

    (charRepo.findById as jest.Mock).mockResolvedValue(character);
    (graphService.playTurn as jest.Mock).mockResolvedValue({
      gameEvent,
      narration: "You take a hit...",
      artUrl: "https://example.com/image.jpg",
    });

    const result = await service.playTurn(character.id, playerAction);

    expect(charRepo.findById).toHaveBeenCalledWith(character.id);
    expect(graphService.playTurn).toHaveBeenCalledWith(character, playerAction);
    // Verify character was mutated before save
    expect(charRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: character.id,
        hp: mutatedCharacter.hp,
      })
    );
    expect(result).toEqual({
      gameEvent,
      narration: "You take a hit...",
      artUrl: "https://example.com/image.jpg",
    });
  });
});
