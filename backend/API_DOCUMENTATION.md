# Courier Service — Project & API Documentation

> Comprehensive project overview and API reference for the courier-service NestJS project.

---

## Table of contents

- Project overview
- Architecture & modules
- Tech stack
- Setup & run
- Database & entities
- Authentication & roles
- Full API reference (endpoints + request/response examples)
  - Auth (signup, login)
  - Shipments (create, list, find, track, bulk upload, update, status changes)
  - Rider operations (update-location, location-history, manifests, delivery actions)
  - Public tracking (track by AWB)
- Example cURL calls (signup/login, create shipment, update location)
- Troubleshooting & notes

---

## Project overview

This repository implements a courier/delivery backend service built with NestJS and TypeORM (Postgres). It provides APIs for merchants, riders, agents, hub staff and admin to create/manage shipments, track riders in real-time, and perform delivery operations (OTP, failed delivery recording, RTO, POD collection, COD handling).

The project includes:
- User management (roles: merchant, rider, admin, customer, agent, hub_staff, support)
- Shipments lifecycle and bulk upload via CSV
- Rider real-time location tracking (rider_locations)
- Public AWB tracking endpoint
- Role-based guards and JWT authentication

This documentation summarizes the modules, endpoints, DTO shapes and example requests/responses so you can use and extend the API.

---

## Architecture & modules

Core modules (found in `src/modules`):
- `auth` — Sign up, login, token issuance, profile update, OTP bypass in testing
- `shipments` — `ShipmentsController`, `ShipmentsService` (create, bulk-upload, find, update, stats, track-by-AWB)
- `rider` — `RiderController`, `RiderService` (update-location, location-history, manifests, delivery operations)
- Entities: `Shipment`, `User`, `RiderLocation`, `Manifest`, etc. (in `src/entities`)

Guards and decorators (in `src/common`):
- `JwtAuthGuard` — protects bearer-token endpoints
- `RolesGuard` and `@Roles()` decorator — enforces role-based access
- `@CurrentUser()` decorator — injects authenticated user

---

## Tech stack

- Node.js (JS/TS)
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Swagger decorators used in controllers (for annotations)

---

## Setup & run

Prerequisites:
- Node 16+ (or project's targeted Node version)
- PostgreSQL running (database: `courier_service` in the dev environment used during testing)

Common commands (adapt if your project uses yarn/pnpm):

```bash
# install
npm install

# development
npm run start:dev

# production build
npm run build
npm run start:prod

# run tests (if available)
npm run test
npx jest
```

Environment variables (typical — inspect `src/config` or `.env.example`):
- DATABASE_URL / PGHOST / PGUSER / PGPASSWORD / PGDATABASE / PGPORT
- JWT_SECRET, JWT_EXPIRES_IN
- REDIS_URL (if used for caching)
- OTHER provider API KEYS (for geocoding or SMS) — check project config

---

## Database & key entities

High level entities (fields summarized):

- `User` (users table) — id, name, email, phone, role, isVerified, address, city, area, latitude?, longitude?, walletBalance, isActive
- `Shipment` (shipments) — id, awb, merchantId, senderName/phone/address, receiverName/phone/address, receiver_latitude?, receiver_longitude?, weight, codAmount, deliveryType, status, deliveryAttempts, expectedDeliveryDate, createdAt
- `RiderLocation` (rider_locations) — id, riderId, latitude, longitude, accuracy, speed, heading, batteryLevel, isOnline, timestamp/createdAt
- `Manifest` — manifests grouping shipments for dispatch

Notes:
- Some fields (receiver_latitude/receiver_longitude, user latitude/longitude) may be optional and can be NULL if not provided by API; ensure your clients send lat/lon when required.

---

## Authentication & roles

- JWT Bearer tokens protect most endpoints (`@ApiBearerAuth()` used in controllers).
- Roles enforced via `@Roles(...)`. Typical roles used in controllers:
  - `UserRole.MERCHANT`: create shipments, bulk upload
  - `UserRole.RIDER`: update location, complete deliveries, mark RTO
  - `UserRole.ADMIN`, `SUPPORT`, `HUB_STAFF`: access stats and shipment lists
- Public endpoint: `GET /shipments/track/:awb` (public AWB tracking)

---

## API reference (complete endpoints)

The API controllers are annotated with Swagger decorators and follow REST principles. This section lists all endpoints with detailed request/response schemas.

**Base URL:** `http://localhost:3001` (confirm from `main.ts` / configuration)

---

### 🔐 Authentication Module

Base path: `/api/auth`

#### POST /api/auth/signup

**Description:** User registration (public endpoint)

**Roles:** Public (no authentication required)

**Request Body (SignupDto):**

| Field | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| name | string | ✅ | "John Doe" | Full name |
| email | string | ✅ | "john@example.com" | Email address |
| phone | string | ✅ | "01712345678" | Phone number |
| password | string | ✅ | "SecurePass123!" | Password (min 8 chars) |
| role | enum | ❌ | "merchant" | UserRole enum (customer, merchant, rider, agent, hub_staff, admin, support) |
| city | string | ❌ | "Dhaka" | City name |
| area | string | ❌ | "Gulshan" | Area name |
| address | string | ❌ | "House 10, Road 5" | Full address |
| merchantBusinessName | string | ❌ | "FastX Mart" | Business name (for merchants) |

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GPS Rider Test",
    "email": "rider9999@test.com",
    "phone": "01335555555",
    "password": "Test123!",
    "role": "rider",
    "city": "Dhaka",
    "area": "Gulshan",
    "address": "Gulshan Base"
  }'
