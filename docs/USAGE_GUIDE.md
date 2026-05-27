# Documentation & Resources - Usage Guide

## Folder Structure & Purpose

```
courier-service/
│
├── docs/                          ← PUBLIC Documentation (Git committed)
│   ├── architecture.md            # System design, modules, database
│   ├── api.md                     # 51 API endpoints reference
│   ├── deployment.md              # Setup & deployment guide
│   └── README.md (inside docs)    # Documentation index
│
├── .CLAUDE/                       ← CLAUDE-SPECIFIC (Git ignored or committed)
│   ├── instructions.md            # Development instructions
│   ├── memory.md                  # Quick reference for Claude
│   ├── tasks.md                   # Development task tracking
│   └── context.md                 # (NOT creating - use memory instead)
│
├── skills.md                      ← PROJECT SKILLS REFERENCE (Git committed)
│
└── README.md                      ← Main entry point with links
```

---

## Who Uses What?

### 👥 **DEVELOPERS & TEAM**

**Read these files:**

- ✅ `docs/architecture.md` - Understand system design
- ✅ `docs/api.md` - API endpoint reference
- ✅ `docs/deployment.md` - Setup & deploy
- ✅ `.CLAUDE/instructions.md` - Development workflow
- ✅ `skills.md` - Project-specific patterns

**Don't need:**

- ❌ `memory.md` - Claude's notes, not for humans
- ❌ `tasks.md` - Internal tracking, skip if you want

---

### 🤖 **CLAUDE AI** (In Future Sessions)

**Auto-loads & uses:**

- ✅ `.CLAUDE/memory.md` - Persists across sessions
- ✅ `.CLAUDE/instructions.md` - Development guidelines
- ✅ `.CLAUDE/tasks.md` - Task status
- ✅ `docs/` folder - For reference when needed

**Your auto-memory also loads:**

- ✅ `/home/dip-roy/.claude/projects/-home-dip-roy-courier-service/memory/MEMORY.md`

---

## File Purposes in Detail

### 📂 `docs/` Folder (PUBLIC - Version Controlled)

#### `docs/architecture.md` (920 lines)

**Purpose**: System overview & design decisions
**For WHO**: Architects, senior devs, onboarding
**Content**:

- Monorepo structure
- 12 backend modules explained
- 11 frontend features explained
- Database schema & relationships
- Auth & authorization flow
- Real-time communication patterns

**How to use**:

```bash
# Read this first when joining project
# Reference when adding new modules
# Share with stakeholders
```

---

#### `docs/api.md` (1200 lines)

**Purpose**: Complete API reference
**For WHO**: Frontend devs, backend devs, API consumers
**Content**:

- 51 endpoints with examples
- Request/response samples
- Authentication methods
- Rate limiting & pagination
- WebSocket events
- cURL examples

**How to use**:

```bash
# Copy-paste endpoint structure
# Test with cURL examples
# Reference when integrating with frontend
```

---

#### `docs/deployment.md` (608 lines)

**Purpose**: Deployment & DevOps guide
**For WHO**: DevOps engineers, deployment specialists
**Content**:

- Local setup (step-by-step)
- Docker & Docker Compose
- Production hosting options
- Database setup & backups
- CI/CD pipeline
- Monitoring & logging

**How to use**:

```bash
# Follow for local development
# Use for production deployment
# Reference for troubleshooting
```

---

### 📋 `.CLAUDE/` Folder (CLAUDE-SPECIFIC - May be gitignored)

#### `.CLAUDE/instructions.md` (495 lines)

**Purpose**: Development workflow & patterns
**For WHO**: Claude AI (& developers who want to follow same patterns)
**Content**:

- Quick start guide
- Git workflow
- 5 common tasks with code
- Authorization patterns (CRITICAL)
- Common issues & fixes
- Environment variables
- Code quality checklist

**How to use**:

```bash
# Claude reads this automatically in future sessions
# Developers can follow same patterns
# Reference for PR reviews
```

---

#### `.CLAUDE/memory.md` (200 lines)

**Purpose**: Claude's persistent memory across sessions
**For WHO**: Claude AI only
**Content**:

- Critical architecture patterns
- File locations (backend & frontend)
- Role hierarchy
- Common errors & fixes
- Quick links & status

**How Claude uses**:

```
Session 1: Creates/reads memory.md
  ↓
Session 2: Auto-loads memory.md → knows context instantly
  ↓
Session 3: Updates memory with new findings
```

