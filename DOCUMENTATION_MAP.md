# Quick Reference - Documentation Structure

## 📁 Final File Structure

```
courier-service/
│
├── 📄 README.md                    ← START HERE (Main entry point)
│   └── Links to all documentation
│
├── 📂 docs/                        ← PUBLIC DOCS (for everyone)
│   ├── architecture.md             (920 lines) System design
│   ├── api.md                      (1200 lines) 51 API endpoints
│   ├── deployment.md               (608 lines) Setup & deploy
│   ├── USAGE_GUIDE.md              (This file) How to use docs
│   └── README.md                   Index of docs/
│
├── 📂 .CLAUDE/                     ← CLAUDE-SPECIFIC (May gitignore)
│   ├── instructions.md             (495 lines) Dev workflow
│   ├── memory.md                   (200 lines) Claude's memory
│   └── tasks.md                    (320 lines) Task tracking
│
├── 📄 skills.md                    ← PROJECT PATTERNS
│   └── Reusable code snippets
│
├── 📄 memory.md                    ⚠️  DEPRECATED
│   └── Use .CLAUDE/memory.md instead
│
├── 📄 tasks.md                     ⚠️  DEPRECATED
│   └── Use .CLAUDE/tasks.md instead
│
├── backend/
│   ├── src/
│   ├── test/
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── app/
│   └── package.json
│
└── .gitignore                      (Updated with .CLAUDE/memory.md)
```

---

## 🎯 Who Uses What?

### 👨‍💻 Developers

**Day 1 - Onboarding**:

1. ✅ Read `README.md` (2 min)
2. ✅ Read `docs/architecture.md` (20 min)
3. ✅ Read `.CLAUDE/instructions.md` (15 min)
4. ✅ Setup: `npm install` + `.env` (10 min)
5. ✅ Start coding: `npm run start:dev`

**During Development**:

- Reference `docs/api.md` for endpoint structure
- Follow `.CLAUDE/instructions.md` patterns
- Update docs when you change code

**Before Commit**:

- Check `.CLAUDE/instructions.md` review checklist
- Update relevant documentation
- Commit with semantic message

---

### 🚀 DevOps / Deployment

**Production Setup**:

1. ✅ Read `docs/deployment.md` → Production section
2. ✅ Choose hosting: AWS, DigitalOcean, Railway?
3. ✅ Follow step-by-step guide
4. ✅ Setup CI/CD pipeline
5. ✅ Monitor with logging setup

---

### 🤖 Claude AI (Next Sessions)

**Auto-loads automatically**:

```
Session start:
  ↓
Auto-load: .CLAUDE/memory.md (context remembered)
Auto-load: .CLAUDE/instructions.md (development rules)
Auto-load: .CLAUDE/tasks.md (what's being done)
Auto-load: /home/dip-roy/.claude/projects/.../MEMORY.md (session history)
  ↓
Start working with full context
```

**Uses these files**:

- `docs/architecture.md` → System understanding
- `docs/api.md` → API reference
- `.CLAUDE/instructions.md` → Development patterns
- `skills.md` → Project-specific patterns

---

### 👨‍💼 Project Manager / Tech Lead

**Track Progress**:

- Check `.CLAUDE/tasks.md` → See what phase you're in
- Check `docs/` updated? → Team following standards?
- Check commits → Each with doc updates?

**Review Code**:

- Point to `.CLAUDE/instructions.md` patterns
- Check authorization: `@Roles()` + RLS?
- Check docs updated with changes?

---

## 📋 File Purposes (Quick)

| File                    | Size   | Purpose          | Who Uses          | Git? |
| ----------------------- | ------ | ---------------- | ----------------- | ---- |
| README.md               | 220    | Entry point      | Everyone          | ✅   |
| docs/architecture.md    | 920    | System design    | Devs, Architects  | ✅   |
| docs/api.md             | 1200   | API reference    | Backend, Frontend | ✅   |
| docs/deployment.md      | 608    | Deployment guide | DevOps            | ✅   |
| docs/USAGE_GUIDE.md     | 450    | How to use docs  | Everyone          | ✅   |
| .CLAUDE/instructions.md | 495    | Dev workflow     | Devs, Claude      | ✅   |
| .CLAUDE/memory.md       | 200    | Claude context   | Claude only       | ❌   |
| .CLAUDE/tasks.md        | 320    | Task tracking    | Claude, PM        | ❓   |
| skills.md               | varies | Code patterns    | Devs, Claude      | ✅   |

---

## 🔄 Workflow Example

### Adding New Shipment Endpoint

```
Step 1: Understand System
  └─→ Read docs/architecture.md (Shipments module section)

Step 2: Finding Similar Pattern
  └─→ Check docs/api.md (Look at existing shipment endpoints)

Step 3: Follow Development Guide
  └─→ Read .CLAUDE/instructions.md (Section: Add New Endpoint)
      - Create DTO
      - Add controller method + @Roles()
      - Add service method + WHERE clause
      - Add endpoint to docs/api.md

Step 4: Test Authorization
  └─→ Test with different user roles
      - Customer sees only their shipments
      - Admin sees all
      - Others get 403 Forbidden

Step 5: Commit
  └─→ Git commit with:
      - Code changes
      - Updated docs/api.md
      - Semantic message: "feat(shipments): add new endpoint"

Step 6: Update Tracking
  └─→ .CLAUDE/tasks.md → Mark task as done
  └─→ .CLAUDE/memory.md → Add any new finding
```

---

