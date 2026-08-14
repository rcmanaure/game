import { Test, TestingModule } from "@nestjs/testing";
import { HarnessGraphService } from "./harness-graph.service";
import { SAMPLE_CHARACTERS } from "../../harness/character";

describe("HarnessGraphService", () => {
  let service: HarnessGraphService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HarnessGraphService],
    }).compile();

    service = module.get<HarnessGraphService>(HarnessGraphService);
  });

  it("should invoke harness graph with character and action", async () => {
    const character = SAMPLE_CHARACTERS["mira-ashgrave"];
    const playerAction = "attempt to read the room";

    const result = await service.playTurn(character, playerAction);

    expect(result).toHaveProperty("gameEvent");
    expect(result).toHaveProperty("narration");
    expect(result.gameEvent).toBeDefined();
    expect(typeof result.narration).toBe("string");
  });
});
