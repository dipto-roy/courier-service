# FastX Courier Service - Complete API Testing Guide

## 📋 Table of Contents
1. [Environment Setup](#environment-setup)
2. [Authentication Flow](#authentication-flow)
3. [Step-by-Step Testing Guide](#step-by-step-testing-guide)
4. [Testing Workflows](#testing-workflows)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Environment Setup

### Step 1: Import Postman Collection
1. Open Postman
2. Click **Import** button
3. Select `POSTMAN_COLLECTION.json`
4. Collection will be imported with all 102 endpoints

### Step 2: Create Environment Variables
1. Click **Environments** in Postman
2. Create new environment: **FastX Local**
3. Add these variables:

```json
{
  "baseUrl": "http://localhost:3001",
  "accessToken": "",
  "refreshToken": "",
  "merchantId": "",
  "riderId": "",
  "hubId": "",
  "shipmentId": "",
  "awb": "",
  "pickupId": ""
}
```

### Step 3: Start Backend Server
```bash
cd /home/dip-roy/courier-service
npm run start:dev
```

**Verify Server is Running:**
```bash
# Server should be running on http://localhost:3001
# Check health endpoint
curl http://localhost:3001/api/health
```

---

## 🔐 Authentication Flow

### Phase 1: User Signup & Login

#### Test 1: Create Merchant Account
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "name": "Test Merchant",
  "email": "merchant@fastx.com",
  "password": "Test@123456",
  "phone": "+8801712345678",
  "role": "MERCHANT",
  "businessName": "FastX Logistics",
  "businessAddress": "Dhaka, Bangladesh"
}
```

**Expected Response (201):**
```json
{
  "message": "Signup successful. OTP sent to your phone.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "merchant@fastx.com",
    "name": "Test Merchant",
    "role": "MERCHANT"
  }
}
```

**✅ Action:** Save the `user.id` as `merchantId` in environment variables

---

#### Test 2: Login with Merchant Account
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "merchant@fastx.com",
  "password": "Test@123456"
}
```

**Expected Response (200):**
```json
{
  "message": "OTP sent to your phone",
  "requiresOTP": true,
  "tempToken": "temp_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Test 3: Verify OTP (Get Access Token)
**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "merchant@fastx.com",
  "otp": "123456"
}
```

**Expected Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "merchant@fastx.com",
    "name": "Test Merchant",
    "role": "MERCHANT"
  }
}
```

**✅ Action:** 
- Save `accessToken` to environment variable (auto-saved by Postman script)
- Save `refreshToken` to environment variable (auto-saved by Postman script)
- **All subsequent requests will use:** `Authorization: Bearer {{accessToken}}`

---

#### Test 4: Get Current User Profile
**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Expected Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "merchant@fastx.com",
  "name": "Test Merchant",
  "role": "MERCHANT",
  "kycVerified": false,
  "walletBalance": 0
}
```

---

### Phase 2: Create Additional User Roles

#### Test 5: Create Rider Account
**Endpoint:** `POST /api/users`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Request Body:**
```json
{
  "name": "Rafiq Ahmed",
  "email": "rider@fastx.com",
  "password": "Rider@123456",
  "phone": "+8801812345678",
  "role": "RIDER",
  "vehicleType": "MOTORCYCLE",
  "vehicleNumber": "DHAKA-GA-1234"
}
```

**Expected Response (201):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Rafiq Ahmed",
  "email": "rider@fastx.com",
  "role": "RIDER"
}
```

**✅ Action:** Save `id` as `riderId` in environment variables

---

#### Test 6: Create Hub Staff Account
**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
  "name": "Hub Manager",
  "email": "hub@fastx.com",
  "password": "Hub@123456",
  "phone": "+8801912345678",
  "role": "HUB_STAFF"
}
```

---

#### Test 7: Create Admin Account
**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@fastx.com",
  "password": "Admin@123456",
  "phone": "+8801612345678",
  "role": "ADMIN"
}
```

---

## 📦 Step-by-Step Testing Guide

### Module 1: Core Module (2 endpoints)

#### Test 8: Health Check
**Endpoint:** `GET /api/health`

**No Auth Required**

**Expected Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T10:00:00.000Z",
  "database": "connected"
}
```

---

#### Test 9: Root Endpoint
**Endpoint:** `GET /api`

**Expected Response (200):**
```json
{
  "message": "FastX Courier Service API v1.0",
  "documentation": "/api/docs"
}
```

---

### Module 2: Users Module (9 endpoints)

#### Test 10: List All Users
**Endpoint:** `GET /api/users?page=1&limit=10`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Test Merchant",
      "email": "merchant@fastx.com",
      "role": "MERCHANT"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

#### Test 11: Get User Statistics
**Endpoint:** `GET /api/users/statistics`

**Expected Response (200):**
```json
{
  "totalUsers": 3,
  "activeUsers": 3,
  "byRole": {
    "MERCHANT": 1,
    "RIDER": 1,
    "HUB_STAFF": 1
  }
}
```