```

**Response (201):**
```json
{
  "message": "User created successfully. Please verify your account with OTP.",
  "user": {
    "id": "c39b8b70-4dd8-46e5-a1c8-7edda2387430",
    "email": "rider9999@test.com",
    "name": "GPS Rider Test",
    "role": "rider"
  }
}
```

---

#### POST /api/auth/login

**Description:** User login (public endpoint)

**Roles:** Public

**Request Body (LoginDto):**

| Field | Type | Required | Example |
|-------|------|----------|---------|
| email | string | ✅ | "john@example.com" |
| password | string | ✅ | "SecurePass123!" |

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider9999@test.com",
    "password": "Test123!"
  }'
```

**Response (200):**
```json
{
  "user": {
    "id": "c39b8b70-4dd8-46e5-a1c8-7edda2387430",
    "email": "rider9999@test.com",
    "name": "GPS Rider Test",
    "phone": "01335555555",
    "role": "rider",
    "isActive": true,
    "isVerified": true,
    "walletBalance": "0.00",
    "address": "Gulshan Base",
    "city": "Dhaka",
    "area": "Gulshan",
    "latitude": null,
    "longitude": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### POST /api/auth/verify-otp

**Description:** Verify OTP code after signup

**Roles:** Public

**Request Body:**
```json
{
  "email": "rider9999@test.com",
  "otpCode": "123456"
}
```

**Response (200):**
```json
{
  "message": "OTP verified successfully",
  "user": { ...user object... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

#### POST /api/auth/refresh

**Description:** Refresh access token using refresh token

**Roles:** Public

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### POST /api/auth/logout

**Description:** Logout user (invalidate tokens)

**Roles:** Authenticated users

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### GET /api/auth/me

**Description:** Get current user profile

**Roles:** Authenticated users

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "..."
  }
}
```

---

### 📦 Shipments Module

Base path: `/api/shipments`

#### POST /api/shipments

**Description:** Create a new shipment

**Roles:** MERCHANT, ADMIN

**Headers:** `Authorization: Bearer <merchantToken>`

**Request Body (CreateShipmentDto):**

**AddressDto fields (for sender and receiver):**

| Field | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| name | string | ✅ | "John Doe" | Full name |
| phone | string | ✅ | "01712345678" | Phone number |
| email | string | ❌ | "john@example.com" | Email address |
| city | string | ✅ | "Dhaka" | City name |
| area | string | ✅ | "Gulshan" | Area name |
| address | string | ✅ | "House 12, Road 5" | Full address |
| latitude | number | ❌ | 23.7808875 | Latitude coordinate |
| longitude | number | ❌ | 90.4161712 | Longitude coordinate |

**CreateShipmentDto fields:**

| Field | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| sender | AddressDto | ✅ | {...} | Sender information |
| receiver | AddressDto | ✅ | {...} | Receiver information |
| deliveryType | enum | ✅ | "express" | normal, express, same_day |
| weight | number | ✅ | 1.5 | Weight in kg (0.1 - 50) |
| productCategory | string | ❌ | "Electronics" | Product category |
| productDescription | string | ❌ | "Samsung Phone" | Product description |
| declaredValue | number | ❌ | 5000 | Declared value |
| paymentMethod | enum | ✅ | "cod" | cod, prepaid, to_pay |
| codAmount | number | ❌ | 2500 | COD amount to collect |
| specialInstructions | string | ❌ | "Handle with care" | Special instructions |
| merchantInvoice | string | ❌ | "INV-12345" | Merchant invoice number |

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/shipments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "sender": {
      "name": "ABC Electronics",
      "phone": "01712345001",
      "address": "Gulshan Avenue, House 25",
      "city": "Dhaka",
      "area": "Gulshan",
      "latitude": 23.8103590,
      "longitude": 90.4125330
    },
    "receiver": {
      "name": "John Customer",
      "phone": "01556789001",
      "address": "Dhanmondi Road 3, House 10",
      "city": "Dhaka",
      "area": "Dhanmondi",
      "latitude": 23.7449160,
      "longitude": 90.3575580
    },
    "weight": 2.5,
    "codAmount": 35000,
    "productDescription": "Samsung Galaxy S24",
    "deliveryType": "express",
    "paymentMethod": "cod"
  }'
```

**Response (201):**
```json
{
  "id": "uuid",
  "awb": "FX20251030870811",
  "status": "PENDING",
  "merchantId": "...",
  "senderName": "ABC Electronics",
  "receiverName": "John Customer",
  "receiverLatitude": 23.7449160,
  "receiverLongitude": 90.3575580,
  "weight": 2.5,
  "codAmount": 35000,
  "deliveryCharge": 120,
  "totalCharge": 120,
  "deliveryType": "express",
  "createdAt": "2025-10-30T...",
  "expectedDeliveryDate": "2025-11-01T..."
}
```

