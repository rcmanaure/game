import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CharacterEntity } from "./character.entity";
import { type Character } from "../../harness/character";

@Injectable()
export class CharacterRepository {
  constructor(
    @InjectRepository(CharacterEntity)
    private readonly repo: Repository<CharacterEntity>,
  ) {}

  async findById(id: string): Promise<Character | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity?.data ?? null;
  }

  async save(character: Character): Promise<void> {
    await this.repo.save({
      id: character.id,
      data: character,
    });
  }
}