---

#### Test 12: Get User by ID
**Endpoint:** `GET /api/users/{{merchantId}}`

**Expected Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Test Merchant",
  "email": "merchant@fastx.com",
  "role": "MERCHANT",
  "businessName": "FastX Logistics"
}
```

---

#### Test 13: Update User Profile
**Endpoint:** `PATCH /api/users/{{merchantId}}`

**Request Body:**
```json
{
  "businessName": "FastX Logistics Ltd",
  "businessAddress": "Gulshan-2, Dhaka"
}
```

**Expected Response (200):**
```json
{
  "message": "User updated successfully"
}
```

---

#### Test 14: Update KYC Status
**Endpoint:** `PATCH /api/users/{{merchantId}}/kyc`

**Request Body:**
```json
{
  "kycVerified": true,
  "kycDocuments": {
    "nid": "1234567890",
    "tradeLicense": "TL-12345"
  }
}
```

**Expected Response (200):**
```json
{
  "message": "KYC status updated successfully",
  "kycVerified": true
}
```

---

#### Test 15: Update Wallet Balance
**Endpoint:** `PATCH /api/users/{{merchantId}}/wallet`

**Request Body:**
```json
{
  "amount": 5000,
  "type": "CREDIT",
  "description": "Initial credit"
}
```

**Expected Response (200):**
```json
{
  "message": "Wallet updated successfully",
  "newBalance": 5000
}
```

---

### Module 3: Hub Module (10 endpoints)

#### Test 16: Create Hub
**Endpoint:** `POST /api/hubs`

**Request Body:**
```json
{
  "name": "Mirpur Hub",
  "code": "MRP-HUB-01",
  "hubType": "DISTRIBUTION",
  "address": "Mirpur-10, Dhaka",
  "city": "Dhaka",
  "area": "Mirpur",
  "capacity": 1000,
  "contactPerson": "Hub Manager",
  "contactPhone": "+8801712345678",
  "operatingHours": "24/7"
}
```

**Expected Response (201):**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "name": "Mirpur Hub",
  "code": "MRP-HUB-01",
  "status": "ACTIVE"
}
```

**✅ Action:** Save `id` as `hubId` in environment variables

---

#### Test 17: List Hubs
**Endpoint:** `GET /api/hubs?page=1&limit=20`

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "name": "Mirpur Hub",
      "code": "MRP-HUB-01",
      "city": "Dhaka",
      "currentLoad": 0,
      "capacity": 1000
    }
  ]
}
```

---

#### Test 18: Get Hub Statistics
**Endpoint:** `GET /api/hubs/statistics`

**Expected Response (200):**
```json
{
  "totalHubs": 1,
  "activeHubs": 1,
  "byType": {
    "DISTRIBUTION": 1
  },
  "totalCapacity": 1000,
  "currentLoad": 0
}
```

---

#### Test 19: Get Hub by ID
**Endpoint:** `GET /api/hubs/{{hubId}}`

**Expected Response (200):**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "name": "Mirpur Hub",
  "code": "MRP-HUB-01",
  "hubType": "DISTRIBUTION",
  "capacity": 1000,
  "currentLoad": 0
}
```

---

#### Test 20: Update Hub
**Endpoint:** `PATCH /api/hubs/{{hubId}}`

**Request Body:**
```json
{
  "capacity": 1200,
  "contactPhone": "+8801712345679"
}
```

**Expected Response (200):**
```json
{
  "message": "Hub updated successfully"
}
```

---

#### Test 21: Get Hub Inventory
**Endpoint:** `GET /api/hubs/{{hubId}}/inventory`

**Expected Response (200):**
```json
{
  "hubName": "Mirpur Hub",
  "totalShipments": 0,
  "byStatus": {
    "IN_TRANSIT": 0,
    "OUT_FOR_DELIVERY": 0
  }
}
```

---

### Module 4: Shipments Module (9 endpoints)

#### Test 22: Create Shipment
**Endpoint:** `POST /api/shipments`

**Request Body:**
```json
{
  "senderName": "FastX Logistics",
  "senderPhone": "+8801712345678",
  "senderAddress": "Gulshan-2, Dhaka",
  "senderCity": "Dhaka",
  "senderArea": "Gulshan",
  "receiverName": "Md Rahim",
  "receiverPhone": "+8801912345678",
  "receiverAddress": "Mirpur-10, Dhaka",
  "receiverCity": "Dhaka",
  "receiverArea": "Mirpur",
  "productDescription": "Electronics - Mobile Phone",
  "weight": 0.5,
  "quantity": 1,
  "declaredValue": 25000,
  "deliveryType": "EXPRESS",
  "paymentMethod": "COD",
  "codAmount": 25000,
  "deliveryFee": 100
}
```