---

#### POST /api/shipments/bulk-upload

**Description:** Bulk upload shipments from CSV data

**Roles:** MERCHANT, ADMIN

**Headers:** `Authorization: Bearer <merchantToken>`

**Request Body:**
```json
{
  "csvData": "receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType\nJane Smith,01798765432,Dhaka,Dhanmondi,House 5 Road 3,2.5,3500,normal\nMichael Johnson,01687654321,Chittagong,Nasirabad,Building 10 Block A,1.2,1500,express"
}
```

**CSV Format:**
- Header: `receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType`
- Sender info is taken from logged-in merchant

**Response (201):**
```json
{
  "totalRows": 2,
  "successCount": 2,
  "failureCount": 0,
  "errors": [],
  "shipments": [
    {
      "awb": "FX20251030000001",
      "receiverName": "Jane Smith",
      "status": "PENDING"
    },
    {
      "awb": "FX20251030000002",
      "receiverName": "Michael Johnson",
      "status": "PENDING"
    }
  ]
}
```

---

#### GET /api/shipments

**Description:** Get all shipments with filters and pagination

**Roles:** ADMIN, MERCHANT, SUPPORT, HUB_STAFF

**Headers:** `Authorization: Bearer <token>`

**Query Parameters (FilterShipmentDto):**
- `status` — filter by status (PENDING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, etc.)
- `page` — page number (default: 1)
- `limit` — results per page (default: 20)
- `startDate` — filter from date
- `endDate` — filter to date
- `search` — search by AWB, receiver name, phone

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/shipments?status=PENDING&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "data": [
    { ...shipment object... },
    { ...shipment object... }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

#### GET /api/shipments/statistics

**Description:** Get shipment statistics

**Roles:** ADMIN, MERCHANT, SUPPORT

**Response (200):**
```json
{
  "totalShipments": 150,
  "pending": 20,
  "inTransit": 45,
  "delivered": 80,
  "failed": 5,
  "totalRevenue": 125000
}
```

---

#### GET /api/shipments/by-status/:status

**Description:** Get shipments by specific status

**Roles:** ADMIN, MERCHANT, SUPPORT, HUB_STAFF

**Path Parameters:** `status` — shipment status

---

#### GET /api/shipments/track/:awb

**Description:** Track shipment by AWB (public tracking)

**Roles:** Public (no authentication)

**Path Parameters:** `awb` — shipment AWB number

**Example Request:**
```bash
curl -X GET http://localhost:3001/api/shipments/track/FX20251030870811
```

**Response (200):**
```json
{
  "awb": "FX20251030870811",
  "status": "OUT_FOR_DELIVERY",
  "receiverName": "John Customer",
  "deliveryArea": "Dhanmondi",
  "expectedDeliveryDate": "2025-11-01T18:00:00Z",
  "trackingHistory": [
    {
      "status": "PENDING",
      "timestamp": "2025-10-30T10:00:00Z",
      "location": "Dhaka Hub"
    },
    {
      "status": "PICKED_UP",
      "timestamp": "2025-10-30T14:00:00Z",
      "location": "Gulshan Hub"
    }
  ]
}
```

---

#### GET /api/shipments/:id

**Description:** Get shipment by ID

**Roles:** ADMIN, MERCHANT, SUPPORT, HUB_STAFF, RIDER

**Path Parameters:** `id` — shipment UUID

---

#### PATCH /api/shipments/:id

**Description:** Update shipment information (only if PENDING)

**Roles:** MERCHANT, ADMIN

**Request Body:** Partial CreateShipmentDto (only fields to update)

---

#### PATCH /api/shipments/:id/status

**Description:** Update shipment status

**Roles:** ADMIN, HUB_STAFF, AGENT, RIDER

**Request Body:**
```json
{
  "status": "PICKED_UP",
  "note": "Picked up from merchant"
}
```

---

#### DELETE /api/shipments/:id

**Description:** Delete shipment (only if PENDING status)

**Roles:** MERCHANT, ADMIN

**Response:** 204 No Content

---

### 🚴 Rider Operations Module

Base path: `/api/rider`

All rider endpoints require `UserRole.RIDER` role or specified roles for read operations.

#### POST /api/rider/update-location

**Description:** Update rider's live GPS location for real-time tracking

**Roles:** RIDER

**Headers:** `Authorization: Bearer <riderToken>`

**Request Body (UpdateLocationDto):**

| Field | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| latitude | number | ✅ | 23.8103 | Latitude coordinate |
| longitude | number | ✅ | 90.4125 | Longitude coordinate |
| accuracy | number | ❌ | 10.5 | Location accuracy in meters |
| speed | number | ❌ | 15.2 | Speed in m/s (min: 0) |
| heading | number | ❌ | 270 | Direction in degrees (0-360) |
| batteryLevel | number | ❌ | 85 | Battery % (0-100) |
| shipmentAwb | string | ❌ | "FX20250128000001" | Current shipment being delivered |
| isOnline | boolean | ❌ | true | Rider online status |

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 23.7808875,
    "longitude": 90.4161712,
    "accuracy": 8,
    "speed": 25,
    "heading": 180,
    "batteryLevel": 80
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "location": {
    "latitude": 23.7808875,
    "longitude": 90.4161712,
    "timestamp": "2025-10-30T14:30:00Z"
  }
}
```

---

#### GET /api/rider/location-history

**Description:** Get rider's location history

**Roles:** RIDER, ADMIN, HUB_STAFF

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` — number of records to return (default: 50, max: 500)

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/rider/location-history?limit=50" \
  -H "Authorization: Bearer <riderToken>"
