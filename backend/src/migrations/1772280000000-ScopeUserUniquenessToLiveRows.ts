import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Scope user email/phone uniqueness to non-deleted rows.
 *
 * `UsersService.remove()` soft-deletes (sets `deleted_at`), but the original
 * UNIQUE constraints covered every row, deleted or not. Signup checks filter on
 * `deleted_at IS NULL`, so a soft-deleted account passed the application check
 * and then blew up on a raw Postgres 23505 at INSERT time.
 *
 * Replacing the constraints with partial unique indexes keeps the audit trail
 * while letting a deleted account's email/phone be registered again.
 */
export class ScopeUserUniquenessToLiveRows1772280000000
  implements MigrationInterface
{
  private static readonly EMAIL_INDEX = 'UQ_users_email_active';
  private static readonly PHONE_INDEX = 'UQ_users_phone_active';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Constraint names are TypeORM-generated hashes, so drop them by lookup
    // rather than by hardcoded name.
    await queryRunner.query(`
      DO $$
      DECLARE
        constraint_name text;
      BEGIN
        FOR constraint_name IN
          SELECT con.conname
          FROM pg_constraint con
          JOIN pg_class rel ON rel.oid = con.conrelid
          JOIN pg_attribute att
            ON att.attrelid = rel.oid AND att.attnum = ANY (con.conkey)
          WHERE rel.relname = 'users'
            AND con.contype = 'u'
            AND array_length(con.conkey, 1) = 1
            AND att.attname IN ('email', 'phone')
        LOOP
          EXECUTE format(
            'ALTER TABLE "users" DROP CONSTRAINT %I', constraint_name
          );
        END LOOP;
      END $$;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "${ScopeUserUniquenessToLiveRows1772280000000.EMAIL_INDEX}"
      ON "users" ("email") WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "${ScopeUserUniquenessToLiveRows1772280000000.PHONE_INDEX}"
      ON "users" ("phone") WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${ScopeUserUniquenessToLiveRows1772280000000.EMAIL_INDEX}"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${ScopeUserUniquenessToLiveRows1772280000000.PHONE_INDEX}"`,
    );

    // Restoring the table-wide constraints only succeeds when no soft-deleted
    // row shares an email/phone with a live one.
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_email" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_phone" UNIQUE ("phone")`,
    );
  }
}
