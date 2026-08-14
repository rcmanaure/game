import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameService } from "./game.service";
import { CharacterEntity } from "../database/character.entity";
import { CharacterRepository } from "../database/character.repository";
import { HarnessGraphService } from "../harness/harness-graph.service";

@Module({
  imports: [TypeOrmModule.forFeature([CharacterEntity])],
  providers: [
    GameService,
    CharacterRepository,
    // Factory provider: HarnessGraphService's constructor takes an
    // interface (HarnessGraph), which Nest can't resolve by reflection.
    // Calling `new` here bypasses that reflection and lets the class's own
    // default parameter build the live env-backed graph.
    { provide: HarnessGraphService, useFactory: () => new HarnessGraphService() },
  ],
  exports: [GameService],
})
export class GameModule {}
