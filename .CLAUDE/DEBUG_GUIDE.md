# How to Debug Using .CLAUDE, docs, skills.md

## 🎯 Problem: HTTP://LOCALHOST:5000/DASHBOARD/SHIPMENTS - CUSTOMER ROLE

---

## 📋 Step-by-Step Debug Using Documentation

### Step 1: Understand the Flow

**File to Check**: `.CLAUDE/instructions.md` → "Authorization Pattern (CRITICAL)"

```
Request Flow:
1. Frontend: /dashboard/shipments (page.tsx)
   ↓ (Check: Route exists?)
2. Hook: useShipments() calls shipmentService.getShipments()
   ↓ (Check: API endpoint?)
3. API Call: GET /api/shipments
   ↓ (Check: Authorization header sent?)
4. Backend: @Roles decorator checks if CUSTOMER included
   ↓ (Check: .CLAUDE/instructions.md authorization section)
5. Service: findAll() applies WHERE clause
   ↓ (Check: RLS filter by customerId)
6. Response: filtered shipments
   ↓ (Check: Response format matches docs/api.md)
7. Frontend: Display in table
```

---

### Step 2: Check Frontend Route

**Files to Check**:

- ✅ `docs/architecture.md` → "Available Dashboard Routes" section
- ✅ `.CLAUDE/instructions.md` → "Available Dashboard Routes" section

```bash
# Verify route exists
ls -la "frontend/app/(dashboard)/shipments/page.tsx"

# Expected: File should exist ✅
```

---

### Step 3: Check Sidebar Permission

**File to Check**: `.CLAUDE/instructions.md` → "Frontend Sidebar Navigation (CRITICAL)"

Latest code:

```typescript
{
  href: '/dashboard/shipments',
  label: 'Shipments',
  icon: Package,
  roles: [
    UserRole.CUSTOMER,      // ✅ Customer should be here
    UserRole.MERCHANT,
    UserRole.ADMIN
  ],
}
```

---

### Step 4: Check API Endpoint Authorization

**Files to Check**:

- ✅ `docs/api.md` → Section 12: "Get All Shipments"
- ✅ `.CLAUDE/instructions.md` → "Available Dashboard Routes"

Backend requirement:

```typescript
@Get()
@Roles(
  UserRole.CUSTOMER,        // ✅ Should be present
  UserRole.MERCHANT,
  UserRole.ADMIN,
  UserRole.SUPPORT,
  UserRole.HUB_STAFF,
)
async findAll(...) { }
```

---

### Step 5: Check Service Row-Level Security (RLS)

**File to Check**: `.CLAUDE/instructions.md` → "Authorization Pattern (CRITICAL)"

Service should filter:

```typescript
if (user.role === UserRole.CUSTOMER) {
  where.customerId = user.id; // ✅ Filter by customer id
}
```

---

### Step 6: Check API Response Format

**File to Check**: `docs/api.md` → Section 12: "Get All Shipments"

Expected response:

```json
{
  "data": [
    {
      "id": "uuid",
      "awb": "CSE123456789",
      "customerId": "uuid",
      ...
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

Frontend expects this format in `frontend/src/features/shipments/services/shipment.service.ts`

---

## 🔧 Actual Debug Process

### Check 1: Sidebar Shows Link? (Role-Based)

**Reference**: `.CLAUDE/instructions.md` → Frontend Sidebar Navigation

```bash
# Open browser DevTools
# Check if "Shipments" link appears
# If NO → CUSTOMER role not in navItems roles array
# If YES → Proceed to Check 2
```

---

### Check 2: Click Link - Does Route Load?

**Reference**: `docs/architecture.md` → "Available Dashboard Routes"

```bash
# If 404 error → Route doesn't exist
# If page loads → Proceed to Check 3

# To verify route exists:
ls -la "frontend/app/(dashboard)/shipments/page.tsx"
```

---

### Check 3: Does API Call Get Made?

**Reference**: `docs/api.md` → Section 12

```bash
# Open DevTools → Network tab
# Look for XHR request to: /api/shipments
# Check status code:

