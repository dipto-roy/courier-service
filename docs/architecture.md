# Courier Service - System Architecture

## Overview

Courier Service is a complete courier/delivery management system built as a monorepo with:

- **Backend**: NestJS + TypeScript + PostgreSQL + Socket.IO
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS

## Monorepo Structure

```
courier-service/
├── backend/                    # NestJS REST API + WebSocket server
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   ├── guards/            # Auth & security guards
│   │   ├── decorators/        # Custom decorators
│   │   ├── entities/          # Database entities
│   │   ├── migrations/        # Database migrations
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts            # Bootstrap
│   ├── dist/                  # Compiled JS
│   ├── test/                  # E2E tests
│   └── package.json
│
├── frontend/                   # Next.js web application
│   ├── src/
│   │   ├── features/          # Feature modules (auth, shipments, etc.)
│   │   ├── services/          # API services
│   │   ├── common/            # Shared components & utilities
│   │   └── (dashboard)/       # Route group for dashboard
│   ├── app/                   # Next.js app directory
│   ├── public/                # Static assets
│   └── package.json
│
├── docs/                      # Documentation (this folder)
├── README.md                  # Project overview
└── package.json               # Monorepo root (optional)
```

## Backend Architecture

### Technology Stack

- **Framework**: NestJS 11.0 with TypeScript
- **Database**: PostgreSQL 14+ via TypeORM
- **Real-time**: Socket.IO for WebSocket connections
- **Authentication**: JWT (Access + Refresh tokens)
- **Authorization**: Role-based access control (RBAC)
- **Caching**: Redis (optional, for performance)
- **Queue System**: Bull + Redis (for background jobs)
- **Email**: Nodemailer (configured)
- **API Documentation**: Swagger/OpenAPI

### Core Modules

#### 1. **Auth Module**

- JWT-based authentication
- Access & Refresh token management
- OTP generation and verification
- Role-based authorization guards
- Passport.js integration

**Key Files**:

- `auth.controller.ts` - Login, signup, refresh, OTP endpoints
- `auth.service.ts` - Auth logic
- `jwt.strategy.ts` - JWT strategy
- `roles.guard.ts` - Role-based access control

#### 2. **Users Module**

- User account management
- Profile management
- KYC (Know Your Customer) verification
- Wallet operations for merchants
- Role management

**Key Files**:

- `users.controller.ts` - User CRUD endpoints
- `users.service.ts` - User business logic
- `user.entity.ts` - User database schema

#### 3. **Shipments Module**

- Core shipment management
- Shipment creation (single & bulk via CSV)
- Shipment status tracking
- SLA monitoring
- Revenue calculation
- Shipment statistics

**Key Files**:

- `shipments.controller.ts` - Shipment CRUD endpoints
- `shipments.service.ts` - Shipment business logic
- `shipment.entity.ts` - Shipment database schema

**Endpoints**:

- `GET /api/shipments` - List shipments (paginated)
- `POST /api/shipments` - Create shipment
- `GET /api/shipments/{id}` - Get shipment details
- `PUT /api/shipments/{id}` - Update shipment
- `GET /api/shipments/statistics` - Get shipment statistics
- `POST /api/shipments/bulk-upload` - Bulk upload via CSV

#### 4. **Tracking Module**

- Real-time GPS shipment tracking
- WebSocket-based live tracking
- Detailed tracking history
- Location updates from riders

**Key Files**:

- `tracking.controller.ts` - Tracking endpoints
- `tracking.service.ts` - Tracking logic
- `tracking.gateway.ts` - WebSocket gateway

**Endpoints**:

- `GET /api/tracking/{awb}` - Get tracking details
- `POST /api/tracking/update` - Update tracking location
- WebSocket: Real-time tracking events

#### 5. **Rider Module**

- Rider assignment & management
- Delivery operations
- OTP verification for delivery
- Manifest management
- Location tracking

**Key Files**:

- `rider.controller.ts` - Rider endpoints
- `rider.service.ts` - Rider business logic
- `rider.entity.ts` - Rider schema

#### 6. **Hub Module**

- Hub operations management
- Manifest creation and processing
- Shipment sorting & routing
- Inbound/Outbound scans
- Hub staff management

