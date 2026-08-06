import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1786034027189 implements MigrationInterface {
    name = 'InitSchema1786034027189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chronicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "startedAt" TIMESTAMP NOT NULL DEFAULT now(), "endedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_298a88d5960505b1e56dc911da9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3f7433ba1173beca901bdf2fec" ON "chronicles" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."turns_status_enum" AS ENUM('reserved', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "turns" ("turnId" uuid NOT NULL, "userId" character varying NOT NULL, "chronicleId" character varying NOT NULL, "status" "public"."turns_status_enum" NOT NULL DEFAULT 'reserved', "playerAction" character varying NOT NULL, "gameEvent" jsonb, "narration" text, "artUrl" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_11723e155fe6d61a0d1e73a8ee1" PRIMARY KEY ("turnId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a70554a0d3ee2d4b08f1c711b8" ON "turns" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_28adbfe42572afca61464d697e" ON "turns" ("chronicleId") `);
        await queryRunner.query(`CREATE TABLE "npcs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "chronicleId" character varying NOT NULL, "name" character varying NOT NULL, "fact" text NOT NULL, "bloodline" character varying, "hp" integer NOT NULL, "maxHp" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_00b811f71db086ecc6576957d42" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_78357f6a437397ac3e523549e3" ON "npcs" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_78357f6a437397ac3e523549e3"`);
        await queryRunner.query(`DROP TABLE "npcs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_28adbfe42572afca61464d697e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a70554a0d3ee2d4b08f1c711b8"`);
        await queryRunner.query(`DROP TABLE "turns"`);
        await queryRunner.query(`DROP TYPE "public"."turns_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3f7433ba1173beca901bdf2fec"`);
        await queryRunner.query(`DROP TABLE "chronicles"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