```

**Response (200):**
```json
{
  "success": true,
  "total": 50,
  "locations": [
    {
      "latitude": 23.7808875,
      "longitude": 90.4161712,
      "accuracy": 10.5,
      "speed": 15.2,
      "heading": 270,
      "batteryLevel": 85,
      "isOnline": true,
      "timestamp": "2025-10-30T14:30:00Z"
    }
  ]
}
```

---

#### GET /api/rider/manifests

**Description:** Get all manifests assigned to rider

**Roles:** RIDER

**Response (200):**
```json
{
  "success": true,
  "total": 2,
  "manifests": [
    {
      "id": "uuid",
      "manifestNumber": "MF-20250128-0001",
      "status": "IN_TRANSIT",
      "originHub": "Dhaka Hub",
      "destinationHub": "Chittagong Hub",
      "totalShipments": 15,
      "dispatchDate": "2025-01-28T10:00:00Z",
      "shipments": [
        {
          "awb": "FX20250128000001",
          "status": "OUT_FOR_DELIVERY",
          "receiverName": "John Doe",
          "receiverPhone": "01712345678",
          "deliveryArea": "Agrabad",
          "codAmount": 1500
        }
      ]
    }
  ]
}
```

---

#### GET /api/rider/shipments

**Description:** Get all shipments directly assigned to rider (not via manifest)

**Roles:** RIDER

**Response (200):**
```json
{
  "success": true,
  "total": 8,
  "shipments": [
    {
      "id": "uuid",
      "awb": "FX20250128000001",
      "status": "OUT_FOR_DELIVERY",
      "merchantName": "ABC Store",
      "receiverName": "John Doe",
      "receiverPhone": "01712345678",
      "receiverAddress": "123 Main St",
      "deliveryArea": "Gulshan",
      "codAmount": 1500,
      "deliveryType": "EXPRESS",
      "weight": 2.5,
      "deliveryAttempts": 0,
      "expectedDeliveryDate": "2025-01-28T18:00:00Z",
      "specialInstructions": "Call before delivery",
      "otpCode": "123456"
    }
  ]
}
```

---

#### GET /api/rider/shipments/:awb

**Description:** Get shipment details by AWB (rider can only view their assigned shipments)

**Roles:** RIDER

**Path Parameters:** `awb` — shipment AWB number

---

#### POST /api/rider/generate-otp

**Description:** Generate OTP for shipment delivery verification

**Roles:** RIDER

**Request Body (GenerateOTPDto):**

| Field | Type | Required | Example |
|-------|------|----------|---------|
| awbNumber | string | ✅ | "FX20250128000001" |

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/rider/generate-otp \
  -H "Authorization: Bearer <riderToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "awbNumber": "FX20250128000001"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP generated and sent to customer",
  "awb": "FX20250128000001",
  "otpGenerated": true
}
```

---

#### POST /api/rider/complete-delivery

**Description:** Complete delivery with OTP verification, POD capture, and COD collection

**Roles:** RIDER

**Request Body (DeliveryAttemptDto):**

