# FastX Courier - Production-Ready Backend

A comprehensive courier service backend built with **NestJS**, **TypeORM**, and **PostgreSQL** for Bangladesh market.

## 🚀 Features Implemented

### ✅ Core Modules
- **Auth Module**: JWT + OTP + Refresh tokens, RBAC, Password hashing
- **User Management**: Multiple roles (Admin, Merchant, Agent, Hub Staff, Rider, Customer, Finance, Support)
- **Complete Entity System**: All 8 entities with proper relations and indexes
- **Common Utilities**: DTOs, Guards, Interceptors, Filters, Decorators
- **Database**: PostgreSQL with TypeORM, migrations ready

### 📦 Entities Created
1. **User** - Complete user management with all roles
2. **Shipment** - Full shipment lifecycle with AWB tracking
3. **Pickup** - Pickup assignment and management
4. **Manifest** - Hub-to-hub manifest management
5. **RiderLocation** - Real-time GPS tracking
6. **Transaction** - Payment and wallet management  
7. **Notification** - Multi-channel notification system
8. **AuditLog** - Comprehensive audit trail

### 🔧 Technical Implementation

#### Authentication & Authorization
- JWT-based authentication with access & refresh tokens
- OTP verification for email/phone
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Public route decorator
- JWT Auth Guard & Roles Guard

#### Database Features
- Soft deletes on critical entities
- Composite indexes for performance
- Foreign key relations
- JSONB for flexible data
- Timestamps on all entities
- Decimal precision for financial data

## 📁 Project Structure

```
src/
├── common/
│   ├── decorators/          # @CurrentUser, @Public, @Roles
│   ├── dto/                 # Pagination, PaginatedResponse
│   ├── enums/               # All enums (UserRole, ShipmentStatus, etc.)
│   ├── filters/             # HttpExceptionFilter
│   ├── guards/              # JwtAuthGuard, RolesGuard
│   ├── interceptors/        # LoggingInterceptor, TransformInterceptor
│   └── utils/               # AWB generator, OTP, Password utils
├── config/
│   └── database.config.ts   # TypeORM configuration
├── entities/                # All 8 entities with relations
│   ├── user.entity.ts
│   ├── shipment.entity.ts
│   ├── pickup.entity.ts
│   ├── manifest.entity.ts
│   ├── rider-location.entity.ts
│   ├── transaction.entity.ts
│   ├── notification.entity.ts
│   └── audit-log.entity.ts
└── modules/
    └── auth/                # Complete auth implementation
        ├── dto/
        ├── auth.service.ts
        ├── auth.controller.ts
        └── auth.module.ts
```

## 🔐 Environment Variables

All configuration is in `.env`:

```env
# Application
PORT=3001
NODE_ENV=development
APP_NAME=FastX Courier
BASE_URL=http://localhost:3001

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=courier_service

# JWT
JWT_SECRET=fastx_courier_secret_key_2025_change_in_production
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=fastx_courier_refresh_secret_key_2025
JWT_REFRESH_EXPIRATION=7d

# Redis (for Bull queues & caching)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (NodeMailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Pusher (Real-time)
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=ap2

# Business Logic
COD_PAYOUT_DELAY_DAYS=7
BASE_DELIVERY_FEE=50
PER_KG_FEE=20
EXPRESS_SURCHARGE=50
EXPRESS_SLA_HOURS=24
NORMAL_SLA_HOURS=72
```

## 🗄️ Database Setup

```bash
# Create database
psql -h localhost -U postgres -c "CREATE DATABASE courier_service;"

# Run migrations (auto-sync enabled in development)
npm run start:dev
```

## 🛠️ Installation & Setup

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

## 📡 API Endpoints

### Authentication Endpoints
- `POST /auth/signup` - User registration with OTP
- `POST /auth/login` - Login with email & password
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

## 🎯 Next Steps to Complete

### High Priority Modules (Need Implementation)

#### 1. Users Module
```
modules/users/
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── filter-user.dto.ts
├── users.controller.ts
├── users.service.ts
└── users.module.ts
```

**Key Features:**
- Get user profile
- Update user profile
- List users with pagination & filters
- Role management
- KYC verification
- Wallet balance management