---

#### `.CLAUDE/tasks.md` (320 lines)

**Purpose**: Development task tracking & progress
**For WHO**: Claude AI & project managers
**Content**:

- Active phase status
- Completed phases
- Upcoming tasks (8 phases)
- Bug tracking
- Testing status
- Performance metrics
- Version history

**How to use**:

```bash
# Claude updates after each phase
# PM checks status via this file
# Track progress over time
```

---

### 📄 `skills.md` (ROOT LEVEL)

**Purpose**: Project-specific skill patterns
**For WHO**: Claude AI when working on specialized tasks
**Content**:

- Custom patterns used in this project
- Reusable code snippets
- Project conventions
- Common gotchas

**Currently**: You already have one - it's from previous sessions

---

## Git Strategy

### What to Commit ✅

```bash
docs/
  ├── architecture.md        ✅ YES - Team reference
  ├── api.md                 ✅ YES - API contract
  └── deployment.md          ✅ YES - Deployment guide

.CLAUDE/
  ├── instructions.md        ✅ YES - Development standards
  ├── memory.md              ⚠️  OPTIONAL - If team wants context
  └── tasks.md               ⚠️  OPTIONAL - For PM tracking

skills.md                    ✅ YES - Project patterns
README.md                    ✅ YES - Entry point
```

### What to Gitignore ❌

```bash
# Add to .gitignore
.CLAUDE/memory.md             # Claude's persistent session memory
.CLAUDE/context.md            # Not needed - use memory instead
.env                          # Secrets
.env.local
```

---

## Usage Workflow

### Scenario 1: New Developer Joins

```
Developer:
1. Reads README.md → Overview
2. Reads docs/architecture.md → System design
3. Reads .CLAUDE/instructions.md → Development setup
4. Runs `npm run start:dev` → Start coding
```

---

### Scenario 2: Claude Continues Work (Next Session)

```
Claude:
1. Auto-loads .CLAUDE/memory.md → Remembers context
2. Auto-loads .CLAUDE/instructions.md → Knows patterns
3. Auto-loads .CLAUDE/tasks.md → Knows what's being done
4. Auto-loads auto-memory (at /home/dip-roy/.claude/...) → Session history
5. Starts working → Built-in context preserved
```

---

### Scenario 3: Adding New API Endpoint

```
Developer:
1. Check docs/api.md → Find similar endpoint
2. Follow .CLAUDE/instructions.md → "Add New Endpoint" section
3. Add @Roles() decorator → Controller
4. Add WHERE clause → Service
5. Test → Run tests
6. Update docs/api.md → Document endpoint
7. Commit → Include doc update
```

---

### Scenario 4: Deploying to Production

```
DevOps Engineer:
1. Read docs/deployment.md → Choose hosting option
2. Follow step-by-step guide → Deploy backend
3. Update environment variables → Configure
4. Monitor health → Check endpoints
```

---

## File Relationships

```
README.md (ENTRY POINT)
    ↓
    ├──→ docs/architecture.md (System Design)
    │        ├──→ docs/api.md (Implementation)
    │        └──→ .CLAUDE/instructions.md (Development)
    │
    ├──→ docs/deployment.md (Operations)
    │
    └──→ .CLAUDE/memory.md (Claude Context - Hidden)
```

---

## When to Update Each File

### Update `docs/architecture.md` when:

- ✏️ Adding new module/feature
- ✏️ Changing database schema
- ✏️ Changing auth flow
- ✏️ Adding new Socket.IO events

### Update `docs/api.md` when:

- ✏️ Adding new endpoint
- ✏️ Changing endpoint behavior
- ✏️ Adding new error scenario
- ✏️ Changing response format

### Update `.CLAUDE/instructions.md` when:

- ✏️ Discovering new pattern
- ✏️ Finding better development practice
- ✏️ Adding new troubleshooting tip
- ✏️ Changing git workflow

### Update `docs/deployment.md` when:

- ✏️ Changing deployment process
- ✏️ Adding new hosting option
- ✏️ Changing environment variables
- ✏️ Adding monitoring tool

### Update `.CLAUDE/memory.md` when:

- ✏️ Claude finds important pattern
- ✏️ Critical bug fix applied
- ✏️ Architecture decision made
- ✏️ Updated status/findings

### Update `.CLAUDE/tasks.md` when:

