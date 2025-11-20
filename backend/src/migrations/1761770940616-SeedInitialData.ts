import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Seed Initial Data Migration
 * 
 * This migration seeds the database with essential initial data:
 * - System Admin user
 * - Test users for different roles (for development)
 * 
 * Note: This should only be run once during initial setup.
 */
export class SeedInitialData1761770940616 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if admin user already exists
    const adminExists = await queryRunner.query(
      `SELECT id FROM users WHERE email = 'admin@fastx.com' LIMIT 1`,
    );

    if (adminExists.length === 0) {
      // Create admin user
      const adminPassword = await bcrypt.hash('Admin@123456', 10);

      await queryRunner.query(`
        INSERT INTO users (
          id,
          name,
          email,
          phone,
          role,
          password,
          is_active,
          is_verified,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          'System Admin',
          'admin@fastx.com',
          '01700000000',
          'admin',
          '${adminPassword}',
          true,
          true,
          NOW(),
          NOW()
        )
      `);

      console.log('✅ Admin user created: admin@fastx.com / Admin@123456');
    }

    // Create test merchant (development only)
    if (process.env.NODE_ENV === 'development') {
      const merchantExists = await queryRunner.query(
        `SELECT id FROM users WHERE email = 'merchant@fastx.com' LIMIT 1`,
      );

      if (merchantExists.length === 0) {
        const merchantPassword = await bcrypt.hash('Merchant@123', 10);

        await queryRunner.query(`
          INSERT INTO users (
            id,
            name,
            email,
            phone,
            role,
            password,
            is_active,
            is_verified,
            wallet_balance,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            'Test Merchant',
            'merchant@fastx.com',
            '01711111111',
            'merchant',
            '${merchantPassword}',
            true,
            true,
            5000.00,
            NOW(),
            NOW()
          )
        `);

        console.log('✅ Test merchant created: merchant@fastx.com / Merchant@123');
      }

      // Create test rider
      const riderExists = await queryRunner.query(
        `SELECT id FROM users WHERE email = 'rider@fastx.com' LIMIT 1`,
      );

      if (riderExists.length === 0) {
        const riderPassword = await bcrypt.hash('Rider@123', 10);

        await queryRunner.query(`
          INSERT INTO users (
            id,
            name,
            email,
            phone,
            role,
            password,
            is_active,
            is_verified,
            wallet_balance,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            'Test Rider',
            'rider@fastx.com',
            '01722222222',
            'rider',
            '${riderPassword}',
            true,
            true,
            0.00,
            NOW(),
            NOW()
          )
        `);

        console.log('✅ Test rider created: rider@fastx.com / Rider@123');
      }

      // Create test hub staff
      const hubStaffExists = await queryRunner.query(
        `SELECT id FROM users WHERE email = 'hub@fastx.com' LIMIT 1`,
      );

      if (hubStaffExists.length === 0) {
        const hubPassword = await bcrypt.hash('Hub@123', 10);

        await queryRunner.query(`
          INSERT INTO users (
            id,
            name,
            email,
            phone,
            role,
            password,
            is_active,
            is_verified,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            'Test Hub Staff',
            'hub@fastx.com',
            '01733333333',
            'hub_staff',
            '${hubPassword}',
            true,
            true,
            NOW(),
            NOW()
          )
        `);

        console.log('✅ Test hub staff created: hub@fastx.com / Hub@123');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove seeded users
    await queryRunner.query(`
      DELETE FROM users WHERE email IN (
        'admin@fastx.com',
        'merchant@fastx.com',
        'rider@fastx.com',
        'hub@fastx.com'
      )
    `);

    console.log('✅ Seeded users removed');
  }
}