**Expected Response (201):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "awb": "FX1234567890123",
  "status": "PENDING",
  "deliveryType": "EXPRESS",
  "codAmount": 25000,
  "deliveryFee": 100
}
```

**✅ Action:** 
- Save `id` as `shipmentId` in environment variables
- Save `awb` as `awb` in environment variables

---

#### Test 23: List Shipments
**Endpoint:** `GET /api/shipments?page=1&limit=20&status=PENDING`

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "awb": "FX1234567890123",
      "status": "PENDING",
      "receiverName": "Md Rahim",
      "codAmount": 25000
    }
  ]
}
```

---

#### Test 24: Get Shipment Statistics
**Endpoint:** `GET /api/shipments/statistics`

**Expected Response (200):**
```json
{
  "total": 1,
  "byStatus": {
    "PENDING": 1
  },
  "totalCODAmount": 25000
}
```

---

#### Test 25: Track Shipment by AWB (Public)
**Endpoint:** `GET /api/shipments/track/{{awb}}`

**No Auth Required**

**Expected Response (200):**
```json
{
  "awb": "FX1234567890123",
  "status": "PENDING",
  "receiverName": "Md Rahim",
  "timeline": [
    {
      "status": "PENDING",
      "timestamp": "2025-10-28T10:00:00.000Z",
      "description": "Shipment created"
    }
  ]
}
```

---

#### Test 26: Get Shipment by ID
**Endpoint:** `GET /api/shipments/{{shipmentId}}`

**Expected Response (200):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "awb": "FX1234567890123",
  "status": "PENDING",
  "senderName": "FastX Logistics",
  "receiverName": "Md Rahim",
  "codAmount": 25000
}
```

---

#### Test 27: Update Shipment
**Endpoint:** `PATCH /api/shipments/{{shipmentId}}`

**Request Body:**
```json
{
  "receiverPhone": "+8801912345679",
  "specialInstructions": "Call before delivery"
}
```

**Expected Response (200):**
```json
{
  "message": "Shipment updated successfully"
}
```

---

#### Test 28: Update Shipment Status
**Endpoint:** `PATCH /api/shipments/{{shipmentId}}/status`

**Request Body:**
```json
{
  "status": "PICKED_UP",
  "deliveryNote": "Picked up from merchant"
}
```

**Expected Response (200):**
```json
{
  "message": "Shipment status updated successfully",
  "shipment": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "status": "PICKED_UP"
  }
}
```

---

#### Test 29: Bulk Upload Shipments
**Endpoint:** `POST /api/shipments/bulk-upload`

**Request Body:**
```json
{
  "shipments": [
    {
      "receiverName": "Customer 1",
      "receiverPhone": "+8801912345681",
      "receiverAddress": "Address 1, Dhaka",
      "receiverCity": "Dhaka",
      "receiverArea": "Mirpur",
      "productDescription": "Product 1",
      "weight": 1.0,
      "codAmount": 1000
    },
    {
      "receiverName": "Customer 2",
      "receiverPhone": "+8801912345682",
      "receiverAddress": "Address 2, Dhaka",
      "receiverCity": "Dhaka",
      "receiverArea": "Gulshan",
      "productDescription": "Product 2",
      "weight": 2.0,
      "codAmount": 2000
    }
  ]
}
```

**Expected Response (201):**
```json
{
  "message": "2 shipments created successfully",
  "shipments": [
    {
      "awb": "FX1234567890124",
      "receiverName": "Customer 1"
    },
    {
      "awb": "FX1234567890125",
      "receiverName": "Customer 2"
    }
  ]
}
```

---

### Module 5: Pickup Module (10 endpoints)

#### Test 30: Create Pickup Request
**Endpoint:** `POST /api/pickups`

**Request Body:**
```json
{
  "merchantId": "{{merchantId}}",
  "pickupAddress": "Gulshan-2, Dhaka",
  "pickupCity": "Dhaka",
  "pickupArea": "Gulshan",
  "contactPerson": "Kamal Hossain",
  "contactPhone": "+8801712345678",
  "numberOfParcels": 5,
  "totalWeight": 5.5,
  "preferredPickupTime": "2025-10-29T10:00:00.000Z",
  "specialInstructions": "Office closes at 6 PM"
}
```

**Expected Response (201):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "pickupCode": "PU202510280001",
  "status": "PENDING",
  "numberOfParcels": 5
}
```

**✅ Action:** Save `id` as `pickupId` in environment variables

---

#### Test 31: List Pickups
**Endpoint:** `GET /api/pickups?page=1&limit=20&status=PENDING`

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "pickupCode": "PU202510280001",
      "status": "PENDING",
      "numberOfParcels": 5
    }
  ]
}
```

---

#### Test 32: Get Pickup Statistics
**Endpoint:** `GET /api/pickups/statistics`

**Expected Response (200):**
```json
{
  "total": 1,
  "byStatus": {
    "PENDING": 1
  },
  "todayPickups": 1
}
```

---

#### Test 33: Get Pickup by ID
**Endpoint:** `GET /api/pickups/{{pickupId}}`

**Expected Response (200):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "pickupCode": "PU202510280001",
  "status": "PENDING",
  "pickupAddress": "Gulshan-2, Dhaka",
  "numberOfParcels": 5
}
```

