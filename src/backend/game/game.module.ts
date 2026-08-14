import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameService } from "./game.service";
import { CharacterEntity } from "../database/character.entity";
import { CharacterRepository } from "../database/character.repository";
import { HarnessGraphService } from "../harness/harness-graph.service";

@Module({
  imports: [TypeOrmModule.forFeature([CharacterEntity])],
  providers: [GameService, CharacterRepository, HarnessGraphService],
  exports: [GameService],
})
export class GameModule {}