**Key Files**:

- `hub.controller.ts` - Hub endpoints
- `hub.service.ts` - Hub business logic
- `manifest.entity.ts` - Manifest schema

#### 7. **Payments Module**

- Payment tracking
- COD (Cash on Delivery) management
- Payout management
- Transaction history
- Revenue reporting

**Key Files**:

- `payments.controller.ts` - Payment endpoints
- `payments.service.ts` - Payment logic
- `payment.entity.ts` - Payment schema
- `transaction.entity.ts` - Transaction schema

#### 8. **Notifications Module**

- Multi-channel notifications (Email, SMS, Push)
- Notification history
- User notification preferences
- Audit trail for notifications

**Key Files**:

- `notifications.controller.ts` - Notification endpoints
- `notifications.service.ts` - Notification logic
- `notification.entity.ts` - Notification schema

#### 9. **SLA Watcher Module**

- SLA (Service Level Agreement) monitoring
- Breach detection
- Alert generation
- SLA reporting

**Key Files**:

- `sla-watcher.controller.ts` - SLA endpoints
- `sla-watcher.service.ts` - SLA logic
- `sla.entity.ts` - SLA schema

#### 10. **Pickup Module**

- Pickup request management
- Pickup scheduling
- Pickup confirmation

**Key Files**:

- `pickup.controller.ts` - Pickup endpoints
- `pickup.service.ts` - Pickup logic
- `pickup.entity.ts` - Pickup schema

#### 11. **Audit Module**

- System audit logging
- User action tracking
- Change history
- Compliance reporting

**Key Files**:

- `audit.controller.ts` - Audit endpoints
- `audit.service.ts` - Audit logic
- `audit.entity.ts` - Audit log schema

#### 12. **Cache Module**

- Redis caching
- Cache invalidation
- Cache-aside pattern implementation

### Database Schema

Key entities and relationships:

```
User
├── id (PK)
├── email (UNIQUE)
├── password (hashed)
├── name
├── phone
├── role (ENUM: ADMIN, CUSTOMER, MERCHANT, RIDER, HUB_STAFF, SUPPORT)
├── status (ENUM: ACTIVE, INACTIVE, SUSPENDED)
└── timestamps (createdAt, updatedAt)

Shipment
├── id (PK)
├── awb (Airway Bill - UNIQUE)
├── customerId (FK → User)
├── merchantId (FK → User)
├── riderId (FK → User, nullable)
├── recipientName
├── recipientPhone
├── recipientAddress
├── origin (address)
├── destination (address)
├── weight
├── dimensions
├── deliveryType (ENUM: GROUND, EXPRESS, OVERNIGHT)
├── status (ENUM: PENDING, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED)
├── codAmount (Cash on Delivery)
├── deliveryFee
├── insurance
├── specialInstructions
└── timestamps (createdAt, updatedAt, deliveredAt)

Payment
├── id (PK)
├── shipmentId (FK → Shipment)
├── amount
├── type (ENUM: COD, PREPAID, POSTPAID)
├── status (ENUM: PENDING, COMPLETED, FAILED, REFUNDED)
├── transactionId
└── timestamps

Notification
├── id (PK)
├── userId (FK → User)
├── type (ENUM: EMAIL, SMS, PUSH)
├── subject
├── message
├── recipientId (FK → Shipment or User)
├── status (ENUM: SENT, FAILED, PENDING)
└── timestamps

Rider
├── id (PK)
├── userId (FK → User)
├── licensePlate
├── vehicleType
├── licenseExpiry
├── deliveriesCount
├── activeStatus (ENUM: ONLINE, OFFLINE, ON_DELIVERY)
└── currentLocation (coordinates)

Hub
├── id (PK)
├── name
├── city
├── address
├── capacity
├── staffCount
├── status (ENUM: ACTIVE, CLOSED, MAINTENANCE)
└── timestamps

Manifest
├── id (PK)
├── manifestNumber (UNIQUE)
├── hubId (FK → Hub)
├── riderId (FK → Rider)
├── shipmentIds (Array of FK → Shipment)
├── status (ENUM: CREATED, IN_TRANSIT, DELIVERED, RETURNED)
└── timestamps
```