---

#### Test 34: Update Pickup
**Endpoint:** `PATCH /api/pickups/{{pickupId}}`

**Request Body:**
```json
{
  "contactPhone": "+8801712345679",
  "specialInstructions": "Call 30 minutes before arrival"
}
```

**Expected Response (200):**
```json
{
  "message": "Pickup updated successfully"
}
```

---

#### Test 35: Assign Rider to Pickup
**Endpoint:** `PATCH /api/pickups/{{pickupId}}/assign`

**Request Body:**
```json
{
  "riderId": "{{riderId}}"
}
```

**Expected Response (200):**
```json
{
  "message": "Rider assigned successfully",
  "pickup": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "status": "ASSIGNED"
  }
}
```

---

#### Test 36: Start Pickup
**Endpoint:** `POST /api/pickups/{{pickupId}}/start`

**Request Body:**
```json
{
  "latitude": 23.7937,
  "longitude": 90.4066
}
```

**Expected Response (200):**
```json
{
  "message": "Pickup started",
  "status": "IN_PROGRESS"
}
```

---

#### Test 37: Complete Pickup
**Endpoint:** `POST /api/pickups/{{pickupId}}/complete`

**Request Body:**
```json
{
  "actualParcels": 5,
  "actualWeight": 5.5,
  "pickupPhotoUrl": "https://storage.fastx.com/pickup/123.jpg",
  "notes": "All parcels collected successfully",
  "latitude": 23.7937,
  "longitude": 90.4066
}
```

**Expected Response (200):**
```json
{
  "message": "Pickup completed successfully",
  "status": "COMPLETED"
}
```

---

#### Test 38: Cancel Pickup
**Endpoint:** `POST /api/pickups/{{pickupId}}/cancel`

**Request Body:**
```json
{
  "reason": "Merchant not available"
}
```

**Expected Response (200):**
```json
{
  "message": "Pickup cancelled successfully",
  "status": "CANCELLED"
}
```

---

### Module 6: Rider Module (10 endpoints)

#### Test 39: List Available Riders
**Endpoint:** `GET /api/riders/available?area=Mirpur&vehicleType=MOTORCYCLE`

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Rafiq Ahmed",
      "vehicleType": "MOTORCYCLE",
      "isOnline": true,
      "currentLoad": 0
    }
  ]
}
```

---

#### Test 40: Get Rider Statistics
**Endpoint:** `GET /api/riders/statistics`

**Expected Response (200):**
```json
{
  "totalRiders": 1,
  "onlineRiders": 1,
  "availableRiders": 1,
  "byVehicleType": {
    "MOTORCYCLE": 1
  }
}
```

---

#### Test 41: Get Rider by ID
**Endpoint:** `GET /api/riders/{{riderId}}`

**Expected Response (200):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Rafiq Ahmed",
  "phone": "+8801812345678",
  "vehicleType": "MOTORCYCLE",
  "vehicleNumber": "DHAKA-GA-1234",
  "isOnline": true
}
```

---

#### Test 42: Get Rider Deliveries
**Endpoint:** `GET /api/riders/{{riderId}}/deliveries?status=ASSIGNED`

**Expected Response (200):**
```json
{
  "data": []
}
```

---

#### Test 43: Update Rider Location
**Endpoint:** `POST /api/riders/{{riderId}}/location`

**Request Body:**
```json
{
  "latitude": 23.7937,
  "longitude": 90.4066,
  "accuracy": 10
}
```

**Expected Response (200):**
```json
{
  "message": "Location updated successfully",
  "latitude": 23.7937,
  "longitude": 90.4066
}
```

---

#### Test 44: Update Rider Status
**Endpoint:** `PATCH /api/riders/{{riderId}}/status`

**Request Body:**
```json
{
  "isOnline": true,
  "status": "AVAILABLE"
}
```

**Expected Response (200):**
```json
{
  "message": "Rider status updated",
  "isOnline": true,
  "status": "AVAILABLE"
}
```

---

#### Test 45: Start Delivery
**Endpoint:** `POST /api/riders/{{riderId}}/start-delivery`

**Request Body:**
```json
{
  "awb": "{{awb}}",
  "latitude": 23.7937,
  "longitude": 90.4066
}
```

**Expected Response (200):**
```json
{
  "message": "Delivery started",
  "awb": "FX1234567890123"
}
```

---

#### Test 46: Complete Delivery
**Endpoint:** `POST /api/riders/{{riderId}}/complete-delivery`

