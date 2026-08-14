import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameService } from "./game.service";
import { GameController } from "./game.controller";
import { CharacterEntity } from "../database/character.entity";
import { CharacterRepository } from "../database/character.repository";
import { HarnessGraphService } from "../harness/harness-graph.service";

@Module({
  imports: [TypeOrmModule.forFeature([CharacterEntity])],
  providers: [GameService, CharacterRepository, HarnessGraphService],
  controllers: [GameController],
})
export class GameModule {}
