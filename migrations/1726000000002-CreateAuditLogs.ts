import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogs1726000000002 implements MigrationInterface {
    name = 'CreateAuditLogs1726000000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "audit_logs" (
                "logID" SERIAL NOT NULL,
                "actionType" character varying(50) NOT NULL,
                "resourceName" character varying(200) NOT NULL,
                "details" text NOT NULL,
                "performedBy" integer NOT NULL,
                "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_audit_logs_logID" PRIMARY KEY ("logID")
            )`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_audit_logs_actionType" ON "audit_logs" ("actionType")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_audit_logs_performedBy" ON "audit_logs" ("performedBy")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_audit_logs_resourceName" ON "audit_logs" ("resourceName")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_audit_logs_timestamp" ON "audit_logs" ("timestamp")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_audit_logs_timestamp"`);
        await queryRunner.query(`DROP INDEX "IDX_audit_logs_resourceName"`);
        await queryRunner.query(`DROP INDEX "IDX_audit_logs_performedBy"`);
        await queryRunner.query(`DROP INDEX "IDX_audit_logs_actionType"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
    }
}