**Request Body:**
```json
{
  "awb": "{{awb}}",
  "deliveryStatus": "DELIVERED",
  "receiverName": "Md Rahim",
  "podPhotoUrl": "https://storage.fastx.com/pod/123.jpg",
  "signature": "base64_signature_data",
  "codCollected": 25000,
  "deliveryNotes": "Delivered successfully",
  "latitude": 23.7937,
  "longitude": 90.4066
}
```

**Expected Response (200):**
```json
{
  "message": "Delivery completed successfully",
  "awb": "FX1234567890123",
  "status": "DELIVERED"
}
```

---

#### Test 47: Get Rider COD Collection
**Endpoint:** `GET /api/riders/{{riderId}}/cod-collection`

**Expected Response (200):**
```json
{
  "riderId": "660e8400-e29b-41d4-a716-446655440001",
  "riderName": "Rafiq Ahmed",
  "totalCODCollected": 25000,
  "totalDeliveries": 1,
  "pendingDeposit": 25000
}
```

---

#### Test 48: Deposit COD
**Endpoint:** `POST /api/riders/{{riderId}}/deposit-cod`

**Request Body:**
```json
{
  "amount": 25000,
  "hubId": "{{hubId}}",
  "depositSlipUrl": "https://storage.fastx.com/deposit/456.jpg",
  "notes": "COD deposit for today"
}
```

**Expected Response (200):**
```json
{
  "message": "COD deposited successfully",
  "depositId": "DEP202510290001",
  "amount": 25000
}
```

---

### Module 7: Tracking Module (3 endpoints)

#### Test 49: Track Shipment (Public)
**Endpoint:** `GET /api/tracking/{{awb}}`

**No Auth Required**

**Expected Response (200):**
```json
{
  "awb": "FX1234567890123",
  "status": "DELIVERED",
  "receiverName": "Md Rahim",
  "timeline": [
    {
      "status": "PENDING",
      "timestamp": "2025-10-28T10:00:00.000Z"
    },
    {
      "status": "PICKED_UP",
      "timestamp": "2025-10-28T12:00:00.000Z"
    },
    {
      "status": "DELIVERED",
      "timestamp": "2025-10-29T12:00:00.000Z"
    }
  ]
}
```

---

#### Test 50: Get Live Location
**Endpoint:** `GET /api/tracking/{{awb}}/live`

**Expected Response (200):**
```json
{
  "awb": "FX1234567890123",
  "rider": {
    "name": "Rafiq Ahmed",
    "currentLocation": {
      "latitude": 23.7937,
      "longitude": 90.4066
    }
  }
}
```

---

#### Test 51: Track Multiple Shipments
**Endpoint:** `POST /api/tracking/bulk`

**Request Body:**
```json
{
  "awbList": ["FX1234567890123", "FX1234567890124", "FX1234567890125"]
}
```

**Expected Response (200):**
```json
{
  "results": [
    {
      "awb": "FX1234567890123",
      "status": "DELIVERED"
    },
    {
      "awb": "FX1234567890124",
      "status": "PENDING"
    },
    {
      "awb": "FX1234567890125",
      "status": "PENDING"
    }
  ]
}
```

---

### Module 8: Hub Operations (continued)

#### Test 52: Scan Shipment In
**Endpoint:** `POST /api/hubs/{{hubId}}/scan`

**Request Body:**
```json
{
  "awb": "{{awb}}",
  "scanType": "IN",
  "notes": "Received from pickup"
}
```

**Expected Response (200):**
```json
{
  "message": "Shipment scanned in successfully",
  "awb": "FX1234567890123",
  "hubName": "Mirpur Hub"
}
```

---

#### Test 53: Scan Shipment Out
**Endpoint:** `POST /api/hubs/{{hubId}}/scan-out`

**Request Body:**
```json
{
  "awb": "{{awb}}",
  "scanType": "OUT",
  "destinationHub": "Local Hub",
  "riderId": "{{riderId}}"
}
```

**Expected Response (200):**
```json
{
  "message": "Shipment scanned out successfully",
  "awb": "FX1234567890123",
  "assignedRider": "Rafiq Ahmed"
}
```

---

#### Test 54: Transfer Shipments
**Endpoint:** `POST /api/hubs/{{hubId}}/transfer`

**Request Body:**
```json
{
  "destinationHubId": "990e8400-e29b-41d4-a716-446655440005",
  "awbList": ["FX1234567890124", "FX1234567890125"],
  "vehicleNumber": "DHAKA-GA-5678",
  "driverName": "Karim"
}
```

**Expected Response (200):**
```json
{
  "message": "2 shipments transferred successfully",
  "transferId": "TR202510280001"
}
```

---

### Module 9: Payments Module (11 endpoints)

#### Test 55: Get COD Summary
**Endpoint:** `GET /api/finance/cod/summary`

**Expected Response (200):**
```json
{
  "totalCOD": 25000,
  "pendingPayouts": 1,
  "completedPayouts": 0,
  "totalAmount": 25000
}
```