## Frontend Architecture

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: Zustand + React Context
- **Data Fetching**: TanStack React Query (v5)
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios
- **UI Components**: Radix UI
- **Animations**: Framer Motion

### Directory Structure

```
src/
├── features/                  # Feature-based modules
│   ├── auth/
│   │   ├── components/       # Auth components
│   │   ├── hooks/            # Auth hooks
│   │   ├── services/         # Auth API service
│   │   ├── stores/           # Auth store (Zustand)
│   │   └── types.ts
│   │
│   ├── shipments/            # Shipment feature
│   │   ├── components/
│   │   ├── services/
│   │   ├── types.ts
│   │   └── hooks/
│   │
│   ├── tracking/             # Real-time tracking
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types.ts
│   │
│   ├── payments/             # Payment management
│   │   ├── components/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── notifications/        # Notifications
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types.ts
│   │
│   ├── rider/               # Rider operations
│   ├── hub/                 # Hub operations
│   ├── analytics/           # Analytics & reporting
│   ├── orders/              # Order management
│   └── users/               # User profile & management
│
├── services/                 # Shared services
│   ├── api/                 # API client setup
│   ├── hub/
│   │   ├── hub.service.ts   # Hub API calls
│   │   ├── hooks/           # Hub-related hooks
│   │   └── types.ts
│   │
│   ├── notifications/       # Notification service
│   │   ├── notification.service.ts
│   │   ├── hooks/
│   │   └── notifications.gateway.ts (WebSocket)
│   │
│   ├── audit/              # Audit logging
│   └── sla/                # SLA monitoring
│
├── common/                  # Shared components & utilities
│   ├── components/
│   │   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   │   ├── buttons/        # Button variants
│   │   ├── dialogs/        # Modal dialogs
│   │   ├── tables/         # Data tables
│   │   ├── forms/          # Form components
│   │   └── cards/          # Card components
│   │
│   ├── hooks/              # Shared hooks
│   ├── lib/                # Utilities
│   │   ├── api.ts          # API client
│   │   ├── queryClient.ts  # React Query setup
│   │   ├── socket.ts       # Socket.IO setup
│   │   └── utils.ts        # Helper functions
│   │
│   ├── config/             # Constants & config
│   └── types/              # Shared types
│
└── (dashboard)/            # Dashboard route group
    ├── page.tsx            # Dashboard home
    ├── layout.tsx          # Dashboard layout
    ├── shipments/page.tsx
    ├── payments/page.tsx
    ├── notifications/page.tsx
    ├── analytics/page.tsx
    ├── rider/page.tsx
    ├── hub/page.tsx
    ├── users/page.tsx
    └── settings/page.tsx

public/                      # Static assets
├── images/
├── icons/
└── logos/
```

### Dashboard Components

#### Role-Based Dashboards

- **CUSTOMER**: View shipments, track orders, manage payments
- **MERCHANT**: Shipment bulk upload, revenue analytics, COD management
- **RIDER**: Delivery manifests, location tracking, OTP verification
- **HUB_STAFF**: Manifest processing, sorting, inbound/outbound scans
- **ADMIN**: User management, system analytics, audit logs
- **SUPPORT**: User support dashboard, issue tracking

### State Management Pattern

**Zustand Stores**:

```typescript
// Auth store
useAuthStore() → { user, role, isAuthenticated, login, logout }

// UI store
useUIStore() → { sidebarOpen, notifications, alerts }

// Notification store
useNotificationStore() → { notifications, addNotification }
```

**React Query**:

- Automatic caching of API responses
- Real-time mutations
- Optimistic updates
- Query invalidation

### Real-time Communication

**Socket.IO Events**:

- `shipment:update` - Shipment status changes
- `tracking:location` - Real-time location updates
- `notification:new` - New notification received
- `manifest:update` - Manifest status changes
- `rider:location` - Rider location broadcast

## Authentication & Authorization Flow

### JWT Token Structure

```
Access Token (short-lived, ~15 min)
├── userId
├── email
├── role
└── permissions[]

Refresh Token (long-lived, ~7 days)
└── userId
```

