import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePostGIS1726000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create PostGIS extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis"`);

        // Create ert_units table if it doesn't exist
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ert_units" (
        "unitID" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "status" varchar(50) NOT NULL DEFAULT 'idle',
        "region" varchar(255),
        "location" geometry(Point, 4326),
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create spatial index on location
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_ert_units_location" 
      ON "ert_units" USING GIST("location")
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX IF EXISTS "idx_ert_units_location"`,
        );
        await queryRunner.query(`DROP TABLE IF EXISTS "ert_units"`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS "postgis"`);
    }
}
