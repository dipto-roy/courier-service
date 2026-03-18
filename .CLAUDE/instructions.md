# Courier Service - Development Instructions

## Project Overview

Courier Service is a monorepo containing:

- **Backend**: NestJS REST API with WebSocket support
- **Frontend**: Next.js Dashboard application

Both are in active development on the `dev` branch.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (for backend)
- Any code editor (VS Code recommended)

### Quick Start

```bash
# Backend setup
cd backend
npm install
cp .env.example .env
npm run start:dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

## Project Structure & Key Files

### Backend Critical Paths

```
backend/src/
├── main.ts                 # Bootstrap & global configuration
├── app.module.ts           # Root module with all imports
├── entities/               # All database entities
├── modules/                # Feature modules (12 total)
├── guards/roles.guard.ts   # RBAC authorization
├── decorators/roles.decorator.ts  # Role decorator
└── data-source.ts          # TypeORM configuration
```

### Frontend Critical Paths

```
frontend/src/
├── common/
│   ├── lib/
│   │   ├── api.ts         # Axios client setup
│   │   ├── queryClient.ts # React Query config
│   │   └── socket.ts      # Socket.IO setup
│   ├── components/layout/
│   │   └── Sidebar.tsx    # Main navigation (ROLE-BASED)
│   └── hooks/
│       └── useAuthStore.ts # Auth state management
├── features/              # Feature modules (11 total)
└── (dashboard)/           # Dashboard route group
```

**Available Dashboard Routes:**
```
✅ /dashboard                      (everyone)
✅ /dashboard/shipments            (CUSTOMER, MERCHANT, ADMIN)
✅ /dashboard/payments             (CUSTOMER, MERCHANT, ADMIN)
✅ /dashboard/notifications        (everyone)
✅ /dashboard/rider                (RIDER, ADMIN only)
✅ /dashboard/hub                  (HUB_STAFF, ADMIN only)
✅ /dashboard/analytics            (MERCHANT, ADMIN, HUB_STAFF only)

❌ /dashboard/users                (DOES NOT EXIST - route not created)
   → If needed, create: frontend/app/(dashboard)/users/page.tsx
```

## Git Workflow

### Branches

- **main**: Production-ready code (don't work here)
- **dev**: Development branch (default, PRs go here)
- **feature/name**: Feature branches (created from dev)

### Recommended Workflow

```bash
# 1. Switch to dev
git checkout dev
git pull origin dev

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes and test locally
npm run lint
npm run test

# 4. Commit with semantic messages
git commit -m "feat: description of feature"

# 5. Push and create PR to dev
git push origin feature/your-feature-name
```

### Commit Message Format

```
feat: Add new feature
fix: Fix a bug
refactor: Restructure code
docs: Update documentation
test: Add or update tests
chore: Update dependencies or config

