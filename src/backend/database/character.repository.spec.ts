import { Test, TestingModule } from "@nestjs/testing";
import { CharacterRepository } from "./character.repository";
import { CharacterEntity } from "./character.entity";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { SAMPLE_CHARACTERS } from "../../harness/character";

describe("CharacterRepository", () => {
  let repo: CharacterRepository;
  let typeormRepo: Repository<CharacterEntity>;

  beforeEach(async () => {
    typeormRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharacterRepository,
        {
          provide: getRepositoryToken(CharacterEntity),
          useValue: typeormRepo,
        },
      ],
    }).compile();

    repo = module.get<CharacterRepository>(CharacterRepository);
  });

  it("should find character by id", async () => {
    const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
    const entity = { id: "mira-ashgrave", data: mira };
    (typeormRepo.findOne as jest.Mock).mockResolvedValue(entity);

    const result = await repo.findById("mira-ashgrave");

    expect(typeormRepo.findOne).toHaveBeenCalledWith({
      where: { id: "mira-ashgrave" },
    });
    expect(result).toEqual(mira);
  });

  it("should save character", async () => {
    const mira = SAMPLE_CHARACTERS["mira-ashgrave"];
    const entity = { id: "mira-ashgrave", data: mira };
    (typeormRepo.save as jest.Mock).mockResolvedValue(entity);

    await repo.save(mira);

    expect(typeormRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "mira-ashgrave",
        data: mira,
      })
    );
  });
});