| Field | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| awbNumber | string | ✅ | "FX20250128000001" | Shipment AWB |
| otpCode | string | ✅ | "123456" | Customer OTP (6 digits) |
| signatureUrl | string | ❌ | "https://..." | Signature image URL |
| podPhotoUrl | string | ❌ | "https://..." | Proof of delivery photo |
| codAmountCollected | number | ❌ | 1500 | COD amount collected |
| deliveryNote | string | ❌ | "Left at desk" | Delivery notes (max 500) |
| latitude | number | ❌ | 23.8103 | Current latitude |
| longitude | number | ❌ | 90.4125 | Current longitude |

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/rider/complete-delivery \
  -H "Authorization: Bearer <riderToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "awbNumber": "FX20250128000001",
    "otpCode": "123456",
    "podPhotoUrl": "https://storage.example.com/pod/xyz789.jpg",
    "codAmountCollected": 1500,
    "latitude": 23.7808875,
    "longitude": 90.4161712
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Delivery completed successfully",
  "awb": "FX20250128000001",
  "status": "DELIVERED",
  "deliveryTime": "2025-10-30T15:45:00Z"
}
```

---

#### POST /api/rider/record-failed-delivery

**Description:** Record failed delivery attempt with reason

**Roles:** RIDER

**Request Body (FailedDeliveryDto):**
- `awbNumber` (string, required)
- `failureReason` (string, required) — reason for failure
- `note` (string, optional) — additional notes
- `rescheduleDate` (date, optional) — next attempt date

**Response (200):**
```json
{
  "success": true,
  "message": "Failed delivery recorded",
  "awb": "FX20250128000001",
  "deliveryAttempts": 2,
  "status": "FAILED_DELIVERY",
  "autoRTO": false
}
```

---

#### POST /api/rider/mark-rto

**Description:** Mark shipment for RTO (Return to Origin)

**Roles:** RIDER

**Request Body (RTODto):**
- `awbNumber` (string, required)
- `rtoReason` (string, required)
- `note` (string, optional)

**Response (200):**
```json
{
  "success": true,
  "message": "Shipment marked for RTO",
  "awb": "FX20250128000001",
  "status": "RTO_INITIATED",
  "rtoReason": "CUSTOMER_REFUSED: Customer refused to accept the package"
}
```

---

#### GET /api/rider/statistics

**Description:** Get rider's statistics (deliveries, earnings, etc.)

**Roles:** RIDER

**Response (200):**
```json
{
  "totalDeliveries": 145,
  "todayDeliveries": 8,
  "pendingShipments": 5,
  "totalEarnings": 12500,
  "todayEarnings": 850,
  "successRate": 96.5
}
```

---

---

## 🧪 Complete Testing Guide with cURL Examples

This section provides end-to-end testing examples using real test data from the project.

### Test Data Reference

**Common Dhaka GPS Coordinates:**
```javascript
{
  "Gulshan Hub": { "lat": 23.8103590, "lon": 90.4125330 },
  "Dhanmondi": { "lat": 23.7449160, "lon": 90.3575580 },
  "Banani": { "lat": 23.8068160, "lon": 90.3688270 },
  "Mirpur": { "lat": 23.8141560, "lon": 90.3469220 },
  "Uttara": { "lat": 23.8759380, "lon": 90.3795030 },
  "Motijheel": { "lat": 23.7337850, "lon": 90.4178780 },
  "Test Location": { "lat": 23.7808875, "lon": 90.4161712 }
}
```

---

### Scenario 1: Complete Merchant Flow

#### Step 1: Create Merchant Account

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Electronics Store",
    "email": "merchant@abcstore.com",
    "phone": "01712345001",
    "password": "Merchant123!",
    "role": "merchant",
    "city": "Dhaka",
    "area": "Gulshan",
    "address": "Shop 25, Gulshan Avenue",
    "merchantBusinessName": "ABC Electronics"
  }'
```

**Response:**
```json
{
  "message": "User created successfully. Please verify your account with OTP.",
  "user": { "id": "...", "email": "merchant@abcstore.com", "role": "merchant" }
}
```

#### Step 2: Bypass OTP (Testing Only)

```bash
PGPASSWORD=postgres psql -U postgres -h localhost -d courier_service -c \
  "UPDATE users SET is_verified = true WHERE email = 'merchant@abcstore.com';"
```

#### Step 3: Login Merchant

```bash
MERCHANT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@abcstore.com",
    "password": "Merchant123!"
  }')

MERCHANT_TOKEN=$(echo $MERCHANT_RESPONSE | jq -r '.accessToken')
echo "Merchant Token: $MERCHANT_TOKEN"
```

#### Step 4: Create Shipment with GPS

```bash
curl -X POST http://localhost:3001/api/shipments \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": {
      "name": "ABC Electronics",
      "phone": "01712345001",
      "email": "merchant@abcstore.com",
      "address": "Shop 25, Gulshan Avenue",
      "city": "Dhaka",
      "area": "Gulshan",
      "latitude": 23.8103590,
      "longitude": 90.4125330
    },
    "receiver": {
      "name": "Customer Rahman",
      "phone": "01798765432",
      "email": "customer@example.com",
      "address": "House 10, Road 5, Dhanmondi-3",
      "city": "Dhaka",
      "area": "Dhanmondi",
      "latitude": 23.7449160,
      "longitude": 90.3575580
    },
    "weight": 2.5,
    "codAmount": 35000,
    "productCategory": "Electronics",
    "productDescription": "Samsung Galaxy S24 Ultra",
    "declaredValue": 120000,
    "deliveryType": "express",
    "paymentMethod": "cod",
    "specialInstructions": "Call 30 minutes before delivery"
  }' | jq .
```

#### Step 5: Bulk Upload Shipments

```bash
curl -X POST http://localhost:3001/api/shipments/bulk-upload \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "csvData": "receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType\nJane Smith,01798765432,Dhaka,Dhanmondi,House 5 Road 3,2.5,3500,normal\nMichael Johnson,01687654321,Chittagong,Nasirabad,Building 10 Block A,1.2,1500,express\nSarah Williams,01556789012,Dhaka,Banani,Apt 4B Road 11,0.8,2500,same_day"
  }' | jq .
```

#### Step 6: Get Merchant Shipments

```bash
curl -X GET "http://localhost:3001/api/shipments?page=1&limit=10" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" | jq .
```

#### Step 7: Get Statistics

```bash
curl -X GET http://localhost:3001/api/shipments/statistics \
  -H "Authorization: Bearer $MERCHANT_TOKEN" | jq .
```

---

### Scenario 2: Complete Rider Flow