200 OK           → Proceed to Check 4
401 Unauthorized → Token expired, re-login
403 Forbidden    → CUSTOMER not in @Roles, check backend
404 Not Found    → Backend endpoint issue
```

---

### Check 4: Does API Return Correct Data?

**Reference**: `docs/api.md` + `.CLAUDE/instructions.md`

```bash
# In DevTools → Network → Click shipments request → Response tab
# Should show:
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": X,
    ...
  }
}

# If wrong format → Check docs/api.md response section
```

---

### Check 5: Does Frontend Display Data?

### Reference\*\*: `.CLAUDE/instructions.md` → "Common Issues & Fixes"

```bash
# If empty list → Check if no shipments created
# If error message → Check browser console for error

# To create test shipment:
# 1. Go to /dashboard/shipments/create
# 2. Fill form and submit
# 3. Should appear in list
```

---

## 📚 Documentation Map

| Issue               | Check File                | Section                       |
| ------------------- | ------------------------- | ----------------------------- |
| "No link visible"   | `.CLAUDE/instructions.md` | Frontend Sidebar Navigation   |
| "404 not found"     | `docs/architecture.md`    | Available Dashboard Routes    |
| "401/403 error"     | `.CLAUDE/instructions.md` | Authorization Pattern         |
| "Empty response"    | `docs/api.md`             | Section 12: Get All Shipments |
| "Wrong data format" | `docs/api.md`             | Response format section       |
| "Type mismatch"     | `skills.md`               | API response types            |

---

## 🎯 Quick Checklist

```bash
☑️ [ ] Sidebar shows "Shipments" link for CUSTOMER?
☑️ [ ] Route /dashboard/shipments loads without 404?
☑️ [ ] DevTools Network shows GET /api/shipments request?
☑️ [ ] Request returns 200 OK status?
☑️ [ ] Response has { data: [], meta: {...} } format?
☑️ [ ] Response contains only CUSTOMER's shipments?
☑️ [ ] Frontend displays shipments in table?
```

---

## 🔍 Real Problem Solving Example

**Scenario**: Customer sees "No shipments" in list

### Solution via Documentation:

1. **Check Role Authorization**

   ```
   .CLAUDE/instructions.md → Authorization Pattern

   Verify: UserRole.CUSTOMER in @Roles decorator
   ```

2. **Check Row-Level Security**

   ```
   .CLAUDE/instructions.md → "Implementation Checklist"

   Verify: Service filters by customerId
   ```

3. **Check Data Exists**

   ```
   docs/api.md → Create Shipment endpoint

   Create a test shipment first
   ```

4. **Check Response Format**

   ```
   docs/api.md → Section 12

   Verify response matches { data: [...] } format
   ```

5. **Check Frontend Query**

   ```
   skills.md → API response types

   Verify useShipments hook proper
   ```

---

## 💡 Using skills.md for Custom Patterns

Check `skills.md` for project-specific patterns:

```bash
# What you might find:
- RBAC pattern (controller + service level)
- Response format conventions
- Error handling patterns
- Cache key patterns
- Query builder patterns
```

---

## ✨ Final Debugging Template

When debugging `/dashboard/shipments` with CUSTOMER role:

```markdown
# Debug Template

Date: YYYY-MM-DD
Issue: [Describe problem]

## Stack Trace

[Error message or behavior]

## Documentation Checked

- [ ] .CLAUDE/instructions.md (Authorization section)
- [ ] docs/architecture.md (Routes section)
- [ ] docs/api.md (Shipments section)
- [ ] skills.md (Patterns)

## Found Root Cause

[What was wrong]

## Solution Applied

[How fixed based on docs]

## Reference

[Which doc section helped]
```

---

## 📞 Still Not Working?

1. **Check .CLAUDE/DEBUG_SHIPMENTS.md** - Full analysis of this route
2. **Check docs back** down the list for YOUR specific error
3. **Cross-reference with skills.md** for pattern matching
4. Create issue with this debug template

---

**Remember**: All documentation is interconnected. Use them together:

- `.CLAUDE/` = HOW to do things
- `docs/` = WHAT the system does
- `skills.md` = PATTERNS used