---

#### Test 56: List COD Transactions
**Endpoint:** `GET /api/finance/cod/transactions?page=1&limit=20`

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "cod-001",
      "awb": "FX1234567890123",
      "amount": 25000,
      "status": "COLLECTED",
      "collectedBy": "Rafiq Ahmed",
      "collectedAt": "2025-10-29T12:00:00.000Z"
    }
  ]
}
```

---

#### Test 57: Get Merchant Payouts
**Endpoint:** `GET /api/finance/payouts/merchant/{{merchantId}}`

**Expected Response (200):**
```json
{
  "merchantId": "550e8400-e29b-41d4-a716-446655440000",
  "pendingAmount": 24900,
  "paidAmount": 0,
  "nextPayoutDate": "2025-11-01T00:00:00.000Z"
}
```

---

#### Test 58: Create Payout
**Endpoint:** `POST /api/finance/payouts`

**Request Body:**
```json
{
  "merchantId": "{{merchantId}}",
  "amount": 24900,
  "payoutMethod": "BANK_TRANSFER",
  "bankAccount": "1234567890",
  "bankName": "Dutch Bangla Bank"
}
```

**Expected Response (201):**
```json
{
  "id": "payout-001",
  "payoutCode": "PO202510280001",
  "amount": 24900,
  "status": "PENDING"
}
```

---

#### Test 59: List Payouts
**Endpoint:** `GET /api/finance/payouts?page=1&limit=20&status=PENDING`

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "payout-001",
      "payoutCode": "PO202510280001",
      "merchantName": "Test Merchant",
      "amount": 24900,
      "status": "PENDING"
    }
  ]
}
```

---

#### Test 60: Approve Payout
**Endpoint:** `PATCH /api/finance/payouts/payout-001/approve`

**Expected Response (200):**
```json
{
  "message": "Payout approved successfully",
  "status": "APPROVED"
}
```

---

#### Test 61: Process Payout
**Endpoint:** `POST /api/finance/payouts/payout-001/process`

**Request Body:**
```json
{
  "transactionId": "TXN202510280001",
  "paymentProof": "https://storage.fastx.com/proof/789.jpg"
}
```

**Expected Response (200):**
```json
{
  "message": "Payout processed successfully",
  "status": "COMPLETED"
}
```

---

#### Test 62: Get Rider Earnings
**Endpoint:** `GET /api/finance/riders/{{riderId}}/earnings`

**Expected Response (200):**
```json
{
  "riderId": "660e8400-e29b-41d4-a716-446655440001",
  "totalEarnings": 500,
  "deliveries": 1,
  "avgPerDelivery": 500
}
```

---

#### Test 63: Get Revenue Statistics
**Endpoint:** `GET /api/finance/revenue/statistics`

**Expected Response (200):**
```json
{
  "totalRevenue": 100,
  "deliveryFees": 100,
  "codAmount": 25000,
  "pendingPayouts": 24900
}
```

---

#### Test 64: Get Payment Report
**Endpoint:** `GET /api/finance/reports/payments?startDate=2025-10-01&endDate=2025-10-31`

**Expected Response (200):**
```json
{
  "period": {
    "startDate": "2025-10-01",
    "endDate": "2025-10-31"
  },
  "totalCOD": 25000,
  "totalPayouts": 24900,
  "totalRevenue": 100
}
```

---

#### Test 65: Process Wallet Transaction
**Endpoint:** `POST /api/finance/wallet/transaction`

**Request Body:**
```json
{
  "userId": "{{merchantId}}",
  "amount": 1000,
  "type": "DEBIT",
  "description": "Delivery fee deduction"
}
```

**Expected Response (200):**
```json
{
  "message": "Transaction processed successfully",
  "newBalance": 4000
}
```

---

### Module 10: Notifications Module (22 endpoints)

#### Test 66: Send Single Notification
**Endpoint:** `POST /api/notifications/send`

**Request Body:**
```json
{
  "userId": "{{merchantId}}",
  "type": "EMAIL",
  "channel": "EMAIL",
  "title": "Test Notification",
  "message": "This is a test notification",
  "data": {
    "awb": "FX1234567890123"
  }
}
```

**Expected Response (201):**
```json
{
  "id": "notif-001",
  "status": "SENT",
  "sentAt": "2025-10-28T10:00:00.000Z"
}
```

---

#### Test 67: Send Bulk Notifications
**Endpoint:** `POST /api/notifications/bulk-send`

**Request Body:**
```json
{
  "userIds": ["{{merchantId}}", "{{riderId}}"],
  "type": "SMS",
  "channel": "SMS",
  "title": "Bulk Notification",
  "message": "Important update for all users"
}
```

**Expected Response (201):**
```json
{
  "message": "2 notifications sent successfully",
  "sent": 2,
  "failed": 0
}
```

