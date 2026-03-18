# Courier Service - Project Memory

## Project Overview

**Courier Service** is a monorepo courier/delivery management system with NestJS backend and Next.js frontend, currently in active development on the `dev` branch.

**Tech Stack**:

- Backend: NestJS 11, PostgreSQL, TypeORM, Socket.IO, JWT
- Frontend: Next.js 16, React 19, Tailwind CSS, React Query, Zustand

## Critical Architecture Patterns

### 1. RBAC + Row-Level Security (MUST KNOW)

**Controller Level**:

```typescript
@Get()
@Roles(UserRole.CUSTOMER, UserRole.MERCHANT, UserRole.ADMIN)
findAll() { ... }
```

**Service Level (Row-Level Filtering)**:

```typescript
if (user.role === UserRole.CUSTOMER) {
  where.customerId = user.id; // Filter by customer
} else if (user.role === UserRole.MERCHANT) {
  where.merchantId = user.id; // Filter by merchant
}
// ADMIN sees all (no where clause)
```

**Implementation Pattern**:

1. ✅ Add `@Roles()` decorator to controller
2. ✅ Add WHERE clause filter in service
3. ✅ Test with different user roles
4. ✅ Verify data isolation

### 2. Module Organization (Feature-Based)

- Backend: 12 modules (Auth, Users, Shipments, Tracking, Rider, Hub, Payments, Notifications, SLA, Pickup, Audit, Cache)
- Frontend: 11 feature folders (auth, shipments, tracking, payments, notifications, rider, hub, analytics, orders, users, pickups)

### 3. API Architecture

- **Base URL**: All endpoints prefixed with `/api` (set in `backend/src/main.ts`)
- **Authentication**: JWT Bearer token in Authorization header
- **Pagination**: Default 20 items/page, `?page=1&limit=20`
- **Response Format**: `{ data: [], total: 0, page: 1, limit: 20 }`

### 4. Real-time Communication (Socket.IO)

**Backend (Emit to specific user)**:

```typescript
io.to(userId).emit('shipment:update', data);
```

**Frontend (Listen)**:

```typescript
socket.on('shipment:update', (data) => {
  queryClient.setQueryData(['shipment', data.id], data);
});
```

### 5. Frontend State Management

- **Auth**: Zustand store (`useAuthStore`)
- **API Data**: React Query with `useQuery` and `useMutation`
- **UI State**: Zustand or React Context
- **Notifications**: Zustand store (`useNotificationStore`)

## Critical File Locations

### Backend

- `backend/src/main.ts` - Bootstrap, CORS, global configuration
- `backend/src/guards/roles.guard.ts` - RBAC implementation (READ FIRST)
- `backend/src/decorators/roles.decorator.ts` - Role decorator
- `backend/src/modules/*/feature.controller.ts` - Where to add `@Roles()`
- `backend/src/modules/*/feature.service.ts` - Where to add row-level filtering

### Frontend

- `frontend/src/common/lib/api.ts` - Axios client with JWT interceptors
- `frontend/src/common/components/layout/Sidebar.tsx` - Navigation (role-based filtering)
- `frontend/src/common/hooks/useAuthStore.ts` - Auth state management
- `frontend/src/features/*/*/feature.service.ts` - API service calls

## Role Hierarchy

```
ADMIN (highest)
├── All features
└── No row-level filtering (sees everything)

MERCHANT/SUPPORT
├── Own data only
└── Filter by merchantId/userId

CUSTOMER/RIDER/HUB_STAFF
├── Own data only
└── Filter by customerId/riderId/hubId
```

## Common Errors & Fixes

| Error                         | Cause                   | Fix                                              |
| ----------------------------- | ----------------------- | ------------------------------------------------ |
| 403 Forbidden                 | Missing `@Roles()`      | Add `@Roles(UserRole.CUSTOMER, ...)` to endpoint |
| User sees other's data        | Missing RLS in service  | Add WHERE clause: `where.customerId = user.id`   |
| 404 on link                   | Route doesn't exist     | Create page in `app/(dashboard)/` or remove link |
| WebSocket events not received | Not subscribed to event | Use `io.to(userId).emit()` not broadcast         |
| API mismatch                  | Wrong endpoint path     | Check `docs/api.md` for correct path             |

## Database Notes

- **Migrations**: `npm run migration:generate` and `npm run migration:run`
- **Indexed columns**: userId, shipmentId, awb, customerId, merchantId
- **Pagination**: Always use `skip` and `take` in TypeORM queries
- **Relationships**: All defined in entity files

## Environment Setup

### Backend (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=courier_service
JWT_SECRET=min-32-chars-long-string
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Git Workflow

- **Main Branch**: Production code (don't work here)
- **Dev Branch**: Development (default for PRs)
- **Feature Branches**: `feature/feature-name` from dev
- **Commit Messages**: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`

## Testing Commands

```bash
# Backend
npm test                    # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov           # Coverage

# Frontend
npm run build              # Check for errors
npm run lint:fix           # Auto-fix linting
```

## 51 API Endpoints Summary

**Auth** (6): Login, signup, refresh, OTP generate, OTP verify, logout
**Users** (5): Get me, update profile, list users, get user, deactivate
**Shipments** (9): CRUD, bulk upload, by-status, statistics, pagination
**Tracking** (3): Get tracking, detailed history, update location
**Rider** (6): Profile, manifests, manifest details, verify OTP, location, status
**Hub** (5): Manifests, create manifest, inbound scan, outbound scan, hub details
**Payments** (6): Transactions, create payment, COD, payouts, payout request
**Notifications** (4): Get notifications, unread count, mark read, send
**Pickup** (2): Request pickup, get requests
**SLA** (3): Metrics, breaches, shipment SLA
**Audit** (2): Audit logs, user activity

## Quick Links

- **Documentation**: See `docs/` folder
- **API Reference**: `docs/api.md` (all 51 endpoints)
- **Architecture**: `docs/architecture.md` (system design)
- **Development**: `.CLAUDE/instructions.md` (setup & tasks)
- **Deployment**: `docs/deployment.md` (production guide)
- **Swagger**: `http://localhost:3001/api/docs` (development)

## Current Status (2026-03-19)

✅ Complete documentation created
✅ All 12 backend modules documented
✅ All 11 frontend features documented
✅ 51 API endpoints with examples
✅ Authorization patterns enforced
✅ Dashboard 404 issues fixed
✅ Sidebar role-based navigation working
✅ Database schema verified
✅ Tests passing (44/44)
