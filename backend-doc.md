# FastX Courier Service — Backend Documentation

> Full backend codebase analysis — NestJS v11 + TypeScript + PostgreSQL + Redis

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture & Project Structure](#3-architecture--project-structure)
4. [Application Bootstrap (main.ts)](#4-application-bootstrap-maints)
5. [App Module — Root Wiring](#5-app-module--root-wiring)
6. [Database Configuration](#6-database-configuration)
7. [Entity / Schema Reference](#7-entity--schema-reference)
8. [Common Layer (Shared Code)](#8-common-layer-shared-code)
9. [Module Reference](#9-module-reference)
   - 9.1 [Auth Module](#91-auth-module)
   - 9.2 [Users Module](#92-users-module)
   - 9.3 [Shipments Module](#93-shipments-module)
   - 9.4 [Pickup Module](#94-pickup-module)
   - 9.5 [Hub Module](#95-hub-module)
   - 9.6 [Rider Module](#96-rider-module)
   - 9.7 [Tracking Module](#97-tracking-module)
   - 9.8 [Payments Module](#98-payments-module)
   - 9.9 [Notifications Module](#99-notifications-module)
   - 9.10 [Audit Module](#910-audit-module)
   - 9.11 [Cache Module](#911-cache-module)
   - 9.12 [SLA Watcher Module](#912-sla-watcher-module)
   - 9.13 [CSRF Module](#913-csrf-module)
10. [API Endpoint Reference](#10-api-endpoint-reference)
11. [Business Logic & Data Flow](#11-business-logic--data-flow)
12. [Security Architecture](#12-security-architecture)
13. [Real-Time System (WebSocket + Redis Pub/Sub)](#13-real-time-system-websocket--redis-pubsub)
14. [Queue & Background Jobs](#14-queue--background-jobs)
15. [Migrations & Seed Data](#15-migrations--seed-data)
16. [Environment Variables](#16-environment-variables)
17. [NPM Scripts](#17-npm-scripts)
18. [Dependencies](#18-dependencies)

---

## 1. Project Overview

**FastX Courier** হলো Bangladesh-এর logistics industry-র জন্য তৈরি একটি production-ready, full-stack courier management system। Backend সম্পূর্ণ NestJS v11 + TypeScript-এ built এবং end-to-end shipment lifecycle handle করে — pickup request থেকে delivery পর্যন্ত — সাথে real-time tracking, role-based access, dynamic pricing, payments, notifications, এবং SLA monitoring।

**Key Capabilities:**

- 8-role RBAC system (Admin, Merchant, Agent, Hub Staff, Rider, Customer, Finance, Support)
- Complete shipment lifecycle management (PENDING → DELIVERED / RTO)
- Real-time GPS tracking via WebSocket + Redis Pub/Sub
- Dynamic pricing engine (weight + distance + express + COD)
- Multi-channel notifications (Email, SMS, Push)
- COD management with T+7 payout settlement
- SLA violation monitoring with automated alerts
- Bulk CSV shipment upload
- Full audit trail logging

---

## 2. Tech Stack

| Category         | Technology                          | Version          |
| ---------------- | ----------------------------------- | ---------------- |
| Framework        | NestJS                              | v11.0.1          |
| Language         | TypeScript                          | v5.7+            |
| Database         | PostgreSQL                          | -                |
| ORM              | TypeORM                             | v0.3.27          |
| Auth             | JWT (passport-jwt)                  | v4.0.1           |
| Password Hashing | bcrypt                              | v6.0.0           |
| Caching          | Redis (ioredis)                     | v5.8.2           |
| Queue            | Bull (@nestjs/bull)                 | v11.0.4          |
| WebSocket        | Socket.IO (@nestjs/websockets)      | v11.1.8          |
| Email            | Nodemailer                          | v7.0.10          |
| Push             | Pusher                              | v5.2.0           |
| Rate Limiting    | @nestjs/throttler                   | v6.4.0           |
| Scheduler        | @nestjs/schedule                    | v6.0.1           |
| Logging          | Winston (nest-winston)              | v1.10.2          |
| Validation       | class-validator + class-transformer | v0.14.2 / v0.5.1 |
| API Docs         | Swagger (@nestjs/swagger)           | v11.2.1          |
| Testing          | Jest v30 + Supertest v7             | -                |

---

## 3. Architecture & Project Structure

### Architectural Pattern

**Feature-Based Modular Architecture** — Controller → Service → Repository pattern with NestJS dependency injection।

```
backend/
├── src/
│   ├── main.ts                    # Application bootstrap
│   ├── app.module.ts              # Root module — সব module wire করে
│   ├── app.controller.ts          # Health check endpoints
│   ├── app.service.ts             # Root service
│   ├── data-source.ts             # TypeORM CLI data source
│   │
│   ├── config/
│   │   └── database.config.ts     # Database configuration factory
│   │
│   ├── common/                    # Shared/reusable code
│   │   ├── decorators/            # @CurrentUser, @Public, @Roles
│   │   ├── dto/                   # PaginationDto, PaginatedResponseDto
│   │   ├── enums/                 # UserRole, ShipmentStatus, DeliveryType, PaymentStatus, PaymentMethod, NotificationType
│   │   ├── filters/               # HttpExceptionFilter (global)
│   │   ├── guards/                # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/          # LoggingInterceptor, TransformInterceptor
│   │   ├── middleware/            # CsrfMiddleware
│   │   ├── services/              # PricingService, GeoService
│   │   └── utils/                 # generateAWB, generateOTP, hashPassword, comparePassword
│   │
│   ├── entities/                  # TypeORM entity definitions
│   │   ├── user.entity.ts
│   │   ├── shipment.entity.ts
│   │   ├── pickup.entity.ts
│   │   ├── manifest.entity.ts
│   │   ├── transaction.entity.ts
│   │   ├── notification.entity.ts
│   │   ├── rider-location.entity.ts
│   │   └── audit-log.entity.ts
│   │
│   ├── csrf/                      # CSRF token controller
│   │   ├── csrf.controller.ts
│   │   └── csrf.module.ts
│   │
│   ├── modules/                   # Feature modules
│   │   ├── auth/                  # Authentication & JWT
│   │   ├── users/                 # User CRUD & management
│   │   ├── shipments/             # Shipment lifecycle
│   │   ├── pickup/                # Pickup operations
│   │   ├── hub/                   # Hub operations & manifests
│   │   ├── rider/                 # Rider delivery operations
│   │   ├── tracking/              # Real-time tracking (WebSocket + REST)
│   │   ├── payments/              # COD, payouts, transactions
│   │   ├── notifications/         # Email, SMS, Push notifications
│   │   ├── audit/                 # Audit trail logging
│   │   ├── cache/                 # Redis cache layer (global)
│   │   └── sla-watcher/           # SLA violation monitoring (cron)
│   │
│   └── migrations/                # TypeORM migrations
│       ├── 1761770940616-SeedInitialData.ts
│       └── 1761771966395-EnableUuidExtension.ts
│
└── test/
    ├── app.e2e-spec.ts
    └── jest-e2e.json
```

---

## 4. Application Bootstrap (main.ts)

`main.ts` NestJS application initialize করে এবং নিচের global configurations set করে:

| Feature             | Configuration                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------- |
| **Global Prefix**   | `/api` — সব route `/api` দিয়ে শুরু                                                          |
| **Cookie Parser**   | CSRF token handling-এর জন্য enable                                                           |
| **CORS**            | Environment-based origin whitelist, credentials support, `x-csrf-token` header allowed       |
| **Validation Pipe** | `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true`, implicit type conversion |
| **Swagger**         | `/api/docs`-এ interactive API documentation, bearer auth support, tag-based grouping         |
| **Port**            | `process.env.PORT` বা default `30001`                                                        |

**CORS Behavior:**

- Development mode: সব origin allowed
- Production mode: শুধু `ALLOWED_ORIGINS` env variable-এ listed origins allowed
- No-origin requests (Postman, mobile apps) সর্বদা allowed

---

## 5. App Module — Root Wiring

`app.module.ts` হলো root module যেটা সব feature modules, global providers, এবং infrastructure wire করে:

### Imported Modules:

| Module                         | Purpose                                    |
| ------------------------------ | ------------------------------------------ |
| `ConfigModule.forRoot()`       | Global environment variables (`.env`)      |
| `TypeOrmModule.forRootAsync()` | PostgreSQL connection via ConfigService    |
| `ThrottlerModule.forRoot()`    | Rate limiting — 10 requests per 60 seconds |
| `BullModule.forRootAsync()`    | Redis-backed queue system                  |
| `CacheModule`                  | Global Redis cache layer                   |
| `AuthModule`                   | JWT authentication                         |
| `UsersModule`                  | User management                            |
| `ShipmentsModule`              | Shipment CRUD & lifecycle                  |
| `PickupModule`                 | Pickup request management                  |
| `HubModule`                    | Hub operations & manifests                 |
| `RiderModule`                  | Rider delivery operations                  |
| `TrackingModule`               | Real-time shipment tracking                |
| `PaymentsModule`               | Payment & COD management                   |
| `NotificationsModule`          | Multi-channel notifications                |
| `AuditModule`                  | Audit trail                                |
| `SlaWatcherModule`             | SLA violation monitoring                   |
| `CsrfModule`                   | CSRF token endpoint                        |

### Global Providers:

| Provider              | Type            | Purpose                                                |
| --------------------- | --------------- | ------------------------------------------------------ |
| `JwtAuthGuard`        | APP_GUARD       | সব route default-এ protected (opt-out via `@Public()`) |
| `HttpExceptionFilter` | APP_FILTER      | Centralized error response formatting                  |
| `LoggingInterceptor`  | APP_INTERCEPTOR | Request/response logging                               |

### Middleware:

- `CsrfMiddleware` — সব route-এ applied, state-changing requests (POST, PUT, PATCH, DELETE)-এ CSRF token validate করে

---

## 6. Database Configuration

### TypeORM Setup:

- **Database:** PostgreSQL
- **Synchronize:** শুধু development এ `true` (auto-create tables)
- **Migrations:** `src/migrations/` directory-তে, `migrations_history` table-এ tracked
- **Entity Loading:** `__dirname + '/**/*.entity{.ts,.js}'` pattern-এ auto-discover

### Data Source (CLI):

`data-source.ts` file TypeORM CLI commands (migration generate/run/revert)-এর জন্য ব্যবহৃত হয়।

### Migration Commands:

```bash
npm run migration:generate -- src/migrations/MigrationName  # Generate migration
npm run migration:run                                        # Run pending migrations
npm run migration:revert                                     # Revert last migration
npm run migration:show                                       # Show migration status
```

---

## 7. Entity / Schema Reference

### 7.1 User Entity (`users` table)

| Column                   | Type            | Notes                                      |
| ------------------------ | --------------- | ------------------------------------------ |
| `id`                     | UUID (PK)       | Auto-generated                             |
| `email`                  | varchar         | Unique, indexed                            |
| `name`                   | varchar         | Full name                                  |
| `phone`                  | varchar         | Unique, indexed                            |
| `password`               | varchar         | bcrypt hashed, excluded from serialization |
| `role`                   | enum (UserRole) | 8 roles, default: CUSTOMER, indexed        |
| `is_active`              | boolean         | Default: true                              |
| `is_verified`            | boolean         | Email OTP verified, default: false         |
| `is_kyc_verified`        | boolean         | KYC document verified                      |
| `two_fa_enabled`         | boolean         | 2FA toggle                                 |
| `two_fa_secret`          | varchar         | Excluded from serialization                |
| `otp_code`               | varchar         | Current OTP, nullable, excluded            |
| `otp_expiry`             | timestamp       | OTP expiry time                            |
| `refresh_token`          | text            | JWT refresh token, excluded                |
| `wallet_balance`         | decimal(10,2)   | Default: 0                                 |
| `address`                | varchar         | Nullable                                   |
| `city`                   | varchar         | Nullable                                   |
| `area`                   | varchar         | Nullable                                   |
| `postal_code`            | varchar         | Nullable                                   |
| `latitude`               | varchar         | GPS latitude                               |
| `longitude`              | varchar         | GPS longitude                              |
| `hub_id`                 | varchar         | Assigned hub (for Hub Staff)               |
| `merchant_business_name` | varchar         | Merchant-specific                          |
| `merchant_trade_license` | varchar         | Merchant-specific                          |
| `profile_image`          | varchar         | Image URL                                  |
| `last_login`             | timestamp       | Last login time                            |
| `created_at`             | timestamp       | Auto-generated                             |
| `updated_at`             | timestamp       | Auto-updated                               |
| `deleted_at`             | timestamp       | Soft delete                                |

**Relations:**

- OneToMany → Shipments (as merchant)
- OneToMany → Pickups (as agent)
- OneToMany → RiderLocations (as rider)
- OneToMany → Transactions

---

### 7.2 Shipment Entity (`shipments` table)

| Column                                     | Type                  | Notes                                               |
| ------------------------------------------ | --------------------- | --------------------------------------------------- |
| `id`                                       | UUID (PK)             | Auto-generated                                      |
| `awb`                                      | varchar(20)           | Unique Air Waybill, format: `FX{YYYYMMDD}{6digits}` |
| `merchant_id`                              | UUID (FK)             | → users.id                                          |
| `customer_id`                              | UUID (FK)             | → users.id, nullable                                |
| `pickup_id`                                | UUID (FK)             | → pickups.id, nullable                              |
| `manifest_id`                              | UUID (FK)             | → manifests.id, nullable                            |
| `rider_id`                                 | UUID (FK)             | → users.id, nullable                                |
| **Sender Info**                            |                       |                                                     |
| `sender_name`                              | varchar               |                                                     |
| `sender_phone`                             | varchar               |                                                     |
| `sender_address`                           | text                  |                                                     |
| `sender_city`                              | varchar               |                                                     |
| `sender_area`                              | varchar               |                                                     |
| `sender_postal_code`                       | varchar               | Nullable                                            |
| **Receiver Info**                          |                       |                                                     |
| `receiver_name`                            | varchar               |                                                     |
| `receiver_phone`                           | varchar               |                                                     |
| `receiver_address`                         | text                  |                                                     |
| `receiver_city`                            | varchar               |                                                     |
| `receiver_area`                            | varchar               |                                                     |
| `receiver_postal_code`                     | varchar               | Nullable                                            |
| `receiver_latitude`                        | varchar               | Nullable                                            |
| `receiver_longitude`                       | varchar               | Nullable                                            |
| **Package Details**                        |                       |                                                     |
| `product_description`                      | text                  |                                                     |
| `weight`                                   | decimal(8,2)          | kg                                                  |
| `quantity`                                 | int                   | Default: 1                                          |
| `declared_value`                           | decimal(10,2)         | Nullable                                            |
| `delivery_type`                            | enum (DeliveryType)   | EXPRESS / NORMAL                                    |
| `status`                                   | enum (ShipmentStatus) | 12 statuses, indexed                                |
| **Payment**                                |                       |                                                     |
| `payment_method`                           | enum (PaymentMethod)  | COD / CASH / PREPAID / WALLET / BANK / MOBILE       |
| `payment_status`                           | enum (PaymentStatus)  | PENDING → COLLECTED → PAID_OUT                      |
| `cod_amount`                               | decimal(10,2)         | Default: 0                                          |
| `delivery_fee`                             | decimal(10,2)         | System calculated                                   |
| `cod_fee`                                  | decimal(10,2)         | Default: 0                                          |
| `total_amount`                             | decimal(10,2)         | System calculated                                   |
| **Tracking & SLA**                         |                       |                                                     |
| `expected_delivery_date`                   | timestamp             | System calculated                                   |
| `actual_delivery_date`                     | timestamp             | Nullable                                            |
| `sla_breached`                             | boolean               | Default: false                                      |
| **Delivery Attempts**                      |                       |                                                     |
| `delivery_attempts`                        | int                   | Default: 0                                          |
| `failed_reason`                            | text                  | Nullable                                            |
| `delivery_note`                            | text                  | Nullable                                            |
| `otp_code`                                 | varchar(6)            | Delivery OTP                                        |
| `signature_url`                            | varchar               | Proof URL                                           |
| `pod_photo_url`                            | varchar               | Proof of Delivery photo                             |
| `pickup_photo_url`                         | varchar               | Pickup photo                                        |
| **RTO**                                    |                       |                                                     |
| `is_rto`                                   | boolean               | Return to Origin flag                               |
| `rto_reason`                               | text                  | Nullable                                            |
| **Routing**                                |                       |                                                     |
| `current_hub`                              | varchar               | Current hub location                                |
| `next_hub`                                 | varchar               | Next destination hub                                |
| `delivery_area`                            | varchar               | Delivery zone                                       |
| `special_instructions`                     | text                  | Customer notes                                      |
| `invoice_number`                           | varchar               | Merchant invoice                                    |
| `reference_number`                         | varchar               | External reference                                  |
| `created_at` / `updated_at` / `deleted_at` | timestamp             | Soft delete supported                               |

**Indexes:** `awb` (unique), `merchantId`, `customerId`, `status`, `createdAt`

---

### 7.3 Pickup Entity (`pickups` table)

| Column                   | Type      | Notes                                                    |
| ------------------------ | --------- | -------------------------------------------------------- |
| `id`                     | UUID (PK) |                                                          |
| `merchant_id`            | UUID (FK) | → users.id                                               |
| `agent_id`               | UUID (FK) | → users.id, nullable (assigned agent)                    |
| `status`                 | enum      | PENDING / ASSIGNED / IN_PROGRESS / COMPLETED / CANCELLED |
| `pickup_address`         | text      |                                                          |
| `pickup_city`            | varchar   |                                                          |
| `pickup_area`            | varchar   |                                                          |
| `pickup_date`            | timestamp | Actual pickup date                                       |
| `scheduled_date`         | timestamp | Scheduled date                                           |
| `contact_person`         | varchar   |                                                          |
| `contact_phone`          | varchar   |                                                          |
| `total_shipments`        | int       | Default: 0                                               |
| `notes`                  | text      | Nullable                                                 |
| `signature_url`          | varchar   | Agent signature                                          |
| `photo_url`              | varchar   | Pickup photo                                             |
| `latitude` / `longitude` | varchar   | GPS coordinates                                          |

**Relations:** ManyToOne → User (agent, merchant), OneToMany → Shipments

---

### 7.4 Manifest Entity (`manifests` table)

| Column            | Type        | Notes                                    |
| ----------------- | ----------- | ---------------------------------------- |
| `id`              | UUID (PK)   |                                          |
| `manifest_number` | varchar(20) | Unique, format: `MF-YYYYMMDD-XXXX`       |
| `origin_hub`      | varchar     |                                          |
| `destination_hub` | varchar     | Nullable                                 |
| `rider_id`        | UUID (FK)   | Nullable                                 |
| `status`          | enum        | CREATED / IN_TRANSIT / RECEIVED / CLOSED |
| `total_shipments` | int         | Default: 0                               |
| `dispatch_date`   | timestamp   | Nullable                                 |
| `received_date`   | timestamp   | Nullable                                 |
| `created_by_id`   | UUID (FK)   |                                          |
| `received_by_id`  | UUID (FK)   | Nullable                                 |
| `notes`           | text        | Nullable                                 |

**Relations:** ManyToOne → User (createdBy, receivedBy, rider), OneToMany → Shipments

---

### 7.5 Transaction Entity (`transactions` table)

| Column             | Type                   | Notes                                                                              |
| ------------------ | ---------------------- | ---------------------------------------------------------------------------------- |
| `id`               | UUID (PK)              |                                                                                    |
| `transaction_id`   | varchar(30)            | Unique, format: `TXN-{timestamp}-{random}`                                         |
| `user_id`          | UUID (FK)              |                                                                                    |
| `shipment_id`      | UUID (FK)              | Nullable                                                                           |
| `type`             | enum (TransactionType) | DELIVERY_FEE / COD_COLLECTION / COD_PAYOUT / WALLET_CREDIT / WALLET_DEBIT / REFUND |
| `payment_method`   | enum (PaymentMethod)   |                                                                                    |
| `status`           | enum (PaymentStatus)   | Default: PENDING                                                                   |
| `amount`           | decimal(10,2)          |                                                                                    |
| `fee`              | decimal(10,2)          | Default: 0                                                                         |
| `net_amount`       | decimal(10,2)          |                                                                                    |
| `previous_balance` | decimal(10,2)          | Nullable                                                                           |
| `new_balance`      | decimal(10,2)          | Nullable                                                                           |
| `description`      | text                   | Nullable                                                                           |
| `reference_number` | varchar                | Nullable                                                                           |
| `gateway_response` | jsonb                  | Nullable, payment gateway response                                                 |
| `processed_at`     | timestamp              | Nullable                                                                           |
| `processed_by_id`  | UUID (FK)              | Nullable                                                                           |

---

### 7.6 Notification Entity (`notifications` table)

| Column            | Type                    | Notes                         |
| ----------------- | ----------------------- | ----------------------------- |
| `id`              | UUID (PK)               |                               |
| `user_id`         | UUID (FK)               |                               |
| `shipment_id`     | UUID (FK)               | Nullable                      |
| `type`            | enum (NotificationType) | EMAIL / SMS / WHATSAPP / PUSH |
| `title`           | varchar                 |                               |
| `message`         | text                    |                               |
| `data`            | jsonb                   | Nullable, extra metadata      |
| `is_read`         | boolean                 | Default: false                |
| `read_at`         | timestamp               | Nullable                      |
| `sent_at`         | timestamp               | Nullable                      |
| `delivery_status` | varchar                 | Nullable                      |
| `error_message`   | text                    | Nullable                      |

---

### 7.7 RiderLocation Entity (`rider_locations` table)

| Column          | Type          | Notes                 |
| --------------- | ------------- | --------------------- |
| `id`            | UUID (PK)     |                       |
| `rider_id`      | UUID (FK)     |                       |
| `shipment_id`   | UUID (FK)     | Nullable              |
| `latitude`      | decimal(10,7) | GPS latitude          |
| `longitude`     | decimal(10,7) | GPS longitude         |
| `accuracy`      | number        | GPS accuracy (meters) |
| `speed`         | number        | Speed (km/h)          |
| `heading`       | number        | Direction (degrees)   |
| `battery_level` | number        | Device battery %      |
| `is_online`     | boolean       | Default: true         |

**Index:** Composite `(riderId, createdAt)`, `shipmentId`

---

### 7.8 AuditLog Entity (`audit_logs` table)

| Column        | Type      | Notes                                                    |
| ------------- | --------- | -------------------------------------------------------- |
| `id`          | UUID (PK) |                                                          |
| `user_id`     | UUID (FK) | Who performed the action                                 |
| `entity_type` | varchar   | shipment / user / pickup / manifest / transaction / auth |
| `entity_id`   | varchar   | Target entity ID                                         |
| `action`      | varchar   | create / update / delete / status_change                 |
| `old_values`  | jsonb     | Before change                                            |
| `new_values`  | jsonb     | After change                                             |
| `ip_address`  | varchar   | Client IP                                                |
| `user_agent`  | text      | Browser/client info                                      |
| `description` | text      | Human-readable description                               |

---

### Entity Relationship Diagram (সংক্ষিপ্ত)

```
User (1) ──→ (*) Shipment (as merchant)
User (1) ──→ (*) Pickup (as agent)
User (1) ──→ (*) RiderLocation (as rider)
User (1) ──→ (*) Transaction
User (1) ──→ (*) AuditLog
User (1) ──→ (*) Notification

Shipment (*) ──→ (1) User (merchant)
Shipment (*) ──→ (1) User (customer)
Shipment (*) ──→ (1) User (rider)
Shipment (*) ──→ (1) Pickup
Shipment (*) ──→ (1) Manifest

Pickup (1) ──→ (*) Shipment
Manifest (1) ──→ (*) Shipment
```

---

## 8. Common Layer (Shared Code)

### 8.1 Custom Decorators

| Decorator          | File                        | Purpose                                                              |
| ------------------ | --------------------------- | -------------------------------------------------------------------- |
| `@CurrentUser()`   | `current-user.decorator.ts` | Request থেকে authenticated user extract করে (param decorator)        |
| `@Public()`        | `public.decorator.ts`       | Route-কে JWT auth থেকে exempt করে (`IS_PUBLIC_KEY` metadata set করে) |
| `@Roles(...roles)` | `roles.decorator.ts`        | Route-এ required roles specify করে (`ROLES_KEY` metadata)            |

### 8.2 Enums

| Enum               | Values                                                                                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UserRole`         | `admin`, `merchant`, `agent`, `hub_staff`, `rider`, `customer`, `finance`, `support`                                                                                                   |
| `ShipmentStatus`   | `pending`, `pickup_assigned`, `picked_up`, `in_hub`, `in_transit`, `out_for_delivery`, `delivered`, `failed_delivery`, `rto_initiated`, `rto_in_transit`, `rto_delivered`, `cancelled` |
| `DeliveryType`     | `express` (1-day), `normal` (48-72h)                                                                                                                                                   |
| `PaymentMethod`    | `cod`, `cash`, `prepaid`, `wallet`, `bank_transfer`, `mobile_banking`                                                                                                                  |
| `PaymentStatus`    | `pending`, `processing`, `completed`, `collected`, `verified`, `paid_out`, `failed`                                                                                                    |
| `NotificationType` | `email`, `sms`, `whatsapp`, `push`                                                                                                                                                     |

### 8.3 Guards

| Guard          | Purpose                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------ |
| `JwtAuthGuard` | `AuthGuard('jwt')` extend করে, `@Public()` decorator check করে — public routes bypass auth |
| `RolesGuard`   | `@Roles()` decorator থেকে required roles check করে, user's role match না হলে block করে     |

### 8.4 Filters

| Filter                | Purpose                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `HttpExceptionFilter` | Global exception filter — সব errors এক consistent format-এ response করে: `{ success, statusCode, message[], timestamp, path }` |

### 8.5 Interceptors

| Interceptor            | Purpose                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `LoggingInterceptor`   | Incoming request log করে (method, URL, IP, user-agent) এবং response time track করে |
| `TransformInterceptor` | সব successful response `{ success: true, data, timestamp }` format-এ wrap করে      |

### 8.6 Middleware

| Middleware       | Purpose                                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CsrfMiddleware` | State-changing requests (POST/PUT/PATCH/DELETE)-এ CSRF token validate করে। Public paths exempt: `/api/health`, `/api/docs`, `/api/auth/*`, `/api/csrf/token`। GET/HEAD/OPTIONS requests skip করে। |

### 8.7 Shared Services

| Service          | Purpose                                                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PricingService` | Dynamic delivery fee calculation — base fee + weight fee + distance fee + express surcharge + COD fee। সব rates environment variables থেকে configurable। Expected delivery date calculate করে। |
| `GeoService`     | Haversine formula-তে GPS distance calculation। GPS না থাকলে city/area-based estimation fallback (same area = 5km, same city = 15km, different city = 50km)।                                    |

### 8.8 Utility Functions

| Function                          | File               | Purpose                                             |
| --------------------------------- | ------------------ | --------------------------------------------------- |
| `generateAWB()`                   | `awb.util.ts`      | Unique AWB number: `FX{YYYYMMDD}{6-digit random}`   |
| `generateManifestNumber()`        | `awb.util.ts`      | Manifest number: `MN{YYYYMMDD}{4-digit random}`     |
| `generateOTP(length)`             | `otp.util.ts`      | Random numeric OTP, default 6 digits                |
| `isOTPValid(expiry)`              | `otp.util.ts`      | OTP expiry check                                    |
| `getOTPExpiry(seconds)`           | `otp.util.ts`      | OTP expiry timestamp generate (default 300s = 5min) |
| `hashPassword(password)`          | `password.util.ts` | bcrypt hash, 10 salt rounds                         |
| `comparePassword(password, hash)` | `password.util.ts` | bcrypt compare                                      |

### 8.9 DTOs (Pagination)

| DTO                       | Fields                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `PaginationDto`           | `page` (default 1), `limit` (default 10, max 100), `search`, `sortBy`, `sortOrder` (ASC/DESC) |
| `PaginatedResponseDto<T>` | `data: T[]`, `meta: { page, limit, totalItems, totalPages, hasNextPage, hasPreviousPage }`    |

---

## 9. Module Reference

### 9.1 Auth Module

**Path:** `src/modules/auth/`
**Files:** `auth.module.ts`, `auth.controller.ts`, `auth.service.ts`, `jwt.strategy.ts`, `dto/`

**Flow:**

1. **Signup** → Password hash → OTP generate → Email send → JWT tokens return → User unverified
2. **Login** → Password verify → Unverified হলে new OTP send ও error → Verified হলে JWT tokens return
3. **Verify OTP** → OTP match + expiry check → `isVerified = true` → New tokens return
4. **Refresh Token** → Verify refresh JWT → New access + refresh token pair return
5. **Logout** → `refreshToken = null` save

**JWT Strategy:** `passport-jwt` Strategy — Bearer token from Authorization header extract করে, user validate করে, `{ id, email, role, name }` return করে।

**Endpoints:**

| Method | Path                   | Auth   | Description                   |
| ------ | ---------------------- | ------ | ----------------------------- |
| POST   | `/api/auth/signup`     | Public | User registration + OTP email |
| POST   | `/api/auth/login`      | Public | Login, returns JWT tokens     |
| POST   | `/api/auth/verify-otp` | Public | Verify OTP code               |
| POST   | `/api/auth/resend-otp` | Public | Resend OTP email              |
| POST   | `/api/auth/refresh`    | Public | Refresh access token          |
| POST   | `/api/auth/logout`     | JWT    | Logout (clear refresh token)  |
| GET    | `/api/auth/me`         | JWT    | Get current user profile      |

---

### 9.2 Users Module

**Path:** `src/modules/users/`
**Files:** `users.module.ts`, `users.controller.ts`, `users.service.ts`, `dto/`

**Features:**

- Admin-only user creation with role assignment
- Paginated user list with filters (role, active, verified, KYC, city, search)
- KYC verification status update (Admin/Finance)
- Wallet balance management (credit/debit with validation)
- Soft delete and restore
- User statistics by role
- Sensitive data (`password`, `refreshToken`) stripped from all responses

**Endpoints:**

| Method | Path                       | Roles             | Description                       |
| ------ | -------------------------- | ----------------- | --------------------------------- |
| POST   | `/api/users`               | Admin             | Create user                       |
| GET    | `/api/users`               | Admin, Support    | List users (paginated + filtered) |
| GET    | `/api/users/statistics`    | Admin             | User statistics                   |
| GET    | `/api/users/by-role/:role` | Admin, Support    | Get users by role                 |
| GET    | `/api/users/me`            | All authenticated | Current user profile              |
| GET    | `/api/users/:id`           | Admin, Support    | Get user by ID                    |
| PATCH  | `/api/users/:id`           | Admin, Support    | Update user                       |
| PATCH  | `/api/users/:id/kyc`       | Admin, Finance    | Update KYC status                 |
| PATCH  | `/api/users/:id/wallet`    | Admin, Finance    | Credit/debit wallet               |
| DELETE | `/api/users/:id`           | Admin             | Soft delete user                  |
| POST   | `/api/users/:id/restore`   | Admin             | Restore deleted user              |

---

### 9.3 Shipments Module

**Path:** `src/modules/shipments/`
**Files:** `shipments.module.ts`, `shipments.controller.ts`, `shipments.service.ts`, `dto/`

**Features:**

- Shipment creation with auto AWB generation, dynamic pricing, distance calculation
- Merchant-scoped access (merchants see only their shipments)
- Public AWB tracking (no auth required)
- Status update with role-based access
- Update only allowed for PENDING shipments
- Bulk CSV upload with row-level error reporting
- Query result caching (30s count, 60s data, 2min single, 5min public tracking)
- Statistics dashboard

**Pricing Calculation (on create):**

1. Distance calculate: GPS Haversine বা city/area estimation
2. `PricingService.calculateDeliveryFee()` call:
   - Base fee (env: `BASE_DELIVERY_FEE`, default ৳50)
   - Weight fee: `ceil(weight) × PER_KG_FEE` (default ৳20/kg)
   - Distance fee: `round(distance) × DISTANCE_FEE_PER_KM` (default ৳5/km)
   - Express surcharge: (env: `EXPRESS_SURCHARGE`, default ৳50)
   - COD fee: `codAmount × COD_FEE_PERCENTAGE / 100` (default 2%)

**Endpoints:**

| Method | Path                               | Roles                                      | Description                   |
| ------ | ---------------------------------- | ------------------------------------------ | ----------------------------- |
| POST   | `/api/shipments`                   | Merchant, Admin                            | Create shipment               |
| GET    | `/api/shipments`                   | Admin, Merchant, Support, Hub Staff        | List (paginated + filtered)   |
| GET    | `/api/shipments/statistics`        | Admin, Merchant, Support                   | Shipment statistics           |
| GET    | `/api/shipments/by-status/:status` | Admin, Merchant, Support, Hub Staff        | Filter by status              |
| GET    | `/api/shipments/track/:awb`        | **Public**                                 | Track by AWB number           |
| GET    | `/api/shipments/:id`               | Admin, Merchant, Support, Hub Staff, Rider | Get shipment details          |
| PATCH  | `/api/shipments/:id`               | Merchant, Admin                            | Update (only if PENDING)      |
| PATCH  | `/api/shipments/:id/status`        | Admin, Hub Staff, Agent, Rider             | Update status                 |
| DELETE | `/api/shipments/:id`               | Merchant, Admin                            | Soft delete (only if PENDING) |
| POST   | `/api/shipments/bulk-upload`       | Merchant, Admin                            | CSV bulk upload               |

---

### 9.4 Pickup Module

**Path:** `src/modules/pickup/`
**Files:** `pickup.module.ts`, `pickup.controller.ts`, `pickup.service.ts`, `dto/`

**Status Flow:** `PENDING → ASSIGNED → IN_PROGRESS → COMPLETED / CANCELLED`

**Features:**

- Merchants create pickup requests
- Admin/Hub Staff assign pickup agents
- Agents start and complete pickups
- On completion: linked shipments get `PICKED_UP` status
- Statistics and today's pickups endpoints
- Pickup filtering by status, date range, merchant, agent

**Endpoints:**

| Method | Path                        | Roles                             | Description             |
| ------ | --------------------------- | --------------------------------- | ----------------------- |
| POST   | `/api/pickups`              | Merchant                          | Create pickup request   |
| GET    | `/api/pickups`              | Admin, Hub Staff, Agent           | List pickups (filtered) |
| GET    | `/api/pickups/statistics`   | Admin, Hub Staff                  | Pickup statistics       |
| GET    | `/api/pickups/today`        | Admin, Hub Staff, Agent           | Today's pickups         |
| GET    | `/api/pickups/:id`          | Merchant, Admin, Hub Staff, Agent | Get pickup details      |
| PATCH  | `/api/pickups/:id`          | Merchant, Admin                   | Update pickup           |
| PATCH  | `/api/pickups/:id/assign`   | Admin, Hub Staff                  | Assign agent            |
| PATCH  | `/api/pickups/:id/start`    | Agent                             | Start pickup            |
| PATCH  | `/api/pickups/:id/complete` | Agent                             | Complete pickup         |
| PATCH  | `/api/pickups/:id/cancel`   | Merchant, Admin                   | Cancel pickup           |

---

### 9.5 Hub Module

**Path:** `src/modules/hub/`
**Files:** `hub.module.ts`, `hub.controller.ts`, `hub.service.ts`, `dto/`

**Features:**

- **Inbound Scan:** Shipment receive → `IN_HUB` status
- **Outbound Scan:** Shipment dispatch → `OUT_FOR_DELIVERY` / `IN_TRANSIT`
- **Manifest Management:** Create → dispatch → receive → close
- **Sorting:** Assign destination hub to shipments for routing
- **Hub Inventory:** Track all shipments at hub with statistics (by destination, type, COD amounts)
- **Discrepancy Handling:** Extra/missing shipments in manifests tracked

**Manifest Status Flow:** `CREATED → IN_TRANSIT → RECEIVED → CLOSED`

**Endpoints:**

| Method | Path                            | Roles            | Description                  |
| ------ | ------------------------------- | ---------------- | ---------------------------- |
| POST   | `/api/hub/inbound-scan`         | Hub Staff, Admin | Receive shipment at hub      |
| POST   | `/api/hub/outbound-scan`        | Hub Staff, Admin | Dispatch shipment from hub   |
| POST   | `/api/hub/sorting`              | Hub Staff, Admin | Sort shipment to destination |
| POST   | `/api/hub/manifest`             | Hub Staff, Admin | Create manifest              |
| GET    | `/api/hub/manifest`             | Hub Staff, Admin | List manifests               |
| GET    | `/api/hub/manifest/:id`         | Hub Staff, Admin | Get manifest details         |
| PATCH  | `/api/hub/manifest/:id/receive` | Hub Staff, Admin | Receive manifest             |
| PATCH  | `/api/hub/manifest/:id/close`   | Hub Staff, Admin | Close manifest               |
| GET    | `/api/hub/inventory`            | Hub Staff, Admin | Hub inventory                |
| GET    | `/api/hub/statistics`           | Hub Staff, Admin | Hub statistics               |

---

### 9.6 Rider Module

**Path:** `src/modules/rider/`
**Files:** `rider.module.ts`, `rider.controller.ts`, `rider.service.ts`, `dto/`

**Features:**

- View assigned manifests and shipments
- Generate 6-digit OTP for delivery verification
- Complete delivery with OTP validation + COD collection
- Record failed deliveries with reason codes
- Initiate RTO after 3 failed attempts
- Real-time GPS location updates (accuracy, speed, heading, battery level)
- Delivery statistics dashboard

**Delivery Status Flow:** `OUT_FOR_DELIVERY → DELIVERED / FAILED_DELIVERY → RTO_INITIATED`

**Failed Delivery Reasons:** Customer not available, refused delivery, incorrect address, payment issues, damaged parcel, etc.

**RTO Reasons:** Multiple failed attempts, customer refused, damaged product, incomplete address, etc.

**Endpoints:**

| Method | Path                                     | Roles | Description                   |
| ------ | ---------------------------------------- | ----- | ----------------------------- |
| GET    | `/api/rider/manifests`                   | Rider | Get assigned manifests        |
| GET    | `/api/rider/shipments`                   | Rider | Get assigned shipments        |
| GET    | `/api/rider/shipments/:id`               | Rider | Get shipment details          |
| POST   | `/api/rider/generate-otp/:shipmentId`    | Rider | Generate delivery OTP         |
| POST   | `/api/rider/deliver/:shipmentId`         | Rider | Complete delivery (OTP + COD) |
| POST   | `/api/rider/failed-delivery/:shipmentId` | Rider | Record failed delivery        |
| POST   | `/api/rider/rto/:shipmentId`             | Rider | Initiate RTO                  |
| POST   | `/api/rider/location`                    | Rider | Update GPS location           |
| GET    | `/api/rider/statistics`                  | Rider | Delivery statistics           |

---

### 9.7 Tracking Module

**Path:** `src/modules/tracking/`
**Files:** `tracking.module.ts`, `tracking.controller.ts`, `tracking.service.ts`, `tracking.gateway.ts`, `dto/`

**Features:**

- Public shipment tracking via AWB (REST)
- Detailed tracking for authenticated users
- Real-time WebSocket tracking via Socket.IO gateway
- Timeline generation from shipment + pickup + manifest data
- Rider GPS location tracking (current + history)
- Dynamic ETA calculation based on shipment status
- Pusher integration for push-based real-time updates
- Redis Pub/Sub for cross-instance event broadcasting

**WebSocket Events:**

| Event                  | Direction       | Purpose                              |
| ---------------------- | --------------- | ------------------------------------ |
| `subscribe-tracking`   | Client → Server | Subscribe to shipment updates by AWB |
| `unsubscribe-tracking` | Client → Server | Unsubscribe from tracking            |
| `get-tracking`         | Client → Server | One-time tracking data fetch         |
| `tracking-update`      | Server → Client | Status change broadcast              |
| `location-update`      | Server → Client | GPS location broadcast               |
| `eta-update`           | Server → Client | ETA change broadcast                 |

**REST Endpoints:**

| Method | Path                                 | Auth   | Description                    |
| ------ | ------------------------------------ | ------ | ------------------------------ |
| GET    | `/api/tracking/public/:awb`          | Public | Public tracking                |
| GET    | `/api/tracking/detailed/:awb`        | JWT    | Detailed tracking + timeline   |
| GET    | `/api/tracking/subscription/:awb`    | JWT    | Pusher subscription info       |
| GET    | `/api/tracking/gateway-status`       | JWT    | WebSocket gateway status       |
| GET    | `/api/tracking/active-subscriptions` | JWT    | Active WebSocket subscriptions |
| GET    | `/api/tracking/monitor`              | JWT    | WebSocket monitoring dashboard |

---

### 9.8 Payments Module

**Path:** `src/modules/payments/`
**Files:** `payments.module.ts`, `payments.controller.ts`, `payments.service.ts`, `dto/`

**Features:**

- COD collection recording on delivery
- Delivery fee transaction recording
- T+7 payout system (7 days after collection → eligible for payout)
- Payout lifecycle: initiate → complete / fail (with wallet reversal)
- Merchant payment statistics
- System-wide payment statistics
- Transaction filtering with pagination

**Transaction Types:**

- `DELIVERY_FEE` — Fee charged for delivery
- `COD_COLLECTION` — COD amount collected from customer
- `COD_PAYOUT` — COD payout to merchant
- `WALLET_CREDIT` / `WALLET_DEBIT` — Wallet operations
- `REFUND` — Refund transactions

**Payout Fee Structure:**

- Bank Transfer: ৳25
- Mobile Banking: ৳15
- Cash: ৳50
- Other: ৳10

**Endpoints:**

| Method | Path                                            | Roles                    | Description                         |
| ------ | ----------------------------------------------- | ------------------------ | ----------------------------------- |
| POST   | `/api/payments/record-cod/:shipmentId`          | Rider, Admin             | Record COD collection               |
| POST   | `/api/payments/record-delivery-fee/:shipmentId` | Admin, Hub Staff         | Record delivery fee                 |
| POST   | `/api/payments/initiate-payout`                 | Admin, Finance           | Initiate merchant payout            |
| PATCH  | `/api/payments/complete-payout/:txnId`          | Admin, Finance           | Mark payout complete                |
| PATCH  | `/api/payments/fail-payout/:txnId`              | Admin, Finance           | Mark payout failed (reverse wallet) |
| GET    | `/api/payments/transactions`                    | Admin, Finance, Merchant | List transactions                   |
| GET    | `/api/payments/transactions/:txnId`             | Admin, Finance, Merchant | Transaction details                 |
| GET    | `/api/payments/pending-collections/:merchantId` | Admin, Finance           | T+7 eligible CODs                   |
| GET    | `/api/payments/pending-balance/:merchantId`     | Admin, Finance           | Available payout balance            |
| GET    | `/api/payments/statistics/merchant/:merchantId` | Admin, Finance, Merchant | Merchant stats                      |
| GET    | `/api/payments/statistics/overall`              | Admin, Finance           | System-wide stats                   |

---

### 9.9 Notifications Module

**Path:** `src/modules/notifications/`
**Files:** `notifications.module.ts`, `notifications.controller.ts`, `notifications.service.ts`, `notifications.processor.ts`, `email.service.ts`, `sms.service.ts`, `push.service.ts`, `dto/`

**Architecture:** Bull Queue-based async processing → Multi-channel delivery (Email + SMS + Push)

**Email Service (Nodemailer):**

- SMTP transport with configurable host/port/auth
- HTML template rendering with dynamic context
- Templates: `otp-verification`, `shipment-created`, `shipment-picked-up`, `shipment-in-transit`, `out-for-delivery`, `delivered`, `failed`, `rto`, `password-reset`, `payout-initiated`, `payout-completed`

**SMS Service:**

- Multi-provider support: Twilio, SSL Wireless, Nexmo, Generic API
- Templates: `shipment-created`, `picked-up`, `out-for-delivery`, `delivered`, `failed-delivery`, `otp-verification`, `delivery-otp`, `cod-collection`, `payout-initiated`, `payout-completed`
- Bulk SMS support

**Push Service (Pusher):**

- Individual and multi-user push
- Role-specific notifications (rider, merchant)
- System-wide broadcast
- Shipment-specific update channels

**Queue Processors:**

- `send-notification` — General notification processing
- `send-email` — Email-specific processing
- `send-sms` — SMS-specific processing
- `send-push` — Push notification processing

**Endpoints:**

| Method | Path                                           | Roles            | Description                            |
| ------ | ---------------------------------------------- | ---------------- | -------------------------------------- |
| POST   | `/api/notifications`                           | Admin            | Send general notification              |
| POST   | `/api/notifications/email`                     | Admin            | Send email                             |
| POST   | `/api/notifications/sms`                       | Admin            | Send SMS                               |
| POST   | `/api/notifications/push`                      | Admin            | Send push notification                 |
| GET    | `/api/notifications/my-notifications`          | All              | My notifications                       |
| GET    | `/api/notifications/unread-count`              | All              | Unread count                           |
| PATCH  | `/api/notifications/:id/read`                  | All              | Mark as read                           |
| PATCH  | `/api/notifications/mark-all-read`             | All              | Mark all as read                       |
| DELETE | `/api/notifications/:id`                       | All              | Delete notification                    |
| GET    | `/api/notifications/statistics`                | Admin            | Notification stats                     |
| POST   | `/api/notifications/shipment/created`          | Admin, Hub Staff | Trigger shipment created notification  |
| POST   | `/api/notifications/shipment/picked-up`        | Admin, Agent     | Trigger picked up notification         |
| POST   | `/api/notifications/shipment/out-for-delivery` | Admin, Hub Staff | Trigger OFD notification               |
| POST   | `/api/notifications/shipment/delivered`        | Admin, Rider     | Trigger delivered notification         |
| POST   | `/api/notifications/shipment/failed`           | Admin, Rider     | Trigger failed notification            |
| POST   | `/api/notifications/rider/pickup-assignment`   | Admin, Hub Staff | Rider pickup assignment notification   |
| POST   | `/api/notifications/rider/manifest-assignment` | Admin, Hub Staff | Rider manifest assignment notification |
| POST   | `/api/notifications/payment/payout-initiated`  | Admin, Finance   | Payout initiated notification          |
| POST   | `/api/notifications/payment/payout-completed`  | Admin, Finance   | Payout completed notification          |

---

### 9.10 Audit Module

**Path:** `src/modules/audit/`
**Files:** `audit.module.ts`, `audit.controller.ts`, `audit.service.ts`, `dto/`

**Features:**

- Manual audit log creation
- Entity-specific logging helpers (Shipment, User, Pickup, Manifest, Transaction, Auth)
- Query with filtering (user, entity type, action, date range, IP)
- Entity audit trail (all changes for a specific entity)
- User activity logs
- Comprehensive audit statistics
- Automatic cleanup of old logs (configurable retention period)
- Change comparison and description generation

**Endpoints:**

| Method | Path                                 | Roles          | Description              |
| ------ | ------------------------------------ | -------------- | ------------------------ |
| POST   | `/api/audit/log`                     | Admin          | Create audit log         |
| GET    | `/api/audit/logs`                    | Admin, Support | Filter/search audit logs |
| GET    | `/api/audit/logs/:id`                | Admin, Support | Get audit log by ID      |
| GET    | `/api/audit/entity/:type/:id`        | Admin, Support | Entity audit trail       |
| GET    | `/api/audit/user/:userId`            | Admin, Support | User activity logs       |
| GET    | `/api/audit/recent`                  | Admin          | Recent logs (dashboard)  |
| GET    | `/api/audit/statistics`              | Admin          | Audit statistics         |
| GET    | `/api/audit/statistics/user/:userId` | Admin, Support | User audit statistics    |

---

### 9.11 Cache Module

**Path:** `src/modules/cache/`
**Files:** `cache.module.ts`, `cache.service.ts`

**Scope:** `@Global()` — সব module-এ inject করা যায়

**Architecture:** 3 Redis clients:

1. **Main Client** — Cache operations (get/set/del)
2. **Pub Client** — Real-time event publishing
3. **Sub Client** — Real-time event subscription

**Supported Operations:**

- **Key-Value:** `get`, `set` (with TTL), `del`, `delPattern`, `exists`, `ttl`, `expire`
- **Hash:** `hget`, `hset`, `hgetall`, `hdel`
- **List:** `lpush`, `rpush`, `lrange`, `ltrim`
- **Set:** `sadd`, `srem`, `smembers`, `sismember`
- **Sorted Set:** `zadd`, `zrem`, `zrangebyscore`, `zremrangebyscore` (SLA tracking-এ ব্যবহৃত)
- **Pub/Sub:** `publish`, `subscribe`, `unsubscribe`
- **Counter:** `incr`, `decr`, `incrby`
- **Utility:** `flushall`, `ping`

**Error Handling:** সব operations try-catch-এ wrapped — Redis error হলে main operation fail হয় না।

---

### 9.12 SLA Watcher Module

**Path:** `src/modules/sla-watcher/`
**Files:** `sla-watcher.module.ts`, `sla-watcher.controller.ts`, `sla-watcher.service.ts`, `sla-watcher.processor.ts`

**Architecture:** `@nestjs/schedule` (cron) + Bull Queue + Redis cache (duplicate prevention)

**SLA Thresholds:**
| SLA Type | Threshold | Check Interval |
|----------|-----------|----------------|
| Pickup SLA | 24 hours | Every 10 minutes |
| Delivery SLA | 72 hours (3 days) | Every 10 minutes |
| In-Transit SLA | 48 hours (no status update) | Every 10 minutes |

**Workflow:**

1. Cron job চলে every 10 minutes
2. Violated shipments query করে
3. Redis cache check করে (duplicate notification prevention)
4. Violation পেলে Bull queue-তে job add করে
5. Notifications পাঠায় (merchant, customer, rider — role-specific channel)
6. Redis Pub/Sub-এ `sla-violations` channel-এ publish করে (dashboard)

**Endpoints:**

| Method | Path                            | Roles                     | Description              |
| ------ | ------------------------------- | ------------------------- | ------------------------ |
| GET    | `/api/sla/statistics`           | Admin, Support, Hub Staff | SLA violation statistics |
| GET    | `/api/sla/shipment/:shipmentId` | Admin, Support, Merchant  | Check shipment SLA       |
| GET    | `/api/sla/queue/status`         | Admin                     | Queue job status         |

---

### 9.13 CSRF Module

**Path:** `src/csrf/`
**Files:** `csrf.controller.ts`, `csrf.module.ts`

**Purpose:** CSRF token generate এবং client-কে deliver করা।

**Endpoint:**

| Method | Path              | Auth   | Description                                  |
| ------ | ----------------- | ------ | -------------------------------------------- |
| GET    | `/api/csrf/token` | Public | Get CSRF token (also set as httpOnly cookie) |

**CSRF Flow:**

1. Client calls `GET /api/csrf/token` → Token received + cookie set
2. Client sends token in `x-csrf-token` header for POST/PUT/PATCH/DELETE requests
3. `CsrfMiddleware` validates: header token === cookie token

---

## 10. API Endpoint Reference (Summary)

### Public Endpoints (No Auth Required):

| Method | Path                        | Module          |
| ------ | --------------------------- | --------------- |
| GET    | `/api`                      | Health check    |
| GET    | `/api/health`               | Health status   |
| GET    | `/api/docs`                 | Swagger UI      |
| GET    | `/api/csrf/token`           | CSRF token      |
| POST   | `/api/auth/signup`          | Registration    |
| POST   | `/api/auth/login`           | Login           |
| POST   | `/api/auth/verify-otp`      | OTP verify      |
| POST   | `/api/auth/resend-otp`      | Resend OTP      |
| POST   | `/api/auth/refresh`         | Refresh token   |
| GET    | `/api/shipments/track/:awb` | Public tracking |
| GET    | `/api/tracking/public/:awb` | Public tracking |

### Role-Based Access Matrix:

| Module           | Admin | Merchant |  Agent  | Hub Staff |   Rider    | Customer | Finance | Support |
| ---------------- | :---: | :------: | :-----: | :-------: | :--------: | :------: | :-----: | :-----: |
| Users CRUD       |  ✅   |    ❌    |   ❌    |    ❌     |     ❌     |    ❌    |   ❌    |  Read   |
| KYC/Wallet       |  ✅   |    ❌    |   ❌    |    ❌     |     ❌     |    ❌    |   ✅    |   ❌    |
| Shipments Create |  ✅   |    ✅    |   ❌    |    ❌     |     ❌     |    ❌    |   ❌    |   ❌    |
| Shipments List   |  ✅   |   Own    |   ❌    |    ✅     |     ❌     |    ❌    |   ❌    |   ✅    |
| Status Update    |  ✅   |    ❌    |   ✅    |    ✅     |     ✅     |    ❌    |   ❌    |   ❌    |
| Pickups Create   |  ❌   |    ✅    |   ❌    |    ❌     |     ❌     |    ❌    |   ❌    |   ❌    |
| Pickups Manage   |  ✅   |    ❌    | Execute |    ✅     |     ❌     |    ❌    |   ❌    |   ❌    |
| Hub Operations   |  ✅   |    ❌    |   ❌    |    ✅     |     ❌     |    ❌    |   ❌    |   ❌    |
| Rider Operations |  ❌   |    ❌    |   ❌    |    ❌     |     ✅     |    ❌    |   ❌    |   ❌    |
| Payments         |  ✅   | Read own |   ❌    |    ❌     | COD record |    ❌    |   ✅    |   ❌    |
| Notifications    |  ✅   |   Own    |   ❌    |  Trigger  |     ❌     |    ❌    | Trigger |   ❌    |
| Audit Logs       |  ✅   |    ❌    |   ❌    |    ❌     |     ❌     |    ❌    |   ❌    |  Read   |
| SLA Monitor      |  ✅   |    ❌    |   ❌    |    ✅     |     ❌     |    ❌    |   ❌    |   ✅    |

---

## 11. Business Logic & Data Flow

### Shipment Lifecycle:

```
MERCHANT                     SYSTEM                      HUB                         RIDER
   │                           │                          │                            │
   ├── Create Shipment ──────→ │ AWB Generate             │                            │
   │                           │ Price Calculate           │                            │
   │                           │ Status: PENDING           │                            │
   │                           │                          │                            │
   ├── Create Pickup ─────────→│                          │                            │
   │                           │ Status: PICKUP_ASSIGNED  │                            │
   │                           │                          │                            │
   │                    ←──── Agent Complete Pickup        │                            │
   │                           │ Status: PICKED_UP        │                            │
   │                           │                          │                            │
   │                           │                  ←─── Inbound Scan                    │
   │                           │                          │ Status: IN_HUB             │
   │                           │                          │                            │
   │                           │                  ←─── Sorting (assign dest hub)       │
   │                           │                          │                            │
   │                           │                  ←─── Outbound Scan                   │
   │                           │                          │ Status: IN_TRANSIT         │
   │                           │                          │         or                 │
   │                           │                          │ Status: OUT_FOR_DELIVERY   │
   │                           │                          │                            │
   │                           │                          │              ←──── Deliver  │
   │                           │                          │                   (OTP +    │
   │                           │                          │                    COD)     │
   │                           │ Status: DELIVERED        │                            │
   │                           │                          │                            │
   │                           │ ─── OR ───               │                            │
   │                           │                          │                            │
   │                           │                          │              ←── Failed     │
   │                           │ Status: FAILED_DELIVERY  │                            │
   │                           │                          │                            │
   │                           │ (3 failures) ──→ RTO     │              ←── RTO Init  │
   │                           │ Status: RTO_INITIATED    │                            │
```

### Payment Flow (COD):

```
1. Shipment delivered → Rider records COD collection
2. Transaction created: type=COD_COLLECTION, status=COMPLETED
3. T+7 days pass → COD becomes eligible for payout
4. Finance/Admin initiates payout
5. Transaction created: type=COD_PAYOUT, status=PROCESSING
6. Merchant wallet credited
7. Payout marked complete → status=COMPLETED
                     OR
   Payout fails → status=FAILED → wallet reversed
```

### Dynamic Pricing Formula:

```
deliveryFee = baseFee + weightFee + distanceFee + expressSurcharge + codFee

Where:
  baseFee         = BASE_DELIVERY_FEE       (default: ৳50)
  weightFee       = ceil(weight_kg) × PER_KG_FEE  (default: ৳20/kg)
  distanceFee     = round(distance_km) × DISTANCE_FEE_PER_KM  (default: ৳5/km)
  expressSurcharge = EXPRESS_SURCHARGE if express  (default: ৳50)
  codFee          = codAmount × COD_FEE_PERCENTAGE / 100  (default: 2%)
```

---

## 12. Security Architecture

### Authentication:

- **JWT Access Token** — Short-lived, from `Authorization: Bearer <token>` header
- **JWT Refresh Token** — Long-lived, stored in `users.refresh_token` column, rotated on refresh
- **OTP Verification** — 6-digit random code, 5-minute expiry, email-based delivery

### Authorization:

- **Global JWT Guard** — সব route default protected, `@Public()` decorator দিয়ে opt-out
- **Role-Based Guard** — `@Roles(UserRole.ADMIN, ...)` decorator দিয়ে role restriction
- **Merchant Scoping** — Merchants শুধু নিজের shipments দেখতে/edit করতে পারে

### CSRF Protection:

- Double-submit cookie pattern
- `httpOnly` cookie + `x-csrf-token` header match required
- GET/HEAD/OPTIONS এবং public auth endpoints exempt

### Rate Limiting:

- `@nestjs/throttler` — 10 requests per 60 seconds (global)

### Password Security:

- bcrypt with 10 salt rounds
- Minimum 8 characters (Signup DTO validation)

### Data Sanitization:

- `password`, `refreshToken`, `otpCode`, `twoFaSecret` সব response থেকে stripped (`@Exclude()` + manual sanitization)
- Global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`

---

## 13. Real-Time System (WebSocket + Redis Pub/Sub)

### Architecture:

```
                                    ┌──────────────┐
Client (Socket.IO) ──→ WebSocket ──→│ Tracking     │──→ Redis Pub/Sub ──→ Other instances
                       Gateway      │ Gateway      │
                                    └──────┬───────┘
                                           │
                                     ┌─────▼─────┐
                                     │ Tracking   │──→ Pusher (push notifications)
                                     │ Service    │
                                     └───────────┘
```

### WebSocket Gateway (`tracking.gateway.ts`):

- Socket.IO-based, handles subscribe/unsubscribe per AWB
- Broadcasts status updates, location updates, ETA updates
- Tracks active subscriptions and connected clients
- Monitoring dashboard endpoint

### Redis Pub/Sub Channels:

- `tracking:status:{awb}` — Shipment status changes
- `tracking:location:{awb}` — Rider GPS updates
- `sla-violations` — SLA breach alerts
- Custom channels per feature

### Pusher Integration:

- Per-shipment channels: `shipment-{awb}`
- Per-user channels: `user-{userId}`
- Role-specific channels: `rider-{riderId}`, `merchant-{merchantId}`
- System broadcast channel

---

## 14. Queue & Background Jobs

### Bull Queues:

| Queue Name      | Processors                                                                  | Purpose                     |
| --------------- | --------------------------------------------------------------------------- | --------------------------- |
| `notifications` | `send-notification`, `send-email`, `send-sms`, `send-push`                  | Async notification delivery |
| `sla-watcher`   | `pickup-sla-violation`, `delivery-sla-violation`, `intransit-sla-violation` | SLA violation processing    |

### Cron Jobs:

| Schedule         | Service             | Method                 | Purpose               |
| ---------------- | ------------------- | ---------------------- | --------------------- |
| Every 10 minutes | `SlaWatcherService` | `checkSLAViolations()` | Scan for SLA breaches |

### Queue Provider:

- **Redis** — Bull queue backend (`@nestjs/bull`)
- Connection: `REDIS_HOST` + `REDIS_PORT` from environment

---

## 15. Migrations & Seed Data

### Available Migrations:

| Migration                           | Purpose                                 |
| ----------------------------------- | --------------------------------------- |
| `1761771966395-EnableUuidExtension` | PostgreSQL `uuid-ossp` extension enable |
| `1761770940616-SeedInitialData`     | Seed initial users                      |

### Seed Users (Development):

| Email                | Password       | Role                     |
| -------------------- | -------------- | ------------------------ |
| `admin@fastx.com`    | `Admin@123456` | Admin                    |
| `merchant@fastx.com` | `Merchant@123` | Merchant (wallet: ৳5000) |
| `rider@fastx.com`    | `Rider@123`    | Rider                    |
| `hub@fastx.com`      | `Hub@123`      | Hub Staff                |

---

## 16. Environment Variables

```env
# Server
PORT=30001
NODE_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=courier_service
USE_MIGRATIONS=false

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d

# OTP
OTP_EXPIRATION=300

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# CSRF
CSRF_SECRET=your-csrf-secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@fastx.com

# SMS Gateway
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# Pusher
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=

# Pricing
BASE_DELIVERY_FEE=50
PER_KG_FEE=20
DISTANCE_FEE_PER_KM=5
EXPRESS_SURCHARGE=50
COD_FEE_PERCENTAGE=2
EXPRESS_SLA_HOURS=24
NORMAL_SLA_HOURS=72
```

---

## 17. NPM Scripts

| Script               | Command                              | Purpose                                |
| -------------------- | ------------------------------------ | -------------------------------------- |
| `start`              | `nest start`                         | Start application                      |
| `start:dev`          | `nest start --watch`                 | Start with hot-reload                  |
| `start:debug`        | `nest start --debug --watch`         | Start with debugger                    |
| `start:prod`         | `node dist/main`                     | Start production build                 |
| `build`              | `nest build`                         | Build project                          |
| `lint`               | `eslint --fix`                       | Lint and fix code                      |
| `format`             | `prettier --write`                   | Format code                            |
| `test`               | `jest`                               | Run unit tests                         |
| `test:watch`         | `jest --watch`                       | Run tests in watch mode                |
| `test:cov`           | `jest --coverage`                    | Run tests with coverage                |
| `test:e2e`           | `jest --config ./test/jest-e2e.json` | Run e2e tests                          |
| `migration:generate` | TypeORM migration generate           | Generate migration from entity changes |
| `migration:run`      | TypeORM migration run                | Run pending migrations                 |
| `migration:revert`   | TypeORM migration revert             | Revert last migration                  |
| `migration:show`     | TypeORM migration show               | Show migration status                  |

---

## 18. Dependencies

### Production Dependencies:

| Package                      | Version | Purpose              |
| ---------------------------- | ------- | -------------------- |
| `@nestjs/common`             | ^11.0.1 | NestJS core          |
| `@nestjs/core`               | ^11.0.1 | NestJS core          |
| `@nestjs/platform-express`   | ^11.0.1 | Express adapter      |
| `@nestjs/config`             | ^4.0.2  | Environment config   |
| `@nestjs/typeorm`            | ^11.0.0 | TypeORM integration  |
| `@nestjs/jwt`                | ^11.0.1 | JWT module           |
| `@nestjs/passport`           | ^11.0.5 | Passport integration |
| `@nestjs/swagger`            | ^11.2.1 | Swagger/OpenAPI      |
| `@nestjs/throttler`          | ^6.4.0  | Rate limiting        |
| `@nestjs/bull`               | ^11.0.4 | Bull queue           |
| `@nestjs/schedule`           | ^6.0.1  | Task scheduling      |
| `@nestjs/websockets`         | ^11.1.8 | WebSocket support    |
| `@nestjs/platform-socket.io` | ^11.1.8 | Socket.IO adapter    |
| `typeorm`                    | ^0.3.27 | ORM                  |
| `passport-jwt`               | ^4.0.1  | JWT strategy         |
| `bcrypt`                     | ^6.0.0  | Password hashing     |
| `ioredis`                    | ^5.8.2  | Redis client         |
| `bull`                       | ^4.16.5 | Queue library        |
| `nodemailer`                 | ^7.0.10 | Email sending        |
| `pusher`                     | ^5.2.0  | Push notifications   |
| `socket.io`                  | ^4.8.1  | WebSocket library    |
| `class-validator`            | ^0.14.2 | DTO validation       |
| `class-transformer`          | ^0.5.1  | DTO transformation   |
| `cookie-parser`              | ^1.4.7  | Cookie parsing       |
| `nest-winston`               | ^1.10.2 | Winston logger       |
| `winston`                    | ^3.18.3 | Logging library      |
| `uuid`                       | ^13.0.0 | UUID generation      |
| `moment`                     | ^2.30.1 | Date manipulation    |
| `rxjs`                       | ^7.8.1  | Reactive programming |

### Dev Dependencies:

| Package           | Version | Purpose                     |
| ----------------- | ------- | --------------------------- |
| `@nestjs/cli`     | ^11.0.0 | NestJS CLI                  |
| `@nestjs/testing` | ^11.0.1 | Test utilities              |
| `jest`            | ^30.0.0 | Test runner                 |
| `ts-jest`         | ^29.2.5 | TypeScript Jest transformer |
| `supertest`       | ^7.0.0  | HTTP testing                |
| `typescript`      | ^5.7.3  | TypeScript compiler         |
| `eslint`          | ^9.18.0 | Linting                     |
| `prettier`        | ^3.4.2  | Code formatting             |
| `pg`              | ^8.16.3 | PostgreSQL driver           |
| `ts-node`         | ^10.9.2 | TypeScript execution        |

---

> **Document generated:** Full backend codebase analysis of FastX Courier Service
> **Total Modules:** 13 (Auth, Users, Shipments, Pickup, Hub, Rider, Tracking, Payments, Notifications, Audit, Cache, SLA Watcher, CSRF)
> **Total Entities:** 8 (User, Shipment, Pickup, Manifest, Transaction, Notification, RiderLocation, AuditLog)
> **Total API Endpoints:** 70+