---

#### Test 68: List User Notifications
**Endpoint:** `GET /api/notifications/user/{{merchantId}}?page=1&limit=20`

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "notif-001",
      "type": "EMAIL",
      "title": "Test Notification",
      "isRead": false,
      "createdAt": "2025-10-28T10:00:00.000Z"
    }
  ]
}
```

---

#### Test 69: Get Notification Statistics
**Endpoint:** `GET /api/notifications/statistics`

**Expected Response (200):**
```json
{
  "total": 3,
  "byType": {
    "EMAIL": 1,
    "SMS": 2
  },
  "byStatus": {
    "SENT": 3
  }
}
```

---

#### Test 70: Mark Notification as Read
**Endpoint:** `PATCH /api/notifications/notif-001/read`

**Expected Response (200):**
```json
{
  "message": "Notification marked as read",
  "isRead": true
}
```

---

#### Test 71: Mark All as Read
**Endpoint:** `POST /api/notifications/user/{{merchantId}}/mark-all-read`

**Expected Response (200):**
```json
{
  "message": "All notifications marked as read",
  "updated": 1
}
```

---

#### Test 72: Delete Notification
**Endpoint:** `DELETE /api/notifications/notif-001`

**Expected Response (200):**
```json
{
  "message": "Notification deleted successfully"
}
```

---

#### Test 73-87: Additional Notification Endpoints
*Continue testing the remaining 15 notification endpoints following similar patterns for:*
- Get unread count
- Get by type/channel
- Subscribe/unsubscribe to topics
- Get preferences
- Update preferences
- Send template notifications
- Schedule notifications
- Get delivery status
- Retry failed notifications

---

### Module 11: Audit Logs Module (8 endpoints)

#### Test 88: Create Audit Log
**Endpoint:** `POST /api/audit-logs`

**Request Body:**
```json
{
  "userId": "{{merchantId}}",
  "action": "SHIPMENT_CREATED",
  "entityType": "SHIPMENT",
  "entityId": "{{shipmentId}}",
  "description": "Created new shipment",
  "ipAddress": "127.0.0.1",
  "userAgent": "PostmanRuntime/7.x"
}
```

**Expected Response (201):**
```json
{
  "id": "audit-001",
  "action": "SHIPMENT_CREATED",
  "createdAt": "2025-10-28T10:00:00.000Z"
}
```

---

#### Test 89: List Audit Logs
**Endpoint:** `GET /api/audit-logs?page=1&limit=20&action=SHIPMENT_CREATED`

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "audit-001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "action": "SHIPMENT_CREATED",
      "entityType": "SHIPMENT",
      "createdAt": "2025-10-28T10:00:00.000Z"
    }
  ]
}
```

---

#### Test 90: Get Audit Log Statistics
**Endpoint:** `GET /api/audit-logs/statistics`

**Expected Response (200):**
```json
{
  "total": 1,
  "byAction": {
    "SHIPMENT_CREATED": 1
  },
  "byUser": {
    "550e8400-e29b-41d4-a716-446655440000": 1
  }
}
```

---

#### Test 91: Get User Activity
**Endpoint:** `GET /api/audit-logs/user/{{merchantId}}/activity`

