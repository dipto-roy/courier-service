# FastX Courier Service — CLAUDE.md

## Project Overview

Full-stack courier service platform. NestJS backend + Next.js 14 (App Router) frontend. 8 user roles.

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | NestJS, TypeORM, PostgreSQL, Redis (Bull queues), Socket.IO |
| Frontend | Next.js 14 (App Router), Zustand, React Query, shadcn/ui, Tailwind |
| Auth | JWT (access + refresh), localStorage + `fastx_logged_in` cookie for middleware |
| Realtime | Socket.IO gateway (`tracking.gateway.ts`) |

## Roles

`ADMIN`, `MERCHANT`, `AGENT`, `HUB_STAFF`, `RIDER`, `CUSTOMER`, `FINANCE`, `SUPPORT`

Defined in `backend/src/common/enums/user-role.enum.ts`.

## Repository Layout

```
courier-service/
├── backend/           NestJS API (port 3001)
│   └── src/
│       ├── common/    Guards, decorators, filters, middleware
│       ├── csrf/      CSRF token endpoint + service
│       ├── entities/  TypeORM entities
│       ├── migrations/ TypeORM migrations
│       └── modules/   Feature modules (auth, shipments, tracking, ...)
├── frontend/          Next.js app (port 3000)
│   └── app/           App Router pages
│       ├── (auth)/    login, signup, verify-otp
│       └── (dashboard)/ Protected dashboard routes
│   └── src/
│       ├── common/    Shared components, hooks, lib, types
│       └── features/  Feature slices (auth, shipments, hub, ...)
└── docs/              Architecture, API reference, deployment guide
```

## Key Conventions

- All API guards applied globally: `JwtAuthGuard` + `ThrottlerGuard` via `APP_GUARD`
- Mark public endpoints with `@Public()` decorator
- Mark role-restricted endpoints with `@Roles(UserRole.X)` + `RolesGuard`
- Frontend auth: Zustand store + localStorage. `fastx_logged_in` cookie enables server-side middleware redirect
- Immutable data patterns — no mutation of existing objects
- Functions < 50 lines, files < 800 lines

## Environment

- Backend `.env` template: `backend/.env.example` (port 3001)
- Frontend `.env.local` template: `frontend/.env.example` (API URL → port 3001)

## Running Locally

```bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev
```

Requires: PostgreSQL (port 5432), Redis (port 6379).

## Testing

```bash
cd backend && npm run test        # unit tests
cd backend && npm run test:e2e    # e2e tests
```

Target: 80% coverage minimum.

## Documentation

- `docs/architecture.md` — system design
- `docs/api.md` — API endpoint reference
- `docs/deployment.md` — deployment guide
- `backend-doc.md` — backend implementation detail (legacy, may overlap with docs/)
- `frontend-doc.md` — frontend implementation detail (legacy)
