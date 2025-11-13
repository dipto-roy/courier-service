# 📦 Courier Service API

> A comprehensive courier/delivery management system built with NestJS, TypeORM, and PostgreSQL

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="80" alt="Nest Logo" /></a>
</p>

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=flat&logo=typeorm&logoColor=white)](https://typeorm.io/)

---

## 🚀 Features

- **🔐 Authentication & Authorization** — JWT-based auth (access + refresh tokens) with role guards (RBAC)
- **📦 Shipment Management** — Create, track, update shipments; AWB-based public tracking supported
- **📊 Bulk Upload (CSV)** — Simplified CSV bulk upload is implemented in `ShipmentsService.bulkUpload()` (basic parser; use with care)
- **� GPS Tracking & WebSocket** — Rider location updates via `/api/rider/update-location` and real-time tracking via Socket.IO (`/tracking` namespace). Location coordinates are stored with DECIMAL(10,7) precision; client-side GPS accuracy depends on device.
- **📱 Rider Operations** — OTP generation, delivery completion, failed delivery handling, and RTO workflows are implemented in the `rider` module
- **🎯 Public Tracking** — Track shipments by AWB via `/api/shipments/track/:awb` (public endpoint, cached)
- **💰 COD Support** — COD fields and basic COD handling exist (codAmount, codFee) and transactions stored; full wallet features may be partial or require configuration
- **📈 Statistics & Analytics (Basic)** — Per-entity statistics endpoints (shipments, riders). Dashboards/advanced analytics are not included out-of-the-box
- **🔄 Manifest System** — Manifests and hub operations are available in the `hub`/`manifest` modules
- **� Geo Utilities (Distance)** — `GeoService` implements distance calculation (Haversine) and a simple location-based estimator. Automatic address-to-coordinates geocoding (third-party API) is not integrated by default.


---

## 📚 Documentation

**📖 [Complete API Documentation](./API_DOCUMENTATION.md)** — Full API reference with examples  
**🎯 [Dynamic Pricing System](./DYNAMIC_PRICING_SYSTEM.md)** — Zone-based pricing implementation guide  
**📍 [GPS-Free Pricing](./PRICING_WITHOUT_GPS.md)** — Location-based pricing without GPS coordinates

**Includes:**
- Complete endpoint reference with request/response schemas
- cURL examples for all operations
- End-to-end testing scenarios
- Database schema and entity relationships
- Troubleshooting guide
- Production deployment checklist

---

## 🏗️ Architecture

**Modules:**
- `auth` — User authentication (signup, login, OTP, JWT)
- `shipments` — Shipment CRUD, tracking, bulk upload, statistics
- `rider` — GPS tracking, delivery operations, manifests
- `manifest` — Shipment grouping and dispatch management
- `pricing` — Dynamic pricing calculation
- `geo` — Geocoding and location services

**Tech Stack:**
- **Framework:** NestJS (Node.js/TypeScript)
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT (access + refresh tokens)
- **Validation:** class-validator, class-transformer
- **Documentation:** Swagger/OpenAPI decorators

---

## 🛠️ Quick Start

### Prerequisites

- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/dipto-roy/courier-service.git
cd courier-service

# Install dependencies
npm install
```

### Configuration

Create `.env` file:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=courier_service

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Redis (optional for caching)
REDIS_HOST=localhost
REDIS_PORT=6379

# App
PORT=3001
NODE_ENV=development
```

### Database Setup

```bash
# Create database
createdb courier_service

# Run migrations (if available)
npm run migration:run
```

### Description

Courier Service API — Built with [NestJS](https://github.com/nestjs/nest) framework

## 🚀 Running the Application

```bash
# Development mode (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

Application runs on: **http://localhost:3001**

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Quick API Test

```bash
# Health check
curl http://localhost:3001

# Create user
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"01712345678","password":"Test123!","role":"merchant"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

**See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete testing guide with cURL examples.**

---

## 📖 API Overview

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/verify-otp` | Verify OTP | Public |
| POST | `/api/auth/refresh` | Refresh token | Public |
| POST | `/api/auth/logout` | Logout user | Bearer |
| GET | `/api/auth/me` | Get profile | Bearer |

### Shipment Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/shipments` | Create shipment | Merchant, Admin |
| POST | `/api/shipments/bulk-upload` | Bulk CSV upload | Merchant, Admin |
| GET | `/api/shipments` | List shipments | Merchant, Admin, Support |
| GET | `/api/shipments/:id` | Get by ID | Multiple |
| GET | `/api/shipments/track/:awb` | Track by AWB | Public |
| PATCH | `/api/shipments/:id` | Update shipment | Merchant, Admin |
| PATCH | `/api/shipments/:id/status` | Update status | Admin, Rider, Agent |
| DELETE | `/api/shipments/:id` | Delete shipment | Merchant, Admin |

### Rider Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/rider/update-location` | Update GPS location | Rider |
| GET | `/api/rider/location-history` | Get location history | Rider, Admin |
| GET | `/api/rider/manifests` | Get assigned manifests | Rider |
| GET | `/api/rider/shipments` | Get assigned shipments | Rider |
| POST | `/api/rider/generate-otp` | Generate delivery OTP | Rider |
| POST | `/api/rider/complete-delivery` | Complete delivery | Rider |
| POST | `/api/rider/record-failed-delivery` | Record failed attempt | Rider |
| POST | `/api/rider/mark-rto` | Mark for RTO | Rider |
| GET | `/api/rider/statistics` | Get rider stats | Rider |

**📖 [Full API Documentation](./API_DOCUMENTATION.md)** with detailed schemas and examples

---

## 🎯 User Roles

| Role | Permissions |
|------|-------------|
| **Merchant** | Create shipments, bulk upload, view own shipments, track orders |
| **Rider** | Update GPS location, complete deliveries, manage assigned shipments |
| **Admin** | Full access to all operations, manage users, view analytics |
| **Customer** | Track shipments, view order history |
| **Agent** | Update shipment status, handle customer support |
| **Hub Staff** | Manage manifests, shipment dispatch, warehouse operations |
| **Support** | View shipments, assist customers, access statistics |

---

## 📊 Database Schema

### Key Tables

- **users** — User accounts (merchants, riders, customers, admin)
- **shipments** — Delivery orders with sender/receiver info, GPS coordinates
- **rider_locations** — Real-time GPS tracking data (DECIMAL(10,7) precision)
- **manifests** — Grouped shipments for dispatch
- **transactions** — Wallet transactions, COD collections
- **notifications** — System notifications

**GPS Precision:** `DECIMAL(10,7)` provides ±1.1 cm accuracy

---

## 🔧 Development

### Folder Structure

```
src/
├── modules/
│   ├── auth/              # Authentication & authorization
│   ├── shipments/         # Shipment management
│   ├── rider/             # Rider operations & GPS tracking
│   ├── manifest/          # Manifest management
│   └── ...
├── entities/              # TypeORM entities
├── common/
│   ├── guards/            # JWT, Roles guards
│   ├── decorators/        # Custom decorators (@CurrentUser, @Roles)
│   ├── enums/             # Enums (UserRole, ShipmentStatus, etc.)
│   ├── filters/           # Exception filters
│   └── pipes/             # Validation pipes
├── config/                # Configuration modules
└── main.ts                # Application entry point
```

### Code Quality

```bash
# Linting
npm run lint

# Format code
npm run format

# Type checking
npm run build
```

---

## 🚢 Deployment

### Production Checklist

**✅ Implemented & Ready:**
- [x] JWT authentication with refresh tokens
- [x] PostgreSQL database with TypeORM
- [x] GPS tracking endpoints (rider location updates)
- [x] WebSocket real-time tracking (Socket.IO)
- [x] Basic Redis configuration (optional caching)
- [x] CSV bulk upload (basic parser)
- [x] COD handling and transactions
- [x] Manifest system

**🔧 Configuration Required:**
- [ ] Set strong `JWT_SECRET` in environment
- [ ] Configure PostgreSQL with SSL
- [ ] Enable HTTPS for API endpoints
- [ ] Set up Redis for production caching (optional)
- [ ] Configure SMS/Email gateway for OTP sending (currently stored but not sent)
- [ ] Set up file storage (S3/CloudFlare R2) for POD images
- [ ] Enable CORS with proper origins
- [ ] Configure Pusher for real-time updates (optional, Socket.IO already works)
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure rate limiting
- [ ] Set up automated database backups
- [ ] Enable connection pooling
- [ ] Configure reverse proxy (Nginx/Caddy)
- [ ] Set up CI/CD pipeline
- [ ] Configure geocoding API (optional for address-to-coordinates)

**⚠️ Known Limitations:**
- CSV bulk upload uses simplified parser — validate format carefully in production
- OTP generation implemented but SMS/Email sending requires gateway configuration
- GPS coordinates stored with high precision, but client accuracy depends on device hardware
- Some endpoints may require additional testing (see `NOT_WORKING_ENDPOINTS.md` if present)

### Build for Production

```bash
# Build
npm run build

# Start production server
npm run start:prod

# Or use PM2
pm2 start dist/main.js --name courier-api
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["node", "dist/main.js"]
```

---

## 📁 Project Documentation

### Core Documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** — Complete API reference (70+ endpoints)
- **[DYNAMIC_PRICING_SYSTEM.md](./DYNAMIC_PRICING_SYSTEM.md)** — Zone-based pricing with Dhaka/outside upozila rates
- **[PRICING_WITHOUT_GPS.md](./PRICING_WITHOUT_GPS.md)** — GPS-free location-based pricing solution

### Integration Guides
- **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** — Frontend integration examples
- **[GPS_TRACKING_GUIDE.md](./GPS_TRACKING_GUIDE.md)** — Real-time GPS tracking implementation
- **[NEXTJS_PRODUCTION_GUIDE.md](./NEXTJS_PRODUCTION_GUIDE.md)** — Next.js 15 production setup

### Troubleshooting & Data
- **[FIX_GPS_NULL_ISSUE.md](./FIX_GPS_NULL_ISSUE.md)** — GPS null value troubleshooting
- **[COMPLETE_TEST_DATA.json](./COMPLETE_TEST_DATA.json)** — Test data samples
- **[GPS_TRACKING_TEST_REPORT.md](./GPS_TRACKING_TEST_REPORT.md)** — GPS testing results

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is [MIT licensed](LICENSE).

---

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/) — A progressive Node.js framework
- Database management with [TypeORM](https://typeorm.io/)
- API documentation with [Swagger](https://swagger.io/)

---

## 📞 Support & Contact

- **Repository:** [github.com/dipto-roy/courier-service](https://github.com/dipto-roy/courier-service)
- **Issues:** [Report bugs or request features](https://github.com/dipto-roy/courier-service/issues)
- **Author:** dipto-roy

---

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://jwt.io/introduction)

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** Production Ready (with configuration)

---

Made with ❤️ using NestJS