## ✅ Checklist: Using Docs Properly

### Creating New File/Feature:

- [ ] Check docs/architecture.md (understand structure)
- [ ] Check docs/api.md (follow pattern)
- [ ] Check .CLAUDE/instructions.md (follow dev rules)
- [ ] Add authorization (roles + RLS)
- [ ] Update docs/api.md with new endpoint
- [ ] Test with different roles
- [ ] Commit with semantic message

### Before Production Deployment:

- [ ] Read docs/deployment.md
- [ ] Choose hosting option
- [ ] Setup database
- [ ] Configure SSL/TLS
- [ ] Setup monitoring & logging
- [ ] Test all endpoints
- [ ] Setup CI/CD pipeline

### When Joining Team:

- [ ] Read README.md
- [ ] Read docs/architecture.md
- [ ] Read .CLAUDE/instructions.md
- [ ] Setup `.env` files
- [ ] Run `npm install`
- [ ] Run `npm run start:dev`
- [ ] Check git workflow section

---

## 🚫 What NOT to Do

- ❌ Create `context.md` (use memory.md instead)
- ❌ Store secrets in docs (use .env files)
- ❌ Document hypothetical features (only real ones)
- ❌ Let docs become stale (update with code)
- ❌ Duplicate info across files (link instead)
- ❌ Ignore authorization patterns (CRITICAL)
- ❌ Skip tests before commit (always test)

---

## 🔀 Git Strategy

### What Goes to Git ✅

```
docs/
  ├── architecture.md
  ├── api.md
  └── deployment.md

.CLAUDE/
  ├── instructions.md
  └── tasks.md (optional, helpful for team)

skills.md
README.md
```

### What to Gitignore ❌

```
.CLAUDE/memory.md          # Claude's session memory
.env                       # Secrets
.env.local                 # Local config
node_modules/              # Dependencies
dist/                      # Build output
```

---

## 📞 Quick Links by Need

### "I need to..."

**Understand the overall system**
→ Read `docs/architecture.md`

**Build a new API endpoint**
→ Follow `.CLAUDE/instructions.md` → "Common Tasks" → "Add New Endpoint"

**Find how to call an endpoint**
→ Search `docs/api.md` for endpoint

**Debug authorization issue**
→ Check `.CLAUDE/instructions.md` → "Authorization Pattern"

**Deploy to production**
→ Follow `docs/deployment.md` → "Production Deployment"

**Understand code patterns**
→ Check `skills.md` or `.CLAUDE/instructions.md`

**See what phase we're in**
→ Check `.CLAUDE/tasks.md`

**Get development setup**
→ Follow `.CLAUDE/instructions.md` → "Development Setup"

---

## 📊 Documentation Completeness

```
✅ Architecture          [████████████████████] 100%
   - 12 modules documented
   - Database schema complete
   - Auth flow explained
   - Real-time patterns covered

✅ API Reference         [████████████████████] 100%
   - 51 endpoints documented
   - Request/response examples
   - WebSocket events included
   - Error handling covered

✅ Development Guide     [████████████████████] 100%
   - Setup instructions complete
   - Git workflow defined
   - 5 common tasks with code
   - Authorization patterns documented

✅ Deployment Guide      [████████████████████] 100%
   - Local setup covered
   - Docker setup included
   - Production options detailed
   - Monitoring configured

✅ Task Tracking         [████████████████████] 100%
   - 3 phases completed
   - 5 phases planned
   - Bug tracking active
   - Progress visible
```

---

## 🎓 Learning Path

### New to Project?

```
1. README.md (5 min)
2. docs/architecture.md (30 min)
3. .CLAUDE/instructions.md (30 min)
4. Start with simple task from .CLAUDE/tasks.md
```

### Want to Add Feature?

```
1. Read docs/architecture.md (relevant section)
2. Find similar feature in code
3. Follow .CLAUDE/instructions.md patterns
4. Reference docs/api.md for endpoint structure
5. Update docs when done
```

### Need to Deploy?

```
1. Read docs/deployment.md (Local setup)
2. Test locally with npm run start:dev
3. Read docs/deployment.md (Production section)
4. Choose hosting option
5. Follow step-by-step guide
```

---

## ❓ FAQ

**Q: Do I need to read all docs?**
A: No. Read relevant parts:

- Devs: architecture.md + instructions.md + api.md
- DevOps: deployment.md
- Managers: tasks.md + README.md

**Q: Where's context.md?**
A: Not created - using memory.md instead (same purpose, no confusion)

**Q: Should I commit .CLAUDE/memory.md?**
A: No - it's Claude session data, skip with .gitignore

**Q: What if docs are outdated?**
A: Update them! Docs should always match code

**Q: Can I ignore skills.md?**
A: Recommended to read for project patterns, but optional

**Q: Who updates .CLAUDE/tasks.md?**
A: Claude after each phase, helpful for tracking

---

## 📝 Summary

**3 Key Files to Start**:

1. `README.md` - Overview
2. `docs/architecture.md` - System design
3. `.CLAUDE/instructions.md` - How to develop

**3 Reference Files During Work**:

1. `docs/api.md` - API structure
2. `docs/deployment.md` - Setup/deploy
3. `skills.md` - Code patterns

**2 Tracking Files**:

1. `.CLAUDE/memory.md` - Claude context (auto-loaded)
2. `.CLAUDE/tasks.md` - Phase progress

---

**Status: Complete & Ready to Use! ✅**

Last Updated: 2026-03-19
Next Version: When project structure changes
