import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { APP_GUARD } from "@nestjs/core";
import { HealthController } from "./health/health.controller";
import { UserEntity } from "./entities/user.entity";
import { ChronicleEntity } from "./entities/chronicle.entity";
import { TurnEntity } from "./entities/turn.entity";
import { NpcEntity } from "./entities/npc.entity";
import { JwtStrategy } from "./auth/jwt.strategy";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { RolesGuard } from "./auth/roles.guard";
import { AuthService } from "./auth/auth.service";
import { AuthController } from "./auth/auth.controller";
import { JwtWsGateway } from "./auth/jwt-ws.gateway";
import { TurnReservationService } from "./graph/turn-reservation.service";
import { GraphService } from "./graph/graph.service";

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
    // Required for @InjectRepository(UserEntity) in JwtWsGateway.
    // autoLoadEntities only registers an entity's metadata on the DataSource
    // if it appears in SOME module's forFeature() call — GraphService reads
    // TurnEntity/NpcEntity via dataSource.getRepository() (no DI), but that
    // still throws EntityMetadataNotFoundError unless they're listed here
    // too. (Found live 2026-08-13: countTurns failed-open on exactly this.)
    TypeOrmModule.forFeature([UserEntity, ChronicleEntity, TurnEntity, NpcEntity]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: "15m",
          issuer: "ai-dm-platform",
          audience: "ai-dm-platform-client",
        },
      }),
    }),
  ],
  controllers: [HealthController, AuthController],
  providers: [
    JwtStrategy,
    AuthService,
    TurnReservationService,
    GraphService,
    JwtWsGateway,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
