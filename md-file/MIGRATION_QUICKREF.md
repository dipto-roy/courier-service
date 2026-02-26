# 🚀 Migration Quick Reference Card

## ⚡ Most Used Commands

```bash
# Show migration status (what's run, what's pending)
npm run migration:show

# Run all pending migrations
npm run migration:run

# Generate migration from entity changes
npm run migration:generate src/migrations/YourMigrationName

# Create empty migration for custom SQL
npm run migration:create src/migrations/YourMigrationName

# Revert last migration (emergency only!)
npm run migration:revert
```

---

## 📋 Quick Decision Guide

### Should I use migrations or auto-sync?

**Use AUTO-SYNC when:**
- 🏠 Working locally alone
- 🔄 Making frequent entity changes
- 🛠️ In development/prototyping mode
- ⚡ Want fast iteration

**Use MIGRATIONS when:**
- 🏭 Deploying to staging/production
- 👥 Working in a team
- 📝 Need to track schema changes
- 🔙 Need rollback capability
- 📊 Doing data transformations

---

## 🎯 Common Workflows

### 1. Adding a New Field
```bash
# 1. Edit entity - add new column
# 2. Generate migration
npm run migration:generate src/migrations/AddNewField

# 3. Review the generated file
# 4. Run migration
npm run migration:run

# 5. Verify
npm run migration:show
```

### 2. Seeding Initial Data
```bash
# 1. Create empty migration
npm run migration:create src/migrations/SeedData

# 2. Edit file - add INSERT queries
# 3. Run migration
npm run migration:run
```

### 3. Emergency Rollback
```bash
# 1. Revert last migration
npm run migration:revert

# 2. Fix the migration file
# 3. Run again
npm run migration:run
```

---

## 📁 Files Structure

```
src/
├── data-source.ts              # Migration config
├── config/
│   └── database.config.ts      # Database config (updated)
└── migrations/                 # Migration files
    └── [timestamp]-Name.ts     # Individual migrations
```

---

## 🔑 Key Concepts

### Migration Lifecycle
```
Create → Review → Run → Verify
   ↓                      ↓
 [NEW]                  [DONE]
```

### Migration States
- `[ ]` = Pending (not run yet)
- `[X]` = Executed (already run)

### Safety Features
- ✅ Transactions (auto-rollback on error)
- ✅ Order guaranteed (by timestamp)
- ✅ One-time execution (tracked in DB)
- ✅ Reversible (down() method)

---

## 🛡️ Safety Rules

1. **NEVER** modify migrations after production run
2. **ALWAYS** backup before running in production
3. **ALWAYS** test locally first
4. **REVIEW** generated migrations (not always perfect)
5. **KEEP** synchronize=false in production

---

## 📦 Your Setup Status

✅ `typeorm-extension` installed  
✅ Migration scripts in package.json  
✅ Data source configured  
✅ Database config updated  
✅ Migrations directory created  
✅ Seed migration ready  
✅ Documentation complete  

**Status:** READY TO USE! 🎉

---

## 📚 Documentation

- **MIGRATION_GUIDE.md** - Complete guide (400+ lines)
- **MIGRATION_SETUP.md** - Quick start
- **MIGRATION_SUCCESS.md** - Full summary

---

## 🚀 Next Action

**Choose one:**

```bash
# Option A: Continue with auto-sync (easiest)
npm run start:dev

# Option B: Try the migration system
npm run migration:show    # Check status
npm run migration:run     # Run seed migration
npm run start:dev         # Start app

# Option C: Create your first custom migration
npm run migration:create src/migrations/MyFirstMigration
```

---

**Setup Complete!** ✅  
**Your migration system is ready!** 🎊
