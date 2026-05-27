import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPushTokenToUsers1726000000001 implements MigrationInterface {
    name = 'AddPushTokenToUsers1726000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ADD "pushToken" character varying`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "pushToken"`);
    }
}
