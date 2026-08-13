import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleToUser1786643012008 implements MigrationInterface {
    name = 'AddRoleToUser1786643012008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "role" character varying NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    }

}