### Authorization Levels

**Role-Based Access Control (RBAC)**:

```
┌──────────────┬─────────────────────────────────────┐
│ Role         │ Accessible Features                 │
├──────────────┼─────────────────────────────────────┤
│ ADMIN        │ All features + System management    │
│ MERCHANT     │ Shipments, payments, analytics      │
│ CUSTOMER     │ Shipments, tracking, payments       │
│ RIDER        │ Manifests, deliveries, location    │
│ HUB_STAFF    │ Manifests, sorting, scanning        │
│ SUPPORT      │ User support, issue tracking        │
└──────────────┴─────────────────────────────────────┘
```

**Row-Level Security (RLS)**:

- Customers see only their shipments
- Merchants see only their shipments
- Riders see manifests assigned to them
- Admins see everything

## API Communication Pattern

### Frontend → Backend

```typescript
// 1. Axios instance with JWT
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
});

// 2. Request interceptor adds auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Response interceptor handles token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Call refresh token endpoint
      // Retry original request
    }
  },
);
```

### Real-time Updates via Socket.IO

```typescript
// Frontend listening
socket.on('shipment:update', (data) => {
  // Update shipment status
  queryClient.setQueryData(['shipment', id], data);
});

// Backend emitting
io.to(customerId).emit('shipment:update', shipmentData);
```

## Environment & Deployment

### Development

- Backend: http://localhost:3001 (or 3000)
- Frontend: http://localhost:5000
- Database: PostgreSQL localhost:5432
- Redis: localhost:6379

### Production

- Client requests → Reverse proxy (nginx)
- Frontend serves from CDN
- Backend scaled horizontally
- Database with read replicas
- Redis cluster for caching
- Message queue for async jobs

## Performance Considerations

1. **Caching Strategy**:
   - React Query for API response caching
   - Redis for backend data caching
   - CDN for static assets

2. **Database Optimization**:
   - Indexed queries (userId, shipmentId, awb)
   - Pagination (default 20 items/page)
   - Query optimization for statistics

3. **Frontend Optimization**:
   - Code splitting by routes
   - Image optimization (Next.js Image)
   - Bundle size monitoring
   - Lazy loading for large lists

4. **Backend Optimization**:
   - Connection pooling
   - Batch operations for bulk uploads
   - Background jobs via Bull queue
   - API rate limiting

## Security Measures

1. **Authentication**:
   - JWT tokens (signed with secret)
   - Refresh token rotation
   - HTTP-only cookies (for tokens)

2. **Authorization**:
   - Role-based guards on controllers
   - Row-level security in services
   - Endpoint-level access control

3. **Data Protection**:
   - Password hashing (bcrypt)
   - CORS configuration
   - CSRF protection via cookies
   - Input validation (class-validator)

4. **API Security**:
   - Rate limiting (Throttler)
   - Request validation
   - SQL injection prevention (TypeORM)
   - XSS protection (Content Security Policy)

## Monitoring & Logging

- **Winston Logger** for structured logging
- **Audit Module** for user action tracking
- **Sentry** integration (optional)
- **Health check endpoints** (/health)
- **Metrics collection** (response time, error rates)

## Key Files Reference

### Backend Critical Files

```
src/
├── app.module.ts           # Root module
├── main.ts                 # Bootstrap & configuration
├── entities/              # All entity definitions
├── guards/roles.guard.ts  # RBAC implementation
├── decorators/roles.decorator.ts
├── interceptors/          # Response formatting
└── data-source.ts         # TypeORM configuration
```

### Frontend Critical Files

```
src/
├── common/lib/
│   ├── api.ts            # Axios client
│   ├── queryClient.ts    # React Query setup
│   └── socket.ts         # Socket.IO setup
├── common/hooks/
│   └── useAuthStore.ts   # Auth store
└── common/components/layout/
    └── Sidebar.tsx       # Main navigation
```

## Testing Strategy

- **Backend**: Jest unit tests + E2E tests
- **Frontend**: Vitest for components (planned)
- **API**: Swagger UI for manual testing
- **Integration**: Test across multiple modules

## Common Issues & Solutions

See `DEBUGGING.md` for troubleshooting common issues.
