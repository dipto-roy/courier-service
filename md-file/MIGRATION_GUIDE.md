# Database Migration Guide - FastX Courier Service

## 📋 Overview

This guide covers database migration setup and management for FastX Courier Service.

## 🛠️ Setup Complete ✅

The following has been configured:

1. ✅ Installed `typeorm-extension` package
2. ✅ Created `src/data-source.ts` configuration file
3. ✅ Added migration scripts to `package.json`
4. ✅ Created `src/migrations/` directory
5. ✅ Updated database config for migration support

## 📝 Available Commands

```bash
# Generate a new migration (based on entity changes)
npm run migration:generate src/migrations/MigrationName

# Create an empty migration (for custom SQL)
npm run migration:create src/migrations/MigrationName

# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Show all migrations and their status
npm run migration:show
```

## 🚀 Usage Examples

### 1. Current State
Your database is already synced with your entities via TypeORM's `synchronize` feature. No initial migration needed.

### 2. Making Schema Changes

When you need to change the database schema:

**Step 1:** Modify your entity
```typescript
// user.entity.ts
@Entity('users')
export class User {
  // Add new field
  @Column({ nullable: true })
  middleName: string;
}
```

**Step 2:** Generate migration
```bash
npm run migration:generate src/migrations/AddMiddleNameToUser
```

**Step 3:** Review the generated migration file
```typescript
// src/migrations/1234567890-AddMiddleNameToUser.ts
export class AddMiddleNameToUser1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "middleName" varchar`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "middleName"`);
  }
}
```

**Step 4:** Run migration
```bash
npm run migration:run
```

### 3. Creating Custom Migrations

For data transformations or complex operations:

```bash
# Create empty migration
npm run migration:create src/migrations/SeedInitialData
```

```typescript
// src/migrations/1234567890-SeedInitialData.ts
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedInitialData1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    await queryRunner.query(`
      INSERT INTO users (id, name, email, phone, role, password, "isActive", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'System Admin',
        'admin@fastx.com',
        '01700000000',
        'admin',
        '${hashedPassword}',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `);

    // Insert default settings
    await queryRunner.query(`
      INSERT INTO settings (key, value, description)
      VALUES
        ('base_delivery_fee', '50', 'Base delivery fee in BDT'),
        ('per_kg_fee', '20', 'Per kilogram fee in BDT'),
        ('express_surcharge', '50', 'Express delivery surcharge in BDT'),
        ('sla_hours', '48', 'Standard SLA hours for delivery')
      ON CONFLICT (key) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM users WHERE email = 'admin@fastx.com'`);
    await queryRunner.query(`DELETE FROM settings WHERE key IN ('base_delivery_fee', 'per_kg_fee', 'express_surcharge', 'sla_hours')`);
  }
}
```

## 🔄 Switching from Synchronize to Migrations

For production deployment, you should disable `synchronize` and use migrations:

### Step 1: Set environment variable
```bash
# .env.production
USE_MIGRATIONS=true
```

### Step 2: Generate initial migration (if starting fresh)
```bash
# Only needed if migrating from dev to production
npm run migration:generate src/migrations/InitialSchema
```

### Step 3: Run migrations on production
```bash
NODE_ENV=production npm run migration:run
```

## ⚙️ Configuration Details

### Data Source Configuration
Located at `src/data-source.ts`:

```typescript
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'courier_service',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false, // Always false for safety
  migrationsTableName: 'migrations_history',
};
```

### Database Config for NestJS
Located at `src/config/database.config.ts`:

- **Development Mode**: Uses `synchronize: true` by default (auto-sync schema)
- **Migration Mode**: Set `USE_MIGRATIONS=true` to disable sync and use migrations
- **Production Mode**: Always use migrations, never synchronize

## 🗄️ Migration History

Migrations are tracked in the `migrations_history` table:

```sql
SELECT * FROM migrations_history ORDER BY timestamp DESC;
```

This shows:
- Migration ID
- Timestamp
- Migration name

## 🔍 Best Practices

### 1. Always Review Generated Migrations
Generated migrations might not be perfect. Review them before running:
- Check for data loss risks
- Verify indexes are preserved
- Ensure foreign keys are correct

### 2. Test Migrations Locally First
```bash
# Test migration
npm run migration:run

# If issues, revert
npm run migration:revert

# Fix migration file, then run again
```

### 3. Backup Before Running on Production
```bash
# PostgreSQL backup
pg_dump courier_service > backup_$(date +%Y%m%d_%H%M%S).sql

# Then run migration
npm run migration:run
```

### 4. Use Transactions
Migrations run in transactions by default. If any query fails, all changes are rolled back.

### 5. Never Modify Existing Migrations
Once a migration is run on production, never modify it. Create a new migration instead.

## 🚨 Common Issues

### Issue 1: Migration Already Run
```
Error: Migration has already been run
```
**Solution:** Check `migrations_history` table. If migration is there, it's already applied.

### Issue 2: Entity Changes Not Detected
```
No changes in database schema were found
```
**Solution:** 
- Ensure entities are properly decorated
- Check if changes are truly different from current schema
- Try creating manual migration

### Issue 3: TypeScript Compilation Errors
```
Error: Cannot find module
```
**Solution:** Build the project first
```bash
npm run build
npm run migration:run
```

## 📦 Deployment Workflow

### Development
```bash
# Make entity changes
# Auto-sync is ON (synchronize: true)
npm run start:dev
```

### Staging/Production
```bash
# 1. Generate migration in dev
npm run migration:generate src/migrations/YourChanges

# 2. Commit migration file to git
git add src/migrations/*
git commit -m "Add migration for YourChanges"

# 3. On staging/production server
git pull
npm install
npm run build
npm run migration:run
npm run start:prod
```

## 🎯 Next Steps

Now that migrations are set up, consider:

1. **Create seed data migrations** for initial system data
2. **Set up migration CI/CD** to auto-run on deployment
3. **Document migration strategy** for your team
4. **Plan rollback strategy** for production issues

## 📚 Resources

- [TypeORM Migration Documentation](https://typeorm.io/migrations)
- [TypeORM Extension](https://www.npmjs.com/package/typeorm-extension)
- [Database Migration Best Practices](https://www.prisma.io/dataguide/types/relational/migration-strategies)

---

**Status:** ✅ Migration infrastructure ready!  
**Last Updated:** October 30, 2025