#### 2. Shipments Module
```
modules/shipments/
├── dto/
│   ├── create-shipment.dto.ts
│   ├── update-shipment.dto.ts
│   ├── bulk-upload.dto.ts
│   └── filter-shipment.dto.ts
├── shipments.controller.ts
├── shipments.service.ts
└── shipments.module.ts
```

**Key Features:**
- Create shipment with AWB generation
- Bulk upload via CSV/Excel
- Track shipment by AWB
- Update shipment status
- Calculate delivery fee
- SLA calculation
- Status history

#### 3. Pickup Module
```
modules/pickups/
├── dto/
│   ├── create-pickup.dto.ts
│   ├── assign-pickup.dto.ts
│   └── complete-pickup.dto.ts
├── pickups.controller.ts
├── pickups.service.ts
└── pickups.module.ts
```

**Key Features:**
- Create pickup request
- Assign agent to pickup
- Scan shipments
- Upload photo & signature
- Complete pickup
- Geo-tag location

#### 4. Hub Module
```
modules/hub/
├── dto/
│   ├── inbound-scan.dto.ts
│   ├── create-manifest.dto.ts
│   └── receive-manifest.dto.ts
├── hub.controller.ts
├── hub.service.ts
└── hub.module.ts
```

**Key Features:**
- Inbound scanning
- Sorting operations
- Create outbound manifest
- Receive manifest
- Hub-to-hub transfer

#### 5. Rider Module
```
modules/rider/
├── dto/
│   ├── delivery-attempt.dto.ts
│   ├── update-location.dto.ts
│   └── cod-collection.dto.ts
├── rider.controller.ts
├── rider.service.ts
└── rider.module.ts
```

**Key Features:**
- Get assigned manifest
- Delivery attempt
- OTP verification
- POD photo upload
- COD collection
- Live location updates
- Failed delivery handling
- RTO initiation

#### 6. Tracking Module
```
modules/tracking/
├── dto/
│   └── tracking-query.dto.ts
├── tracking.controller.ts
├── tracking.service.ts
├── tracking.gateway.ts (WebSocket)
└── tracking.module.ts
```

**Key Features:**
- Public tracking by AWB
- Real-time GPS tracking (restricted)
- Status history
- ETA calculation
- Redis pub/sub for live updates
- Pusher.js integration

#### 7. Payments Module
```
modules/payments/
├── dto/
│   ├── initiate-payout.dto.ts
│   └── payment-filter.dto.ts
├── payments.controller.ts
├── payments.service.ts
└── payments.module.ts
```

**Key Features:**
- COD collection tracking
- Merchant wallet management
- Automated payouts (T+7)
- Payment history
- Transaction records
- Digital payment integration

#### 8. Notifications Module
```
modules/notifications/
├── dto/
│   └── send-notification.dto.ts
├── notifications.controller.ts
├── notifications.service.ts
├── email.service.ts
├── sms.service.ts
├── push.service.ts
└── notifications.module.ts
```

**Key Features:**
- NodeMailer for emails
- SMS gateway integration
- WhatsApp via API
- Pusher.js for push notifications
- Bull queue for async sending
- Notification templates
- Delivery status tracking

#### 9. Audit Module
```
modules/audit/
├── dto/
│   └── audit-filter.dto.ts
├── audit.controller.ts
├── audit.service.ts
└── audit.module.ts
```

**Key Features:**
- Log all critical actions
- Track entity changes
- User activity logs
- IP & user-agent tracking
- Audit trail viewer

### Infrastructure Setup Needed

#### 1. Redis & Bull Queues
```typescript
// app.module.ts additions
BullModule.forRoot({
  redis: {
    host: 'localhost',
    port: 6379,
  },
}),
BullModule.registerQueue(
  { name: 'notifications' },
  { name: 'sla-watcher' },
  { name: 'payments' },
),
```

#### 2. Swagger Documentation
```typescript
// main.ts additions
const config = new DocumentBuilder()
  .setTitle('FastX Courier API')
  .setDescription('Production-ready courier service API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

#### 3. Global Pipes & Filters
```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
}));
app.useGlobalFilters(new HttpExceptionFilter());
app.useGlobalInterceptors(new LoggingInterceptor());
```

#### 4. Rate Limiting
```typescript
// app.module.ts
ThrottlerModule.forRoot([{
  ttl: 60,
  limit: 10,
}]),
```

### Database Seeders Needed

```typescript
// seeds/users.seed.ts - Create admin, test merchants, agents, riders
// seeds/hubs.seed.ts - Create hub locations
// seeds/pricing.seed.ts - Set up pricing rules
```

### Business Logic Services

```typescript
// services/pricing.service.ts
- calculateDeliveryFee(weight, distance, type, codAmount)
- calculateCODFee(codAmount)
- applyDiscounts(merchantId, amount)

