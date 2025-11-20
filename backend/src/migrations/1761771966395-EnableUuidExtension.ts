import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Enable UUID Extension Migration
 * 
 * This migration ensures the uuid-ossp PostgreSQL extension is installed.
 * The uuid-ossp extension provides functions for generating UUIDs:
 * - gen_random_uuid(): Generates a version 4 UUID (random)
 * - uuid_generate_v1(): Generates a version 1 UUID (MAC + timestamp)
 * - uuid_generate_v4(): Generates a version 4 UUID (random)
 * - uuid_generate_v5(): Generates a version 5 UUID (SHA-1 hash)
 * 
 * This extension is required by all entities that use UUID primary keys.
 * 
 * Note: This is idempotent - safe to run multiple times.
 */
export class EnableUuidExtension1761771966395 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp extension (idempotent)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    console.log('✅ UUID extension (uuid-ossp) enabled successfully');
    console.log('   Available functions: gen_random_uuid(), uuid_generate_v4(), etc.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop uuid-ossp extension
    // Note: This will fail if any tables are using UUID columns
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE`);

    console.log('⚠️  UUID extension (uuid-ossp) has been removed');
    console.log('   Warning: This may break tables with UUID columns');
  }
}