- ✏️ Completing a phase
- ✏️ Finding new issue
- ✏️ Updating progress
- ✏️ Adding new task

---

## File Size & Maintenance

| File            | Lines  | Update Freq  | Who Updates | Git?   |
| --------------- | ------ | ------------ | ----------- | ------ |
| architecture.md | 920    | Quarterly    | Senior Dev  | ✅ YES |
| api.md          | 1200   | Per endpoint | Dev Team    | ✅ YES |
| deployment.md   | 608    | Annually     | DevOps      | ✅ YES |
| instructions.md | 495    | Monthly      | Claude/Dev  | ✅ YES |
| memory.md       | 200    | Per session  | Claude      | ❓ OPT |
| tasks.md        | 320    | Per phase    | Claude/PM   | ❓ OPT |
| skills.md       | varies | Quarterly    | Claude/Dev  | ✅ YES |

---

## Best Practices

### ✅ DO

- Keep docs **updated with code changes**
- Use **examples** in documentation
- Link between files when relevant
- **Version control** public documentation
- Update **when you learn something new**

### ❌ DON'T

- Let docs become **stale/outdated**
- Write docs **without code examples**
- Duplicate information across files
- Put **secrets in docs**
- Document **hypothetical features**

---

## Quick Links for Common Tasks

### For Developers

- **Getting started**: `docs/architecture.md` + `.CLAUDE/instructions.md`
- **Building endpoint**: `.CLAUDE/instructions.md` (section: Common Tasks)
- **API reference**: `docs/api.md` (find similar endpoint)
- **Authorization issues**: `.CLAUDE/instructions.md` (section: Authorization Pattern)
- **Debugging**: `.CLAUDE/instructions.md` (section: Common Issues & Fixes)

### For DevOps

- **Local setup**: `docs/deployment.md` (section: Local Development)
- **Production**: `docs/deployment.md` (section: Production Deployment)
- **Monitoring**: `docs/deployment.md` (section: Monitoring & Logging)
- **Troubleshooting**: `docs/deployment.md` (section: Common Issues)

### For Claude (Future)

- **Context**: `.CLAUDE/memory.md`
- **Development Standards**: `.CLAUDE/instructions.md`
- **Task Status**: `.CLAUDE/tasks.md`
- **Session History**: `/home/dip-roy/.claude/projects/.../memory/MEMORY.md`

---

## Why NOT Create context.md?

**Problem with context.md**:

- ❌ Duplicate of memory.md
- ❌ Confusing which one to read
- ❌ Extra file to maintain
- ❌ Claude already has auto-memory system

**memory.md Solution**:

- ✅ Single source of truth
- ✅ Already structured for Claude
- ✅ Persists across sessions
- ✅ Less confusion

---

## Checklist: Using These Docs Properly

### Before Starting Work:

- [ ] Read relevant section in `docs/architecture.md`
- [ ] Check `.CLAUDE/instructions.md` for patterns
- [ ] Look for similar implementation in code
- [ ] Check `docs/api.md` for endpoint structure

### While Working:

- [ ] Follow patterns from `instructions.md`
- [ ] Test authorization (roles + RLS)
- [ ] Update relevant docs
- [ ] Reference examples from `docs/api.md`

### Before Committing:

- [ ] Run linting & tests
- [ ] Updated docs if changed behavior
- [ ] Commit message follows convention
- [ ] No sensitive data in docs

### After Completing Phase:

- [ ] Update `.CLAUDE/tasks.md`
- [ ] Update `.CLAUDE/memory.md` with findings
- [ ] Commit all documentation changes

---

## Summary

| Need                    | File                                      | Content                      |
| ----------------------- | ----------------------------------------- | ---------------------------- |
| Understand system?      | `docs/architecture.md`                    | How everything fits together |
| Build endpoint?         | `docs/api.md` + `.CLAUDE/instructions.md` | Examples + patterns          |
| Deploy app?             | `docs/deployment.md`                      | Step-by-step guides          |
| Know project standards? | `.CLAUDE/instructions.md`                 | Development rules            |
| Fix authorization?      | `.CLAUDE/instructions.md`                 | RBAC + RLS patterns          |
| Continue next session?  | `.CLAUDE/memory.md`                       | Claude's context             |
| Track progress?         | `.CLAUDE/tasks.md`                        | What's been done             |

---

**Remember**: These docs are **living documents** - update them as you learn and discover better patterns!