#### Step 1: Create Rider Account

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GPS Rider Pro",
    "email": "rider.pro@courier.com",
    "phone": "01335555555",
    "password": "Rider123!",
    "role": "rider",
    "city": "Dhaka",
    "area": "Gulshan",
    "address": "Gulshan Hub Base"
  }'
```

#### Step 2: Verify and Login Rider

```bash
# Bypass OTP
PGPASSWORD=postgres psql -U postgres -h localhost -d courier_service -c \
  "UPDATE users SET is_verified = true WHERE email = 'rider.pro@courier.com';"

# Login
RIDER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider.pro@courier.com",
    "password": "Rider123!"
  }')

RIDER_TOKEN=$(echo $RIDER_RESPONSE | jq -r '.accessToken')
echo "Rider Token: $RIDER_TOKEN"
```

#### Step 3: Update Rider Location (Start of Day - Hub)

```bash
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 23.8103590,
    "longitude": 90.4125330,
    "accuracy": 10,
    "speed": 0,
    "heading": 0,
    "batteryLevel": 100,
    "isOnline": true
  }' | jq .
```

#### Step 4: Get Assigned Shipments

```bash
curl -X GET http://localhost:3001/api/rider/shipments \
  -H "Authorization: Bearer $RIDER_TOKEN" | jq .
```

#### Step 5: Simulate Route - Moving to Customer

```bash
# Update 1: Leaving hub
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "latitude": 23.8103590, "longitude": 90.4125330, "speed": 5, "heading": 180, "batteryLevel": 98 }'

sleep 2

# Update 2: En route (Test location)
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "latitude": 23.7808875, "longitude": 90.4161712, "speed": 25, "heading": 180, "batteryLevel": 95 }'

sleep 2

# Update 3: Approaching Banani
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "latitude": 23.8068160, "longitude": 90.3688270, "speed": 20, "heading": 270, "batteryLevel": 92 }'

sleep 2

# Update 4: Arrived at Dhanmondi (customer location)
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "latitude": 23.7449160, "longitude": 90.3575580, "speed": 0, "heading": 0, "batteryLevel": 90 }' | jq .
```

#### Step 6: Generate OTP for Delivery

```bash
AWB_NUMBER="FX20251030870811"  # Use actual AWB from your shipment

curl -X POST http://localhost:3001/api/rider/generate-otp \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"awbNumber\": \"$AWB_NUMBER\"
  }" | jq .
```

#### Step 7: Complete Delivery

```bash
curl -X POST http://localhost:3001/api/rider/complete-delivery \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"awbNumber\": \"$AWB_NUMBER\",
    \"otpCode\": \"123456\",
    \"podPhotoUrl\": \"https://storage.example.com/pod/delivery_$(date +%s).jpg\",
    \"codAmountCollected\": 35000,
    \"deliveryNote\": \"Delivered to customer directly\",
    \"latitude\": 23.7449160,
    \"longitude\": 90.3575580
  }" | jq .
```

#### Step 8: Get Location History

```bash
curl -X GET "http://localhost:3001/api/rider/location-history?limit=20" \
  -H "Authorization: Bearer $RIDER_TOKEN" | jq .
```

#### Step 9: Get Rider Statistics

```bash
curl -X GET http://localhost:3001/api/rider/statistics \
  -H "Authorization: Bearer $RIDER_TOKEN" | jq .
```

---

### Scenario 3: Failed Delivery and RTO

#### Record Failed Delivery

```bash
curl -X POST http://localhost:3001/api/rider/record-failed-delivery \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"awbNumber\": \"$AWB_NUMBER\",
    \"failureReason\": \"CUSTOMER_NOT_AVAILABLE\",
    \"note\": \"Called customer 3 times, no response\",
    \"rescheduleDate\": \"2025-11-02T10:00:00Z\"
  }" | jq .
```

#### Mark for RTO (after 3 failed attempts)

```bash
curl -X POST http://localhost:3001/api/rider/mark-rto \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"awbNumber\": \"$AWB_NUMBER\",
    \"rtoReason\": \"CUSTOMER_REFUSED\",
    \"note\": \"Customer refused to accept package after multiple attempts\"
  }" | jq .
```

---

### Scenario 4: Public Tracking

#### Track Shipment (No Auth Required)

```bash
curl -X GET http://localhost:3001/api/shipments/track/FX20251030870811 | jq .
```

**Response:**
```json
{
  "awb": "FX20251030870811",
  "status": "DELIVERED",
  "receiverName": "Customer Rahman",
  "deliveryArea": "Dhanmondi",
  "expectedDeliveryDate": "2025-11-01T18:00:00Z",
  "deliveryCompletedAt": "2025-10-30T15:45:00Z",
  "trackingHistory": [
    {
      "status": "PENDING",
      "timestamp": "2025-10-30T10:00:00Z",
      "location": "Merchant - ABC Electronics"
    },
    {
      "status": "PICKED_UP",
      "timestamp": "2025-10-30T11:30:00Z",
      "location": "Gulshan Hub"
    },
    {
      "status": "OUT_FOR_DELIVERY",
      "timestamp": "2025-10-30T14:00:00Z",
      "location": "Rider assigned"
    },
    {
      "status": "DELIVERED",
      "timestamp": "2025-10-30T15:45:00Z",
      "location": "Dhanmondi - Customer received"
    }
  ]
}
```

---

### Scenario 5: Database Verification

#### Check GPS Data in All Tables

```bash
PGPASSWORD=postgres psql -U postgres -h localhost -d courier_service << 'EOF'
-- Check rider locations
SELECT 
  COUNT(*) as total_locations,
  COUNT(latitude) as has_gps,
  ROUND(AVG(latitude)::numeric, 7) as avg_lat,
  ROUND(AVG(longitude)::numeric, 7) as avg_lon
