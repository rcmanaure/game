import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HealthController } from "./health/health.controller";
import { GameModule } from "./game/game.module";

// Scaffold now has real orchestration (Candidate 4): GameService wraps
// HarnessGraphService, which invokes the LangGraph. CharacterRepository
// shows the seam. T3/T4 can now implement their entities/services on top
// of this example pattern, not blindly. synchronize is always false —
// schema changes are migrations, never auto-sync.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres" as const,
        url: config.getOrThrow<string>("DATABASE_URL"),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    GameModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
