import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { ChronicleEntity } from './entities/chronicle.entity';
import { TurnEntity } from './entities/turn.entity';
import { NpcEntity } from './entities/npc.entity';

// Standalone DataSource for the TypeORM CLI (migration:generate/run/revert).
// The CLI can't use NestJS's async ConfigService factory (app.module.ts),
// so this reads process.env.DATABASE_URL directly via dotenv — same env
// var, same .env file as the app's own config path, just a second reader
// of one source of truth, not a second source of truth for the value.
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [UserEntity, ChronicleEntity, TurnEntity, NpcEntity],
  migrations: ['src/backend/migrations/*.ts'],
  synchronize: false,
});
