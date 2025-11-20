# 🚀 Database Migration Setup - Quick Start

## ✅ What's Been Set Up

Your FastX Courier Service now has a complete database migration system:

1. **Installed Packages:**
   - `typeorm-extension` - Advanced TypeORM utilities

2. **New Files Created:**
   - `src/data-source.ts` - Migration configuration
   - `src/migrations/` - Migration directory
   - `src/migrations/1761770940616-SeedInitialData.ts` - Initial seed data
   - `MIGRATION_GUIDE.md` - Comprehensive migration guide

3. **Updated Files:**
   - `package.json` - Added migration scripts
   - `src/config/database.config.ts` - Migration support

4. **New NPM Scripts:**
   ```json
   "migration:generate": "Generate migration from entity changes"
   "migration:create": "Create empty migration"
   "migration:run": "Run all pending migrations"
   "migration:revert": "Revert last migration"
   "migration:show": "Show migration status"
   ```

## 🎯 Quick Usage

### Option 1: Continue Using Auto-Sync (Development)
```bash
# Current setup - no changes needed
npm run start:dev
```
Your entities will continue to auto-sync. Migrations are optional for development.

### Option 2: Use Migrations (Production-Ready)
```bash
# Run the seed migration to create admin user
npm run migration:run

# Start the app
npm run start:dev
```

## 👤 Seeded Users

The seed migration creates these test accounts:

| Role | Email | Password | Phone | Purpose |
|------|-------|----------|-------|---------|
| Admin | admin@fastx.com | Admin@123456 | 01700000000 | System administration |
| Merchant | merchant@fastx.com | Merchant@123 | 01711111111 | Test merchant (dev only) |
| Rider | rider@fastx.com | Rider@123 | 01722222222 | Test rider (dev only) |
| Hub Staff | hub@fastx.com | Hub@123 | 01733333333 | Test hub staff (dev only) |

**Note:** Test users (merchant, rider, hub) are only created in development mode.

## 📋 When to Use Migrations

### Use Auto-Sync (synchronize: true) When:
- ✅ In development mode
- ✅ Making frequent entity changes
- ✅ Working alone on the project
- ✅ Quick prototyping

### Use Migrations When:
- ✅ Deploying to staging/production
- ✅ Working in a team
- ✅ Need to track schema changes
- ✅ Need rollback capability
- ✅ Data transformation required

## 🔄 Making Schema Changes

### Example Workflow:

**1. Modify an entity:**
```typescript
// user.entity.ts
@Column({ nullable: true })
middleName: string; // New field added
```

**2. Generate migration:**
```bash
npm run migration:generate src/migrations/AddMiddleNameToUser
```

**3. Run migration:**
```bash
npm run migration:run
```

**4. Check status:**
```bash
npm run migration:show
```

## 🚀 Production Deployment

### Step 1: Switch to Migration Mode
```bash
# .env.production
USE_MIGRATIONS=true
NODE_ENV=production
```

### Step 2: Run Migrations
```bash
npm run build
npm run migration:run
npm run start:prod
```

## 📚 Documentation

For detailed information, see:
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Complete migration documentation
- **[TypeORM Migrations](https://typeorm.io/migrations)** - Official docs

## ⚠️ Important Notes

1. **Never modify existing migrations** after they're run in production
2. **Always backup database** before running migrations in production
3. **Test migrations locally** before deploying
4. **Keep synchronize=false** in production

## 🎉 Next Steps

Your migration setup is complete! Choose one of these paths:

### For Development:
```bash
# Continue with auto-sync
npm run start:dev
```

### For Production-Ready:
```bash
# Run seed migration
npm run migration:run

# Start with migrations enabled
USE_MIGRATIONS=true npm run start:dev
```

## 🆘 Need Help?

Common commands:
```bash
# Show what migrations have run
npm run migration:show

# Revert last migration if something went wrong
npm run migration:revert

# Create custom migration for data seeding
npm run migration:create src/migrations/CustomMigration
```

---

**Status:** ✅ Ready to use!  
**Created:** October 30, 2025
