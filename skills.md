# FastX Courier Service — Skills & Technologies

## Project Overview

**FastX Courier** is a production-ready, full-stack courier management system built for Bangladesh's logistics industry. It handles end-to-end shipment lifecycle — from pickup request to delivery — with real-time tracking, role-based access, dynamic pricing, payments, notifications, and SLA monitoring.

---

## Backend Skills & Technologies

### Core Framework

- **NestJS v11** — Modular, enterprise-grade Node.js framework with dependency injection, decorators, and a layered architecture (Controller → Service → Repository)
- **TypeScript v5** — Strict typing across the entire backend codebase

### Database & ORM

- **PostgreSQL** — Relational database with UUID primary keys, enum columns, indexing, decimal precision, and soft deletes
- **TypeORM v0.3** — Entity-based ORM with repository pattern, relations (OneToMany, ManyToOne), migrations, data-source configuration, and query builders

### Authentication & Security

- **JWT (JSON Web Tokens)** — Access token + refresh token flow via `@nestjs/jwt` and `passport-jwt` strategy
- **OTP Verification** — Email-based OTP generation, expiry management, and verification
- **Bcrypt** — Secure password hashing
- **CSRF Protection** — Custom CSRF middleware with token-based validation
- **CORS** — Configurable origin whitelisting with credentials support
- **Rate Limiting** — `@nestjs/throttler` for API request throttling
- **Role-Based Access Control (RBAC)** — Custom guards and decorators (`@Roles`) for 8 user roles: Admin, Merchant, Agent, Hub Staff, Rider, Customer, Finance, Support

### Real-Time Communication

- **WebSockets (Socket.IO)** — `@nestjs/websockets` with dedicated tracking gateway for live shipment updates, GPS location streaming, and rider tracking
- **Redis Pub/Sub** — Real-time event broadcasting across service instances via `ioredis`

### Caching & Queues

- **Redis** — In-memory caching layer with TTL management, pub/sub clients, and connection retry strategies
- **Bull Queue** — `@nestjs/bull` for asynchronous job processing (notifications, SLA checks)

### Notification System

- **Email** — Nodemailer with SMTP transport and HTML template rendering
- **SMS** — Multi-provider SMS gateway (Twilio, SSL Wireless, local BD providers)
- **Push Notifications** — Pusher integration for real-time push delivery

### Business Logic

- **Dynamic Pricing Engine** — Weight-based, distance-based, express surcharge, and COD fee calculation
- **Geo Service** — Haversine formula for GPS distance calculation + city/area-based estimation fallback
- **SLA Watcher** — Cron-based (`@nestjs/schedule`) monitoring for pickup SLA (24h), delivery SLA (72h), and in-transit SLA (48h) with auto-notifications
- **AWB Generation** — Unique Air Waybill number generation for shipment tracking
- **COD Management** — Cash-on-delivery collection recording, fee calculation, and payout processing

### API Documentation

- **Swagger / OpenAPI** — `@nestjs/swagger` with interactive API docs at `/api/docs`, tag-based grouping, and bearer auth support

### Code Quality & Patterns

- **Global Validation Pipe** — `class-validator` + `class-transformer` with whitelist, transform, and forbidNonWhitelisted
- **Global Exception Filter** — Centralized HTTP exception handling
- **Logging Interceptor** — Request/response logging via `nest-winston` + `winston`
- **Custom Decorators** — `@CurrentUser()`, `@Public()`, `@Roles()`
- **DTO Pattern** — Strict Data Transfer Objects for every endpoint
- **Feature-Based Module Architecture** — Auth, Users, Shipments, Pickup, Hub, Rider, Tracking, Payments, Notifications, Audit, Cache, SLA Watcher, CSRF

### Testing

- **Jest v30** — Unit and integration testing
- **Supertest** — HTTP assertion testing for e2e

---

## Frontend Skills & Technologies

### Core Framework

- **Next.js v16** — React meta-framework with App Router, Server Components, route groups, and dynamic routes
- **React v19** — Latest React with hooks and functional components
- **TypeScript v5** — Strict typing for all components, services, and stores

### State Management

- **Zustand v5** — Lightweight state management with persist middleware (localStorage) for auth state
- **TanStack React Query v5** — Server state management with query key factories, stale time, garbage collection, retry strategies, and devtools

### Form Handling & Validation

- **React Hook Form v7** — Performant form management with controlled/uncontrolled inputs
- **Zod v4** — Schema-based runtime validation with refined schemas (e.g., COD amount conditional validation)
- **@hookform/resolvers** — Zod integration with React Hook Form

### UI & Styling

