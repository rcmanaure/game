import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActiveChronicleIdToUser1786046005821 implements MigrationInterface {
    name = 'AddActiveChronicleIdToUser1786046005821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "activeChronicleId" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "activeChronicleId"`);
    }

}