FROM rider_locations;

-- Check shipments with GPS
SELECT 
  COUNT(*) as total_shipments,
  COUNT(receiver_latitude) as has_receiver_gps,
  ROUND(COUNT(receiver_latitude)::numeric * 100 / COUNT(*), 2) || '%' as gps_percentage
FROM shipments;

-- Check users with GPS
SELECT 
  role,
  COUNT(*) as total,
  COUNT(latitude) as has_gps
FROM users
GROUP BY role
ORDER BY role;
EOF
```

---

### Quick Commands Reference

#### Save Tokens to Variables

```bash
# Merchant
export MERCHANT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Rider
export RIDER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Admin
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Quick Test - Create & Track

```bash
# 1. Create shipment, extract AWB
AWB=$(curl -s -X POST http://localhost:3001/api/shipments \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ ...shipment data... }' | jq -r '.awb')

echo "Created shipment: $AWB"

# 2. Track immediately
curl -X GET http://localhost:3001/api/shipments/track/$AWB | jq .
```

---

## DTO / validation notes

- `CreateShipmentDto` expects nested `sender` and `receiver` address blocks. If you want lat/lon stored in `shipments`, ensure your request includes `receiver.latitude` and `receiver.longitude` (these are optional fields but useful for accurate mapping).
- `UpdateLocationDto` for rider location expects numeric lat/lon and optional fields like accuracy, speed, heading.
- `FilterShipmentDto` allows filters on status, date range and pagination fields.

If validation rejects fields, add corresponding properties to DTOs located in `src/modules/shipments/dto` or `src/modules/rider/dto`.

---

---

## 🔧 Troubleshooting & Common Issues

### Issue 1: Shipments Missing GPS Coordinates

**Problem:** `receiver_latitude` and `receiver_longitude` are NULL in shipments table

**Causes:**
- Client not sending coordinates during shipment creation
- DTO validation rejecting coordinates
- Frontend not capturing GPS data

**Solutions:**

1. **Include GPS in API requests:**
```json
{
  "receiver": {
    "name": "Customer",
    "address": "...",
    "latitude": 23.7449160,
    "longitude": 90.3575580
  }
}
```

2. **Update existing shipments:**
```sql
UPDATE shipments 
SET 
  receiver_latitude = 23.7449160,
  receiver_longitude = 90.3575580
WHERE awb = 'FX20251030870811';
```

3. **Server-side geocoding:**
Add geocoding in `ShipmentsService.create()` to resolve coordinates from address using the existing `GeoService`.

---

### Issue 2: OTP Verification Required After Signup

**Problem:** Cannot login immediately after signup — OTP verification pending

**Solution (Testing Only):**
```bash
PGPASSWORD=postgres psql -U postgres -h localhost -d courier_service -c \
  "UPDATE users SET is_verified = true WHERE email = 'user@example.com';"
```

**Production Solution:**
- Implement SMS/email OTP sending service
- Use `/api/auth/verify-otp` endpoint with actual OTP

---

### Issue 3: Rider Location Not Updating

**Problem:** GPS tracking not working or showing stale data

**Checks:**

1. **Verify rider is authenticated:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $RIDER_TOKEN"
```

2. **Check database for rider_locations:**
```sql
SELECT * FROM rider_locations 
WHERE rider_id = 'rider-uuid' 
ORDER BY created_at DESC LIMIT 5;
```

3. **Ensure GPS precision:**
- Use `DECIMAL(10,7)` for lat/lon (±1.1 cm precision)
- Don't truncate coordinates

---

### Issue 4: Token Expired

**Problem:** API returns 401 Unauthorized

**Solution:**
```bash
# Use refresh token
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

### Issue 5: Cannot Delete Shipment

**Problem:** Delete endpoint returns 400 Bad Request

**Reason:** Shipments can only be deleted if status is `PENDING`

**Check status:**
```bash
curl -X GET http://localhost:3001/api/shipments/:id \
  -H "Authorization: Bearer $MERCHANT_TOKEN"
```

---

### Issue 6: Bulk Upload CSV Format Errors

**Problem:** Bulk upload fails with validation errors

**Common mistakes:**
- Wrong header order
- Missing required fields
- Extra commas or quotes

**Correct CSV format:**
```
receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType
Jane Smith,01798765432,Dhaka,Dhanmondi,House 5 Road 3,2.5,3500,normal
```

**Validation:**
- No spaces in header
- Comma-separated (not semicolon)
- No extra newlines
- deliveryType: `normal`, `express`, or `same_day`

---

### Issue 7: Role Permission Denied

