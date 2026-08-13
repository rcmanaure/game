import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompositeIndexes1786644199678 implements MigrationInterface {
    name = 'AddCompositeIndexes1786644199678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a70554a0d3ee2d4b08f1c711b8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_28adbfe42572afca61464d697e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78357f6a437397ac3e523549e3"`);
        await queryRunner.query(`CREATE INDEX "IDX_5785fb8816c45a66e3ae2d877b" ON "turns" ("userId", "chronicleId") `);
        // Recall's query is WHERE userId AND chronicleId ORDER BY createdAt DESC LIMIT 1 —
        // createdAt DESC in the index itself makes that an index-ordered scan, not a
        // filter-then-sort. TypeORM's @Index(['userId','chronicleId']) decorator can't
        // express the third column's sort direction, so this index is hand-added here
        // rather than regenerated from the entity — the entity decorator documents the
        // filter columns, this migration is the source of truth for the actual DDL.
        await queryRunner.query(`CREATE INDEX "IDX_9a926e42add5a1559145035b17" ON "npcs" ("userId", "chronicleId", "createdAt" DESC) `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9a926e42add5a1559145035b17"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5785fb8816c45a66e3ae2d877b"`);
        await queryRunner.query(`CREATE INDEX "IDX_78357f6a437397ac3e523549e3" ON "npcs" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_28adbfe42572afca61464d697e" ON "turns" ("chronicleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a70554a0d3ee2d4b08f1c711b8" ON "turns" ("userId") `);
    }

}
