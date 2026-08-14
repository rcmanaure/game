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

  it("should load character, call harness, persist result", async () => {
    const character = SAMPLE_CHARACTERS["mira-ashgrave"];
    const playerAction = "attempt a stealthy approach";
    const gameEvent = {
      rollType: "check" as const,
      attribute: "dexterity" as const,
      skillOrDiscipline: "stealth",
      modifier: 3,
      targetNumber: 15,
      roll: 12,
      cravingDie: null,
      opponentTier: null,
      opponentRoll: null,
      success: false,
      criticalTier: "none" as const,
      statDeltas: {},
      archetype: "stealth-attempt",
      summary: "a careful movement through shadows",
    };

    (charRepo.findById as jest.Mock).mockResolvedValue(character);
    (graphService.playTurn as jest.Mock).mockResolvedValue({
      gameEvent,
      narration: "You move carefully...",
      artUrl: "https://example.com/image.jpg",
    });

    const result = await service.playTurn(character.id, playerAction);

    expect(charRepo.findById).toHaveBeenCalledWith(character.id);
    expect(graphService.playTurn).toHaveBeenCalledWith(character, playerAction);
    expect(charRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: character.id,
      })
    );
    expect(result).toEqual({
      gameEvent,
      narration: "You move carefully...",
      artUrl: "https://example.com/image.jpg",
    });
  });
});