**Problem:** 403 Forbidden error on API call

**Solution:**
Check your user role matches endpoint requirements:
- Merchant → create shipments, bulk upload
- Rider → update location, delivery operations
- Admin → all operations
- Support → view shipments, statistics

**Get current role:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.user.role'
```

---

### Performance Tips

1. **Use pagination for large datasets:**
```bash
# Good
curl "http://localhost:3001/api/shipments?page=1&limit=20"

# Avoid
curl "http://localhost:3001/api/shipments?limit=10000"
```

2. **Cache frequently accessed data:**
- Public tracking endpoints may be cached
- Use Redis for session management

3. **Optimize GPS updates:**
- Update location every 30-60 seconds (not every second)
- Use accuracy threshold to avoid unnecessary updates

---

## 📊 Database Schema Quick Reference

### Key Tables

**users**
- id (UUID, PK)
- email (unique)
- role (enum: customer, merchant, rider, agent, hub_staff, admin, support)
- latitude, longitude (DECIMAL(10,7), nullable)
- is_verified (boolean)
- wallet_balance (DECIMAL)

**shipments**
- id (UUID, PK)
- awb (string, unique, indexed)
- merchant_id (FK → users)
- rider_id (FK → users, nullable)
- receiver_latitude, receiver_longitude (DECIMAL(10,7), nullable)
- status (enum: PENDING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, etc.)
- cod_amount (DECIMAL)
- delivery_attempts (integer)
- created_at, updated_at

**rider_locations**
- id (UUID, PK)
- rider_id (FK → users)
- latitude, longitude (DECIMAL(10,7))
- accuracy, speed, heading, battery_level (floats)
- is_online (boolean)
- created_at (timestamp, indexed)

**manifests**
- id (UUID, PK)
- manifest_number (string, unique)
- rider_id (FK → users)
- status (enum)
- origin_hub, destination_hub
- dispatch_date

---

## 🚀 Production Deployment Checklist

- [ ] Set strong `JWT_SECRET` in environment
- [ ] Configure PostgreSQL with proper credentials
- [ ] Enable HTTPS/SSL for API endpoints
- [ ] Set up Redis for caching and sessions
- [ ] Configure SMS/Email gateway for OTP
- [ ] Set up file storage (S3/Cloud Storage) for POD images
- [ ] Enable CORS with proper origins
- [ ] Set up monitoring and logging (Sentry, DataDog, etc.)
- [ ] Configure rate limiting to prevent abuse
- [ ] Set up automated backups for database
- [ ] Enable database connection pooling
- [ ] Configure reverse proxy (Nginx/CloudFlare)
- [ ] Set up CI/CD pipeline
- [ ] Enable API request logging for audit
- [ ] Configure geocoding service (Google Maps API, etc.)

---

## 📚 Additional Resources

### Swagger/OpenAPI Documentation

If your project has Swagger enabled, access interactive API docs at:
```
http://localhost:3001/api/docs
```

The controllers already have `@ApiTags`, `@ApiOperation`, `@ApiResponse` decorators, so Swagger documentation should be auto-generated.

### Project Structure

```
courier-service/
├── src/
│   ├── modules/
│   │   ├── auth/          # Authentication (signup, login, OTP)
│   │   ├── shipments/     # Shipment management
│   │   ├── rider/         # Rider operations (GPS, delivery)
│   │   ├── manifest/      # Manifest management
│   │   └── ...
│   ├── entities/          # TypeORM entities
│   ├── common/
│   │   ├── guards/        # JWT, Roles guards
│   │   ├── decorators/    # Custom decorators
│   │   ├── enums/         # Enums (roles, status, etc.)
│   │   └── filters/       # Exception filters
│   ├── config/            # Configuration files
│   └── main.ts            # Application entry point
├── test/                  # E2E tests
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### Related Files

- `API_DOCUMENTATION.md` — This complete API reference (current file)
- `FIX_GPS_NULL_ISSUE.md` — GPS troubleshooting guide
- `COMPLETE_TEST_DATA.json` — Test data samples
- `README.md` — Project overview and quick start

---

## 📝 Summary

This documentation covers:

✅ **Complete API Reference** — All endpoints with request/response schemas  
✅ **Authentication Flow** — Signup, login, OTP verification, token refresh  
✅ **Shipment Management** — Create, bulk upload, track, update, delete  
✅ **Rider Operations** — GPS tracking, delivery completion, OTP, failed delivery, RTO  
✅ **Testing Guide** — End-to-end scenarios with cURL commands  
✅ **Database Schema** — Entity relationships and field details  
✅ **Troubleshooting** — Common issues and solutions  
✅ **Production Checklist** — Deployment requirements  

---

## 🎯 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Run on http://localhost:3001

# Test authentication
curl -X POST http://localhost:3001/api/auth/signup -H "Content-Type: application/json" -d '{...}'

# Access Swagger docs (if enabled)
open http://localhost:3001/api/docs
```

---

**Last Updated:** November 1, 2025  
**Project:** Courier Service API  
**Version:** 1.0.0  
**Repository:** github.com/dipto-roy/courier-service

For questions or contributions, please refer to the GitHub repository. 