- **Tailwind CSS v4** — Utility-first CSS framework
- **Radix UI** — Headless, accessible component primitives (Dialog, Dropdown Menu, Label, Select, Scroll Area, Tabs, Slot)
- **shadcn/ui** — Pre-built component library (Badge, Button, Card, Dialog, Dropdown, Input, Label, Select, Table, Tabs, Textarea)
- **Lucide React** — Icon library
- **Framer Motion** — Animation library for smooth UI transitions
- **class-variance-authority (CVA)** — Variant-based component styling
- **tailwind-merge** — Intelligent Tailwind class merging
- **clsx** — Conditional class name utility
- **next-themes** — Dark/light theme support with system preference detection
- **tw-animate-css** — Tailwind animation utilities

### Data Fetching & API

- **Axios** — HTTP client with request/response interceptors, auto token injection, CSRF token management, and 401 auto-refresh
- **Event Bus** — Custom pub/sub event system for cross-feature communication (auth events, token refresh)

### Real-Time Features

- **Socket.IO Client** — WebSocket connection management with auto-reconnect, token-based auth, and tracking subscriptions

### Maps & Geolocation

- **Leaflet + React Leaflet** — Interactive maps for shipment tracking, rider location display, and route visualization

### File Handling

- **React Dropzone** — Drag-and-drop file upload for bulk CSV shipment imports

### Date Utilities

- **date-fns** — Lightweight date formatting and manipulation

### Application Architecture

- **Feature-Based Structure** — Each domain (Auth, Shipments, Tracking, Rider, Hub, Payments, Notifications, Analytics, Pickups, Users) has its own `components/`, `containers/`, `hooks/`, `services/`, `stores/`, and `types.ts`
- **Route Groups** — Next.js `(auth)` and `(dashboard)` route groups with separate layouts
- **Providers Pattern** — Centralized provider composition (QueryClient, ThemeProvider, ToastProvider)
- **Protected Routes** — Client-side auth guard in dashboard layout with redirect logic
- **Responsive Layout** — Sidebar + Header layout with mobile-friendly toggle

### Feature Modules

| Module            | Frontend Components                                                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**          | LoginForm, SignupForm, OTPInput                                                                                                                                                                     |
| **Shipments**     | ShipmentForm, ShipmentList, ShipmentCard, ShipmentDetails, ShipmentFilters, BulkUploadDialog, CSVUploader, StatusBadge, AddressForm, PackageDetailsForm, PrintButtons, ValidationPreview, ErrorList |
| **Tracking**      | TrackingMap, TrackingMapInner, StatusTimeline, ETADisplay, RiderInfoCard                                                                                                                            |
| **Rider**         | RiderDashboard, ManifestCard, ManifestList, LocationTracker, DeliveryActionButtons, CODCollectionDialog, FailedDeliveryDialog, OTPDialog                                                            |
| **Hub**           | HubDashboard, ManifestCreation, ManifestDetails, ManifestList, SortingInterface, HandoverList, Scanner                                                                                              |
| **Payments**      | CODDashboard, PayoutForm, TransactionHistory                                                                                                                                                        |
| **Notifications** | NotificationBell, NotificationItem, NotificationList, NotificationStats                                                                                                                             |
| **Analytics**     | Analytics components                                                                                                                                                                                |
| **Layout**        | Header, Sidebar, Footer                                                                                                                                                                             |

---

## DevOps & Tooling

- **Git** — Version control with `dev` / `main` branch workflow
- **ESLint v9** — Code linting with Prettier integration and TypeScript rules
- **Prettier** — Code formatting
- **Postman** — API testing collections with environment variables
- **NestJS CLI** — Code generation and project scaffolding
- **ts-node** — TypeScript execution for migrations and scripts

---

## Database Schema (Entities)

| Entity            | Description                                                                          |
| ----------------- | ------------------------------------------------------------------------------------ |
| **User**          | Multi-role users with wallet balance, KYC, 2FA, OTP                                  |
| **Shipment**      | Complete shipment lifecycle with AWB, sender/receiver info, pricing, status tracking |
| **Pickup**        | Pickup request management                                                            |
| **Manifest**      | Hub manifest for batch shipment processing                                           |
| **Transaction**   | Financial transactions (COD collection, payouts, fees)                               |
| **Notification**  | Multi-channel notification records                                                   |
| **RiderLocation** | GPS location tracking for riders                                                     |
| **AuditLog**      | System audit trail                                                                   |

---

## Key Architectural Decisions

1. **Monorepo** — Single repository housing both backend and frontend
2. **Role-Based Multi-Tenant** — 8 distinct user roles with granular permissions
3. **Event-Driven Notifications** — Bull queues for async processing + multi-channel delivery
4. **Real-Time Tracking** — WebSocket gateway + Redis pub/sub for live updates
5. **Dynamic Pricing** — Configurable fee structure via environment variables
6. **SLA Automation** — Scheduled cron jobs for violation detection and escalation
7. **CSRF + JWT** — Double-layer security with cookie-based CSRF and bearer JWT
8. **Feature-Sliced Architecture** — Both frontend and backend organized by business domain
