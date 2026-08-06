import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HealthController } from "./health/health.controller";

// Scaffold only (per Decision #19: "existing NestJS backend/Docker Compose
// on the Hostinger VPS") — T3/T4/T7/T14 build real modules/entities on top
// of this. No entities yet, so autoLoadEntities has nothing to load; that's
// expected until the first real module (T3's rate-limit table) adds one.
// synchronize is always false — schema changes are migrations, never
// auto-sync, per the plan's own migration-tested-before-VPS discipline.
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
  ],
  controllers: [HealthController],
})
export class AppModule {}