**Expected Response (200):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "totalActions": 1,
  "recentActions": [
    {
      "action": "SHIPMENT_CREATED",
      "timestamp": "2025-10-28T10:00:00.000Z"
    }
  ]
}
```

---

#### Test 92: Get Entity History
**Endpoint:** `GET /api/audit-logs/entity/SHIPMENT/{{shipmentId}}`

**Expected Response (200):**
```json
{
  "entityType": "SHIPMENT",
  "entityId": "770e8400-e29b-41d4-a716-446655440002",
  "history": [
    {
      "action": "SHIPMENT_CREATED",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2025-10-28T10:00:00.000Z"
    }
  ]
}
```

---

#### Test 93-95: Additional Audit Endpoints
*Continue testing the remaining audit endpoints:*
- Export audit logs
- Get security events
- Get compliance report

---

### Module 12: SLA Monitoring Module (3 endpoints)

#### Test 96: Get SLA Dashboard
**Endpoint:** `GET /api/sla/dashboard`

**Expected Response (200):**
```json
{
  "total": 1,
  "violations": 0,
  "breached": 0,
  "onTime": 1,
  "metrics": {
    "avgDeliveryTime": 24,
    "pickupSLA": 95.5,
    "deliverySLA": 98.0
  }
}
```

---

#### Test 97: Get SLA Violations
**Endpoint:** `GET /api/sla/violations?page=1&limit=20`

**Expected Response (200):**
```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20
  }
}
```

---

#### Test 98: Get Shipment SLA Status
**Endpoint:** `GET /api/sla/shipment/{{shipmentId}}`

**Expected Response (200):**
```json
{
  "shipmentId": "770e8400-e29b-41d4-a716-446655440002",
  "awb": "FX1234567890123",
  "pickupSLA": {
    "status": "ON_TIME",
    "deadline": "2025-10-28T14:00:00.000Z",
    "actualTime": "2025-10-28T12:00:00.000Z"
  },
  "deliverySLA": {
    "status": "ON_TIME",
    "deadline": "2025-10-29T18:00:00.000Z",
    "actualTime": "2025-10-29T12:00:00.000Z"
  }
}
```

---

### Remaining Tests (99-102)

#### Test 99: Refresh Token
**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Expected Response (200):**
```json
{
  "accessToken": "new_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Test 100: Logout
**Endpoint:** `POST /api/auth/logout`

**Expected Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### Test 101: Delete Shipment
**Endpoint:** `DELETE /api/shipments/{{shipmentId}}`

**Expected Response (200):**
```json
{
  "message": "Shipment deleted successfully"
}
```

---

#### Test 102: Delete Pickup
**Endpoint:** `DELETE /api/pickups/{{pickupId}}`

**Expected Response (200):**
```json
{
  "message": "Pickup deleted successfully"
}
```

---

## 🔄 Testing Workflows

### Workflow 1: Complete Shipment Lifecycle

**Step 1:** Create Merchant → **Step 2:** Login → **Step 3:** Create Shipment → **Step 4:** Create Pickup → **Step 5:** Assign Rider → **Step 6:** Complete Pickup → **Step 7:** Scan into Hub → **Step 8:** Scan out to Rider → **Step 9:** Start Delivery → **Step 10:** Complete Delivery → **Step 11:** Rider Deposits COD → **Step 12:** Process Merchant Payout

### Workflow 2: COD Collection & Payout

**Step 1:** Rider completes deliveries → **Step 2:** Rider deposits COD at hub → **Step 3:** Finance verifies COD → **Step 4:** Create merchant payout → **Step 5:** Approve payout → **Step 6:** Process payout

### Workflow 3: Real-time Tracking

**Step 1:** Create shipment → **Step 2:** Assign to rider → **Step 3:** Rider updates location → **Step 4:** Customer tracks shipment → **Step 5:** View live location

---

## 🐛 Troubleshooting

### Issue 1: 401 Unauthorized
**Solution:** 
- Check if `accessToken` is set in environment
- Refresh token if expired
- Re-login if refresh fails

### Issue 2: 404 Not Found
**Solution:**
- Verify server is running on port 3001
- Check endpoint URL is correct
- Ensure entity IDs exist

### Issue 3: 400 Bad Request
**Solution:**
- Verify request body format
- Check required fields are present
- Validate data types

### Issue 4: 500 Internal Server Error
**Solution:**
- Check server logs: `npm run start:dev`
- Verify database connection
- Check Redis connection

---

## ✅ Testing Checklist

- [ ] **Phase 1:** Authentication (Tests 1-7)
- [ ] **Phase 2:** Users Management (Tests 8-15)
- [ ] **Phase 3:** Hub Setup (Tests 16-21)
- [ ] **Phase 4:** Shipment Creation (Tests 22-29)
- [ ] **Phase 5:** Pickup Operations (Tests 30-38)
- [ ] **Phase 6:** Rider Operations (Tests 39-48)
- [ ] **Phase 7:** Tracking (Tests 49-51)
- [ ] **Phase 8:** Hub Operations (Tests 52-54)
- [ ] **Phase 9:** Payments & Finance (Tests 55-65)
- [ ] **Phase 10:** Notifications (Tests 66-87)
- [ ] **Phase 11:** Audit Logs (Tests 88-95)
- [ ] **Phase 12:** SLA Monitoring (Tests 96-98)
- [ ] **Phase 13:** Cleanup (Tests 99-102)

---

## 📊 Expected Results Summary

After completing all 102 tests, you should have:

✅ **Created:**
- 3 Users (Merchant, Rider, Hub Staff)
- 1 Hub
- 3 Shipments (1 main + 2 bulk)
- 1 Pickup Request
- Multiple notifications
- Audit logs for all actions

✅ **Completed Workflows:**
- Full authentication flow with OTP
- Complete shipment lifecycle (creation → pickup → delivery)
- COD collection and deposit
- Real-time tracking
- Payout processing

✅ **Verified:**
- All 102 endpoints responding correctly
- Authentication and authorization working
- Data persistence in database
- Redis caching operational
- Notifications sent successfully
- Audit logs recorded

---

## 🎯 Next Steps

1. **Run Integration Tests:** Use the Postman Collection Runner
2. **Performance Testing:** Test with bulk operations
3. **Load Testing:** Simulate multiple concurrent users
4. **Security Testing:** Verify role-based access control
5. **Production Deployment:** Use the tested endpoints in production

---

**Generated:** October 28, 2025  
**Version:** 1.0.0  
**Total Endpoints:** 102  
**Total Modules:** 12