Example:
feat(shipments): add bulk upload functionality
```

## Common Development Tasks

### 1. Add New Endpoint

**Backend**:

1. Create DTOs in `modules/feature/dto/`
2. Add controller endpoint in `modules/feature/feature.controller.ts`
3. Implement service logic in `modules/feature/feature.service.ts`
4. Add/update entity if needed in `entities/`
5. Add authorization: `@Roles(UserRole.CUSTOMER, ...)`

**Frontend** (if needed):

1. Create service in `services/feature/feature.service.ts`
2. Add component in `features/feature/components/`
3. Update API client with new endpoint call

### 2. Modify Authorization Rules

**Key File**: `backend/src/modules/*/feature.controller.ts`

```typescript
// Add role access
@Get()
@Roles(UserRole.CUSTOMER, UserRole.MERCHANT, UserRole.ADMIN)
findAll() { ... }

// Service-level row-level security:
// Filter results by userId/customerId/merchantId in service
```

### 3. Update Database Schema

```bash
cd backend

# Generate migration
npm run migration:generate -- -n YourMigrationName

# Review the migration file in src/migrations/

# Run migration
npm run migration:run

# Revert if needed
npm run migration:revert
```

### 4. Add Frontend Component

```typescript
// File: frontend/src/features/shipments/components/ShipmentItem.tsx
import { useQuery } from '@tanstack/react-query'
import { shipmentService } from '../services/shipment.service'

export function ShipmentItem({ id }) {
  const { data, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => shipmentService.getShipmentById(id),
  })

  if (isLoading) return <div>Loading...</div>
  return <div>{data?.awb}</div>
}
```

### 5. Work with Real-time Updates

**Backend** (Socket.IO Gateway):

```typescript
// Emit from controller/service
this.io.to(userId).emit('shipment:update', data);
```

**Frontend** (Subscribe):

```typescript
// File: frontend/src/services/notifications/hooks/useNotificationSocket.ts
socket.on('shipment:update', (data) => {
  queryClient.setQueryData(['shipment', data.id], data);
});
```

## Authorization Pattern (CRITICAL)

### Role Hierarchy

```
ADMIN (highest)
├── Can access everything
└── No row-level filtering

MERCHANT/SUPPORT
├── See their own data
└── Service filters by userId/merchantId

CUSTOMER/RIDER/HUB_STAFF
├── See their own data
└── Service filters by userId/customerId/riderId/hubId
```

### Implementation Checklist

When adding a new endpoint:

1. ✅ Add `@Roles()` decorator to controller
2. ✅ Add row-level security in service (WHERE clause)
3. ✅ Test with different user roles
4. ✅ Verify customer only sees their data

**Example** (shipments.service.ts):

```typescript
async findAll(user: User, filters: any) {
  const where: FindOptionsWhere<Shipment> = {}

  if (user.role === UserRole.CUSTOMER) {
    where.customerId = user.id  // Filter by customer
  } else if (user.role === UserRole.MERCHANT) {
    where.merchantId = user.id   // Filter by merchant
  }
  // ADMIN sees all (no where clause)

  return this.shipmentRepo.find({ where })
}
```

## Frontend Sidebar Navigation (CRITICAL)

**File**: `frontend/src/common/components/layout/Sidebar.tsx`

```typescript
const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    roles: [UserRole.CUSTOMER, UserRole.MERCHANT, UserRole.ADMIN],
  },
  // ... only visible to specified roles
];

// Inside component:
const user = useAuthStore((state) => state.user);
const filteredItems = navItems.filter(
  (item) => !item.roles || item.roles.includes(user?.role),
);
```

## Common Issues & Fixes

### Issue 1: 403 Forbidden on Endpoint

**Cause**: Missing `@Roles()` decorator in controller
**Fix**: Add `@Roles(UserRole.YOUR_ROLE)` to the endpoint

### Issue 2: User Sees Data from Other Users

**Cause**: Missing row-level filtering in service
**Fix**: Add WHERE clause to filter by userId/customerId in service

### Issue 3: Frontend Link Returns 404

**Cause**: Route doesn't exist in `app/(dashboard)/` directory
**Fix**: Create the page file or remove the link from Sidebar

### Issue 4: WebSocket Events Not Received

**Cause**: Not subscribed to correct event or room
**Fix**: Ensure `socket.emit('subscribe:...')` or `io.to(userId).emit()`

## Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm test

# Test specific file
npm test -- notifications.service

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend Testing (planned)

```bash
cd frontend

# Component tests
npm run test

# E2E tests with Playwright
npm run test:e2e
```

## Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=courier_service

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Socket.IO
SOCKET_IO_PORT=3002
CORS_ORIGIN=http://localhost:5000

# Email (future)
MAIL_HOST=smtp.example.com
MAIL_USER=noreply@example.com
MAIL_PASSWORD=password

# Node environment
NODE_ENV=development
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Code Quality

### Pre-commit Checks

```bash
# Frontend
cd frontend
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code

# Backend
cd backend
npm run lint         # Check linting
npm run format       # Format code
```

### Keep Code Clean

1. **Don't leave console.log** in production code
2. **Use meaningful variable names** (not `x`, `temp`, `data`)
3. **Add comments** for complex logic only
4. **Remove unused imports** (run lint --fix)
5. **Handle errors** at API boundaries, not everywhere

## Performance Tips

### Backend

- Use pagination: `?page=1&limit=20`
- Index frequently queried fields (userId, shipmentId, awb)
- Use Redis for caching hot data
- Batch database queries where possible

### Frontend

- Use React Query for caching
- Lazy load routes: `dynamic(() => import(...))`
- Optimize images with Next.js `Image` component
- Avoid unnecessary re-renders with `memo()` and `useCallback()`

## Documentation

- **API Docs**: Read `docs/api.md` for all endpoints
- **Architecture**: Read `docs/architecture.md` for system design
- **Swagger UI**: http://localhost:3001/api/docs (development)

## Review Checklist

Before committing code:

- [ ] Code builds without errors
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] Authorization is enforced (roles + RLS)
- [ ] No console.log statements left
- [ ] Commit message follows convention
- [ ] Updated related documentation

## Useful Commands

```bash
# Backend
npm run start:dev          # Dev with hot reload
npm run build              # Compile TypeScript
npm test                   # Run unit tests
npm run migration:generate # Create DB migration
npm run migration:run      # Apply migrations

# Frontend
npm run dev                # Dev server on :5000
npm run build              # Build for production
npm run lint:fix           # Fix linting issues
npm run format             # Format code

# Git
git checkout dev                 # Use dev branch
git pull origin dev              # Get latest dev
git checkout -b feature/name     # Create feature branch
git push origin feature/name     # Push branch
```

## Getting Help

1. Check `docs/architecture.md` for system overview
2. Check `docs/api.md` for endpoint details
3. Search for similar implementations in codebase
4. Check git history: `git log --oneline | grep keyword`
5. Review pull request comments in GitHub

## Onboarding New Features

When adding a major feature:

1. Create feature branch: `git checkout -b feature/feature-name`
2. Plan: Create `docs/feature-NAME.md` with design
3. Backend: Create module structure
4. Frontend: Create component structure
5. Tests: Add unit and E2E tests
6. Docs: Update `docs/api.md` and `docs/architecture.md`
7. PR: Submit with detailed description
8. Review: Address feedback
9. Merge: Squash merge to keep history clean

## Deployment

### Backend Deployment

```bash
cd backend
npm run build
npm run migration:run
npm run start:prod
```

### Frontend Deployment (Vercel)

```bash
cd frontend
npm run build
# Commit and push to main
# Vercel auto-deploys
```

## Database Backup & Restore

```bash
# Backup
pg_dump courier_service > backup.sql

# Restore
psql courier_service < backup.sql
```

## Debugging Tips

### Backend Debugging

```bash
# VS Code debug config in .vscode/launch.json
npm run start:debug

# Check logs
tail -f logs/app.log
```

### Frontend Debugging

```bash
# React DevTools Chrome extension
# Set breakpoints in VS Code when running with debugger

# Check Network tab in Chrome DevTools for API calls
# Check Console for frontend errors
```

## Memory for Future Sessions

Key architectural patterns used:

- **RBAC + RLS**: Authorization at controller + service level
- **Feature-based structure**: Modules organized by feature, not by layer
- **React Query + Zustand**: Data fetching + state management
- **Socket.IO**: Real-time updates via WebSocket
- **TypeORM**: Type-safe database queries

Critical files to understand first:

1. `backend/src/main.ts` - Bootstrap and global settings
2. `backend/src/guards/roles.guard.ts` - Authorization logic
3. `frontend/src/common/lib/api.ts` - API client setup
4. `frontend/src/common/components/layout/Sidebar.tsx` - Navigation