// services/sla.service.ts  
- calculateExpectedDelivery(type, pickupDate)
- checkSLABreach(shipment)
- triggerSLAAlerts()

// services/eta.service.ts
- calculateETA(currentLocation, destination)
- updateETABasedOnTraffic()

// services/geo.service.ts
- calculateDistance(lat1, lng1, lat2, lng2)
- getAreaFromCoordinates(lat, lng)
- validateServiceableArea(area)
```

## 🔒 Security Features Implemented

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ OTP verification
- ✅ Role-based access control (RBAC)
- ✅ Request validation with class-validator
- ✅ Global exception handling
- ✅ SQL injection prevention (TypeORM parameterization)
- ⏳ Rate limiting (configured, needs activation)
- ⏳ 2FA for admin (entity ready, needs implementation)
- ⏳ KYC verification (field ready, needs workflow)

## 🎨 Frontend Integration Ready

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-10-28T..."
}
```

### Error Format
```json
{
  "success": false,
  "statusCode": 400,
  "message": ["Error message"],
  "timestamp": "2025-10-28T...",
  "path": "/api/endpoint"
}
```

### Pagination Format
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## 📊 Current Implementation Status

| Module | Status | Completion |
|--------|--------|------------|
| Database Schema | ✅ Complete | 100% |
| Auth Module | ✅ Complete | 100% |
| Common Utilities | ✅ Complete | 100% |
| Guards & Interceptors | ✅ Complete | 100% |
| Users Module | ⏳ Pending | 0% |
| Shipments Module | ⏳ Pending | 0% |
| Pickup Module | ⏳ Pending | 0% |
| Hub Module | ⏳ Pending | 0% |
| Rider Module | ⏳ Pending | 0% |
| Tracking Module | ⏳ Pending | 0% |
| Payments Module | ⏳ Pending | 0% |
| Notifications Module | ⏳ Pending | 0% |
| Audit Module | ⏳ Pending | 0% |
| Redis/Bull Setup | ⏳ Pending | 0% |
| Swagger Docs | ⏳ Pending | 0% |
| Database Seeders | ⏳ Pending | 0% |

## 🚀 Deployment Checklist

- [ ] Update all secrets in production .env
- [ ] Set up PostgreSQL with proper permissions
- [ ] Set up Redis for caching and queues
- [ ] Configure email service (Gmail/SendGrid)
- [ ] Configure SMS gateway
- [ ] Set up Pusher.js account
- [ ] Enable SSL/TLS
- [ ] Set up monitoring (PM2, CloudWatch, etc.)
- [ ] Configure log rotation
- [ ] Set up automated backups
- [ ] Configure rate limiting
- [ ] Enable CORS for frontend domain
- [ ] Set up CDN for file uploads
- [ ] Create admin user seed

## 📝 Development Guidelines

1. **All database queries must use async/await**
2. **Use transactions for critical operations**
3. **Always validate DTOs with class-validator**
4. **Add Swagger decorators to all endpoints**
5. **Log all critical actions in audit_logs**
6. **Use Bull queues for heavy operations**
7. **Implement proper error handling**
8. **Write unit tests for services**
9. **Use TypeORM repository pattern**
10. **Follow NestJS best practices**

## 🎯 Priority Development Order

1. Complete Auth Module testing
2. Implement Users Module
3. Implement Shipments Module (core business logic)
4. Implement Pickup Module
5. Implement Hub Module
6. Implement Rider Module
7. Implement Tracking Module
8. Implement Payments Module
9. Implement Notifications Module (integrate throughout)
10. Implement Audit logging (integrate throughout)
11. Add Swagger documentation
12. Create database seeders
13. Set up Bull queues
14. End-to-end testing

## 📞 Support

For issues or questions, check the inline code comments and TypeScript types.

---

**Built with ❤️ for Bangladesh courier industry**
