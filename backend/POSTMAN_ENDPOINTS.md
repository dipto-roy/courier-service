# 🚀 FastX Courier Service - Complete API Endpoints Guide

**Base URL:** `http://localhost:3001/api`  
**API Version:** v1  
**Last Updated:** October 29, 2025

---

## 📋 Table of Contents

1. [Health & Status](#health--status)
2. [Authentication](#authentication)
3. [Tracking](#tracking)
4. [Shipments](#shipments)
5. [Users](#users)
6. [Rider Operations](#rider-operations)
7. [Hub Operations](#hub-operations)
8. [Payments](#payments)
9. [Pickups](#pickups)
10. [Notifications](#notifications)
11. [WebSocket Events](#websocket-events)

---

## Health & Status

### 1. Health Check
```http
GET http://localhost:3001/api/health
```

**Description:** Check if the server is running and get uptime information

**Response:**
```json
{
  "status": "OK",
  "uptime": 1234.567,
  "timestamp": "2025-01-28T10:00:00Z",
  "environment": "development"
}
```

---

## Authentication

### 1. User Signup
```http
POST http://localhost:3001/api/auth/signup
Content-Type: application/json
```

**Request Body - Customer:**
```json
{
  "name": "John Doe",
  "email": "customer@example.com",
  "phone": "01712345678",
  "password": "SecurePass123!",
  "role": "customer",
  "city": "Dhaka",
  "area": "Gulshan",
  "address": "House 10, Road 5, Gulshan-1"
}
```

**Request Body - Merchant:**
```json
{
  "name": "Ahmed Merchant",
  "email": "merchant@example.com",
  "phone": "01798765432",
  "password": "SecurePass123!",
  "role": "merchant",
  "city": "Dhaka",
  "area": "Dhanmondi",
  "address": "Merchant Warehouse, Road 10",
  "merchantBusinessName": "ABC Store"
}
```

**Request Body - Rider:**
```json
{
  "name": "Rider Ahmed",
  "email": "rider@example.com",
  "phone": "01687654321",
  "password": "SecurePass123!",
  "role": "rider",
  "city": "Dhaka",
  "area": "Gulshan",
  "address": "Rider Home Address"
}
```

**Request Body - Hub Staff:**
```json
{
  "name": "Hub Manager",
  "email": "hubstaff@example.com",
  "phone": "01556789012",
  "password": "SecurePass123!",
  "role": "hub_staff",
  "city": "Dhaka",
  "area": "Gulshan",
  "address": "Hub Location Address"
}
```

**Request Body - Agent:**
```json
{
  "name": "Pickup Agent",
  "email": "agent@example.com",
  "phone": "01445678901",
  "password": "SecurePass123!",
  "role": "agent",
  "city": "Dhaka",
  "area": "Dhanmondi",
  "address": "Agent Base Address"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "merchant@example.com",
    "name": "Ahmed Merchant",
    "phone": "01798765432",
    "role": "merchant",
    "isActive": true,
    "isVerified": false,
    "isKycVerified": false,
    "walletBalance": "0.00",
    "city": "Dhaka",
    "area": "Dhanmondi",
    "address": "Merchant Warehouse, Road 10",
    "merchantBusinessName": "ABC Store",
    "createdAt": "2025-01-28T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Available Roles:**
- `customer` - End customer (default)
- `merchant` - Shipment sender/seller
- `rider` - Delivery rider
- `agent` - Pickup agent
- `hub_staff` - Hub staff member
- `admin` - Administrator (only by admin user)
- `finance` - Finance team (only by admin user)
- `support` - Support team (only by admin user)

### 2. User Login
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "merchant@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "merchant@example.com",
    "name": "Ahmed Merchant",
    "phone": "01798765432",
    "role": "merchant",
    "isActive": true,
    "isVerified": true,
    "isKycVerified": false,
    "walletBalance": "0.00"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Verify OTP
```http
POST http://localhost:3001/api/auth/verify-otp
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com"
  }
}
```

### 4. Refresh Token
```http
POST http://localhost:3001/api/auth/refresh
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. Get Current User Profile
```http
GET http://localhost:3001/api/auth/me
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "merchant@example.com",
    "name": "Ahmed Merchant",
    "phone": "01798765432",
    "role": "merchant",
    "isActive": true,
    "isVerified": true,
    "isKycVerified": false,
    "walletBalance": "10000.00",
    "city": "Dhaka",
    "area": "Dhanmondi",
    "address": "Merchant Warehouse, Road 10",
    "merchantBusinessName": "ABC Store",
    "createdAt": "2025-01-28T08:00:00Z"
  }
}
```

### 6. Logout
```http
POST http://localhost:3001/api/auth/logout
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Tracking

### 1. Public Tracking (No Auth Required)
```http
GET http://localhost:3001/api/tracking/public/FX20250128000001?phone=5678
```

**Description:** Track shipment without authentication. Optionally verify with last 4 digits of phone.

**Response (200):**
```json
{
  "success": true,
  "tracking": {
    "awb": "FX20250128000001",
    "status": "OUT_FOR_DELIVERY",
    "currentLocation": "Gulshan Hub",
    "expectedDeliveryDate": "2025-01-28T18:00:00Z",
    "eta": "2-4 hours",
    "receiverName": "John Doe",
    "receiverAddress": "123 Main St, Dhaka",
    "deliveryArea": "Gulshan",
    "weight": 2.5,
    "deliveryType": "EXPRESS",
    "deliveryAttempts": 0,
    "isRto": false,
    "timeline": [
      {
        "status": "PENDING",
        "timestamp": "2025-01-28T08:00:00Z",
        "description": "Shipment created by merchant"
      },
      {
        "status": "PICKED_UP",
        "timestamp": "2025-01-28T10:00:00Z",
        "location": "Merchant Location",
        "description": "Shipment picked up by agent"
      },
      {
        "status": "IN_HUB",
        "timestamp": "2025-01-28T12:00:00Z",
        "location": "Dhaka Hub",
        "description": "Arrived at hub for sorting"
      },
      {
        "status": "OUT_FOR_DELIVERY",
        "timestamp": "2025-01-28T14:00:00Z",
        "location": "Gulshan",
        "description": "Out for delivery"
      }
    ],
    "riderLocation": {
      "latitude": 23.8103,
      "longitude": 90.4125,
      "accuracy": 10,
      "timestamp": "2025-01-28T15:30:00Z",
      "isOnline": true
    }
  }
}
```

### 2. Detailed Tracking (Auth Required)
```http
GET http://localhost:3001/api/tracking/detailed/FX20250128000001
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "tracking": {
    "awb": "FX20250128000001",
    "shipmentId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "OUT_FOR_DELIVERY",
    "merchantId": "merchant-123",
    "senderDetails": {
      "name": "ABC Store",
      "phone": "01798765432",
      "address": "Merchant Warehouse, Dhaka"
    },
    "receiverDetails": {
      "name": "John Doe",
      "phone": "01712345678",
      "address": "123 Main St, Dhaka"
    },
    "codAmount": 1500,
    "weight": 2.5,
    "deliveryType": "EXPRESS",
    "fullTimeline": [
      {
        "status": "PENDING",
        "timestamp": "2025-01-28T08:00:00Z",
        "description": "Shipment created"
      }
    ]
  }
}
```

### 3. Get Subscription Info (for real-time updates)
```http
GET http://localhost:3001/api/tracking/subscription/FX20250128000001
```

**Response (200):**
```json
{
  "success": true,
  "subscription": {
    "channel": "shipment-FX20250128000001",
    "events": ["status-changed", "rider-location-updated"],
    "pusherKey": "your_pusher_key",
    "pusherCluster": "ap2"
  }
}
```

### 4. WebSocket Gateway Status
```http
GET http://localhost:3001/api/tracking/gateway-status
```

**Response (200):**
```json
{
  "status": "operational",
  "namespace": "/tracking",
  "activeConnections": 5,
  "activeSubscriptions": 3,
  "subscriptions": [
    {
      "awb": "FX20251028376654",
      "connections": 2
    },
    {
      "awb": "FX20251028001",
      "connections": 1
    }
  ],
  "serverRunning": true
}
```

### 5. Get Active WebSocket Subscriptions
```http
GET http://localhost:3001/api/tracking/active-subscriptions
```

**Response (200):**
```json
{
  "subscriptions": [
    {
      "awb": "FX20251028376654",
      "connections": 2
    }
  ],
  "timestamp": "2025-01-28T15:30:00Z"
}
```

### 6. Send Test WebSocket Event (Debug)
```http
GET http://localhost:3001/api/tracking/test-event/FX20250128000001
```

**Response (200):**
```json
{
  "success": true,
  "message": "Test event sent to FX20250128000001",
  "subscriberCount": 2,
  "hasSubscribers": true
}
```

### 7. Get Monitoring Dashboard
```http
GET http://localhost:3001/api/tracking/monitor
```

**Response (200):**
```json
{
  "gateway": {
    "status": "operational",
    "namespace": "/tracking",
    "activeConnections": 5,
    "activeSubscriptions": 3,
    "subscriptions": [
      {
        "awb": "FX20251028376654",
        "connections": 2
      }
    ],
    "serverRunning": true
  },
  "recentActivity": {
    "activeTracking": 1,
    "totalSubscribers": 2
  },
  "health": {
    "websocket": "healthy",
    "namespace": "/tracking",
    "timestamp": "2025-01-28T15:30:00Z"
  },
  "activeShipments": [
    {
      "awb": "FX20251028376654",
      "connections": 2
    }
  ]
}
```

---

## Shipments

### 1. Create Shipment
```http
POST http://localhost:3001/api/shipments
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "receiverName": "Jane Smith",
  "receiverPhone": "01798765432",
  "receiverCity": "Dhaka",
  "receiverArea": "Dhanmondi",
  "receiverAddress": "House 5 Road 3, Dhanmondi, Dhaka",
  "weight": 2.5,
  "codAmount": 3500,
  "deliveryType": "express",
  "parcelDescription": "Electronics - Mobile Phone"
}
```

**Response (201):**
```json
{
  "success": true,
  "shipment": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "awb": "FX20250128000001",
    "status": "PENDING",
    "codAmount": 3500,
    "weight": 2.5,
    "deliveryType": "express",
    "receiverName": "Jane Smith",
    "createdAt": "2025-01-28T10:00:00Z"
  }
}
```

### 2. Get All Shipments
```http
GET http://localhost:3001/api/shipments?status=pending&page=1&limit=20
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "awb": "FX20250128000001",
      "status": "PENDING",
      "receiverName": "Jane Smith",
      "codAmount": 3500,
      "createdAt": "2025-01-28T10:00:00Z"
    }
  ]
}
```

### 3. Get Shipment Statistics
```http
GET http://localhost:3001/api/shipments/statistics
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "total": 500,
  "pending": 50,
  "pickedUp": 75,
  "inHub": 100,
  "outForDelivery": 150,
  "delivered": 100,
  "failed": 20,
  "rto": 5
}
```

### 4. Get Shipment by ID
```http
GET http://localhost:3001/api/shipments/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "shipment": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "awb": "FX20250128000001",
    "status": "OUT_FOR_DELIVERY",
    "senderName": "ABC Store",
    "receiverName": "Jane Smith",
    "receiverPhone": "01798765432",
    "codAmount": 3500,
    "weight": 2.5,
    "createdAt": "2025-01-28T10:00:00Z"
  }
}
```

### 5. Update Shipment
```http
PATCH http://localhost:3001/api/shipments/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "receiverName": "Jane Updated Smith",
  "receiverPhone": "01798765432",
  "receiverAddress": "New Address, Dhaka",
  "codAmount": 3600
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Shipment updated successfully",
  "shipment": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "awb": "FX20250128000001",
    "receiverName": "Jane Updated Smith",
    "codAmount": 3600
  }
}
```

### 6. Update Shipment Status
```http
PATCH http://localhost:3001/api/shipments/123e4567-e89b-12d3-a456-426614174000/status
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "OUT_FOR_DELIVERY",
  "notes": "Rider is on the way"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "shipment": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "awb": "FX20250128000001",
    "status": "OUT_FOR_DELIVERY"
  }
}
```

### 7. Bulk Upload Shipments from CSV
```http
POST http://localhost:3001/api/shipments/bulk-upload
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "csvData": "receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType\nJane Smith,01798765432,Dhaka,Dhanmondi,House 5 Road 3,2.5,3500,normal\nMichael Johnson,01687654321,Chittagong,Nasirabad,Building 10 Block A,1.2,1500,express"
}
```

**Response (201):**
```json
{
  "totalRows": 2,
  "successCount": 2,
  "failedCount": 0,
  "errors": [],
  "shipments": [
    {
      "awb": "FX20251028929833",
      "receiverName": "Jane Smith",
      "receiverPhone": "01798765432"
    },
    {
      "awb": "FX20251028929834",
      "receiverName": "Michael Johnson",
      "receiverPhone": "01687654321"
    }
  ]
}
```

### 8. Delete Shipment
```http
DELETE http://localhost:3001/api/shipments/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (204):** No content

---

## Users

### 1. Create User (Admin Only)
```http
POST http://localhost:3001/api/users
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "phone": "01712345678",
  "fullName": "New User",
  "role": "merchant",
  "companyName": "New Company"
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "newuser@example.com",
  "fullName": "New User",
  "role": "merchant",
  "createdAt": "2025-01-28T10:00:00Z"
}
```

### 2. Get All Users
```http
GET http://localhost:3001/api/users?role=merchant&page=1&limit=20
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "total": 50,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "merchant@example.com",
      "fullName": "John Merchant",
      "role": "merchant",
      "walletBalance": 10000
    }
  ]
}
```

### 3. Get User Statistics
```http
GET http://localhost:3001/api/users/statistics
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200):**
```json
{
  "total": 150,
  "byRole": {
    "admin": 5,
    "merchant": 80,
    "rider": 50,
    "hub_staff": 15
  },
  "activeToday": 75
}
```

### 4. Get Current User
```http
GET http://localhost:3001/api/users/me
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "merchant@example.com",
  "fullName": "John Merchant",
  "phone": "01712345678",
  "role": "merchant",
  "walletBalance": 10000,
  "isKycVerified": true,
  "createdAt": "2025-01-28T08:00:00Z"
}
```

### 5. Get User by ID
```http
GET http://localhost:3001/api/users/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "fullName": "John User",
  "phone": "01712345678",
  "role": "merchant"
}
```

### 6. Update User
```http
PATCH http://localhost:3001/api/users/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Updated",
  "phone": "01787654321",
  "companyName": "Updated Company"
}
```

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "fullName": "John Updated",
  "phone": "01787654321"
}
```

### 7. Update KYC Status
```http
PATCH http://localhost:3001/api/users/123e4567-e89b-12d3-a456-426614174000/kyc
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isVerified": true,
  "verificationDate": "2025-01-28T10:00:00Z",
  "verifiedBy": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "KYC status updated",
  "isKycVerified": true
}
```

### 8. Update Wallet Balance
```http
PATCH http://localhost:3001/api/users/123e4567-e89b-12d3-a456-426614174000/wallet
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 5000,
  "type": "credit",
  "description": "Manual top-up"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Wallet updated",
  "walletBalance": 15000
}
```

### 9. Delete User (Soft Delete)
```http
DELETE http://localhost:3001/api/users/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (204):** No content

### 10. Restore User
```http
POST http://localhost:3001/api/users/123e4567-e89b-12d3-a456-426614174000/restore
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User restored successfully"
}
```

---

## Rider Operations

### 1. Get Assigned Manifests
```http
GET http://localhost:3001/api/rider/manifests
Authorization: Bearer <RIDER_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "total": 2,
  "manifests": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "manifestNumber": "MF-20250128-0001",
      "status": "IN_TRANSIT",
      "originHub": "Dhaka Hub",
      "destinationHub": "Chittagong Hub",
      "totalShipments": 15,
      "dispatchDate": "2025-01-28T10:00:00Z"
    }
  ]
}
```

### 2. Get My Shipments
```http
GET http://localhost:3001/api/rider/shipments
Authorization: Bearer <RIDER_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "total": 8,
  "shipments": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "awb": "FX20250128000001",
      "status": "OUT_FOR_DELIVERY",
      "receiverName": "John Doe",
      "receiverPhone": "01712345678",
      "receiverAddress": "123 Main St",
      "codAmount": 1500,
      "deliveryType": "EXPRESS",
      "otpCode": "123456"
    }
  ]
}
```

### 3. Get Shipment Details by AWB
```http
GET http://localhost:3001/api/rider/shipments/FX20250128000001
Authorization: Bearer <RIDER_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "shipment": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "awb": "FX20250128000001",
    "status": "OUT_FOR_DELIVERY",
    "receiverName": "John Doe",
    "receiverPhone": "01712345678",
    "codAmount": 1500,
    "otpCode": "123456"
  }
}
```

### 4. Generate OTP
```http
POST http://localhost:3001/api/rider/generate-otp
Authorization: Bearer <RIDER_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "awb": "FX20250128000001"
}
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

### 5. Complete Delivery with OTP
```http
POST http://localhost:3001/api/rider/complete-delivery
Authorization: Bearer <RIDER_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "awb": "FX20250128000001",
  "otp": "123456",
  "codAmount": 1500,
  "recipientSignature": "base64_encoded_signature",
  "podPhotos": ["base64_photo_1", "base64_photo_2"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Delivery completed successfully",
  "awb": "FX20250128000001",
  "deliveredAt": "2025-01-28T14:30:00Z",
  "codCollected": 1500
}
```

### 6. Record Failed Delivery
```http
POST http://localhost:3001/api/rider/failed-delivery
Authorization: Bearer <RIDER_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "awb": "FX20250128000001",
  "reason": "CUSTOMER_NOT_AVAILABLE",
  "notes": "Customer was not at home, will try again tomorrow"
}
```

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

### 7. Mark RTO (Return to Origin)
```http
POST http://localhost:3001/api/rider/mark-rto
Authorization: Bearer <RIDER_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "awb": "FX20250128000001",
  "reason": "CUSTOMER_REFUSED",
  "notes": "Customer refused to accept the package"
}
```

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

### 8. Update Rider Location
```http
POST http://localhost:3001/api/rider/update-location
Authorization: Bearer <RIDER_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "latitude": 23.8103,
  "longitude": 90.4125,
  "accuracy": 10.5,
  "speed": 15.2,
  "heading": 270,
  "batteryLevel": 85
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "location": {
    "latitude": 23.8103,
    "longitude": 90.4125,
    "timestamp": "2025-01-28T14:30:00Z"
  }
}
```

### 9. Get Location History
```http
GET http://localhost:3001/api/rider/location-history?limit=50
Authorization: Bearer <RIDER_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "total": 50,
  "locations": [
    {
      "latitude": 23.8103,
      "longitude": 90.4125,
      "accuracy": 10.5,
      "speed": 15.2,
      "batteryLevel": 85,
      "isOnline": true,
      "timestamp": "2025-01-28T14:30:00Z"
    }
  ]
}
```

### 10. Get Rider Statistics
```http
GET http://localhost:3001/api/rider/statistics
Authorization: Bearer <RIDER_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "statistics": {
    "totalAssigned": 150,
    "outForDelivery": 12,
    "delivered": 125,
    "failedDeliveries": 8,
    "rtoShipments": 5,
    "todayDeliveries": 18,
    "totalCodCollected": 125000,
    "deliveryRate": "83.33%"
  }
}
```

---

## Hub Operations

### 1. Inbound Scan (Receive at Hub)
```http
POST http://localhost:3001/api/hub/inbound-scan
Authorization: Bearer <HUB_STAFF_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "awbs": ["FXC2025010001", "FXC2025010002", "FXC2025010003"],
  "hubLocation": "Dhaka Hub"
}
```

**Response (201):**
```json
{
  "success": true,
  "scannedCount": 3,
  "hubLocation": "Dhaka Hub",
  "scannedShipments": [
    {
      "awb": "FXC2025010001",
      "status": "at_hub",
      "currentHub": "Dhaka Hub"
    }
  ],
  "message": "Successfully scanned 3 shipments at Dhaka Hub"
}
```

### 2. Outbound Scan (Dispatch from Hub)
```http
POST http://localhost:3001/api/hub/outbound-scan
Authorization: Bearer <HUB_STAFF_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "awbs": ["FXC2025010001", "FXC2025010002"],
  "originHub": "Dhaka Hub",
  "destinationHub": "Chittagong Hub"
}
```

**Response (201):**
```json
{
  "success": true,
  "scannedCount": 2,
  "originHub": "Dhaka Hub",
  "destinationHub": "Chittagong Hub",
  "scannedShipments": [
    {
      "awb": "FXC2025010001",
      "status": "in_transit",
      "destination": "Chittagong Hub"
    }
  ],
  "message": "Successfully dispatched 2 shipments from Dhaka Hub"
}
```

### 3. Sort Shipments
```http
POST http://localhost:3001/api/hub/sorting
Authorization: Bearer <HUB_STAFF_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "awbs": ["FXC2025010001", "FXC2025010002"],
  "hubLocation": "Dhaka Hub",
  "destinationHub": "Chittagong Hub"
}
```

**Response (201):**
```json
{
  "success": true,
  "sortedCount": 2,
  "hubLocation": "Dhaka Hub",
  "destinationHub": "Chittagong Hub",
  "message": "Sorted 2 shipments for Chittagong Hub"
}
```

### 4. Create Manifest
```http
POST http://localhost:3001/api/hub/manifests
Authorization: Bearer <HUB_STAFF_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "originHub": "Dhaka Hub",
  "destinationHub": "Chittagong Hub",
  "awbs": ["FXC2025010001", "FXC2025010002", "FXC2025010003"]
}
```

**Response (201):**
```json
{
  "success": true,
  "manifest": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "manifestNumber": "MF-20250128-0001",
    "originHub": "Dhaka Hub",
    "destinationHub": "Chittagong Hub",
    "totalShipments": 3,
    "status": "in_transit",
    "dispatchDate": "2025-01-28T10:30:00Z"
  },
  "message": "Manifest MF-20250128-0001 created with 3 shipments"
}
```

### 5. Get All Manifests
```http
GET http://localhost:3001/api/hub/manifests?status=in_transit&page=1&limit=20
Authorization: Bearer <HUB_STAFF_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "total": 50,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "manifestNumber": "MF-20250128-0001",
      "originHub": "Dhaka Hub",
      "destinationHub": "Chittagong Hub",
      "totalShipments": 25,
      "status": "in_transit"
    }
  ]
}
```

### 6. Get Manifest Statistics
```http
GET http://localhost:3001/api/hub/manifests/statistics?hubLocation=Dhaka%20Hub
Authorization: Bearer <HUB_STAFF_TOKEN>
```

**Response (200):**
```json
{
  "total": 100,
  "created": 5,
  "inTransit": 20,
  "received": 70,
  "closed": 5,
  "hubLocation": "Dhaka Hub"
}
```

### 7. Get Manifest Details
```http
GET http://localhost:3001/api/hub/manifests/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <HUB_STAFF_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "manifest": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "manifestNumber": "MF-20250128-0001",
    "originHub": "Dhaka Hub",
    "destinationHub": "Chittagong Hub",
    "totalShipments": 25,
    "status": "in_transit",
    "shipments": [...]
  }
}
```

### 8. Receive Manifest at Destination
```http
POST http://localhost:3001/api/hub/manifests/123e4567-e89b-12d3-a456-426614174000/receive
Authorization: Bearer <HUB_STAFF_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "receivedAwbs": ["FXC2025010001", "FXC2025010002", "FXC2025010003"],
  "hubLocation": "Chittagong Hub",
  "receivedDate": "2025-01-28T14:00:00Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "manifestNumber": "MF-20250128-0001",
  "receivedCount": 24,
  "expectedCount": 25,
  "discrepancies": {
    "notInManifest": [],
    "notReceived": ["FXC2025010025"]
  },
  "message": "Manifest MF-20250128-0001 received at Chittagong Hub"
}
```

### 9. Close Manifest
```http
PATCH http://localhost:3001/api/hub/manifests/123e4567-e89b-12d3-a456-426614174000/close
Authorization: Bearer <HUB_STAFF_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Manifest closed successfully",
  "manifest": {
    "manifestNumber": "MF-20250128-0001",
    "status": "closed"
  }
}
```

### 10. Get Hub Inventory
```http
GET http://localhost:3001/api/hub/inventory/Dhaka%20Hub
Authorization: Bearer <HUB_STAFF_TOKEN>
```

**Response (200):**
```json
{
  "hubLocation": "Dhaka Hub",
  "statistics": {
    "totalShipments": 150,
    "byDestination": {
      "Chittagong Hub": 50,
      "Sylhet Hub": 30,
      "Local Delivery": 70
    },
    "byType": {
      "express": 40,
      "normal": 110
    },
    "codShipments": 80,
    "totalCodAmount": 125000
  },
  "shipments": [...]
}
```

---

## Payments

### 1. Record COD Collection
```http
POST http://localhost:3001/api/payments/record-cod/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <RIDER_TOKEN>
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "transactionId": "COD-1KXYZ123-ABC456",
  "type": "cod_collection",
  "status": "completed",
  "amount": 5000,
  "fee": 150,
  "netAmount": 4850,
  "processedAt": "2025-01-28T10:30:00Z"
}
```

### 2. Record Delivery Fee
```http
POST http://localhost:3001/api/payments/record-delivery-fee/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <HUB_STAFF_TOKEN>
```

**Response (201):**
```json
{
  "success": true,
  "message": "Delivery fee recorded"
}
```

### 3. Initiate Payout
```http
POST http://localhost:3001/api/payments/initiate-payout
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "merchantId": "123e4567-e89b-12d3-a456-426614174000",
  "amount": 15000,
  "bankAccountId": "bank-account-id-123"
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "transactionId": "POUT-1KXYZ123-DEF789",
  "type": "cod_payout",
  "status": "processing",
  "amount": 15000,
  "fee": 50,
  "netAmount": 14950,
  "newBalance": 5000
}
```

### 4. Complete Payout
```http
PATCH http://localhost:3001/api/payments/complete-payout/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "referenceNumber": "BANK-REF-123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payout completed successfully"
}
```

### 5. Get Transactions
```http
GET http://localhost:3001/api/payments/transactions?type=cod_collection&page=1&limit=20
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "transactionId": "COD-1KXYZ123-ABC456",
      "type": "cod_collection",
      "amount": 5000,
      "status": "completed",
      "createdAt": "2025-01-28T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### 6. Get Pending Collections
```http
GET http://localhost:3001/api/payments/pending-collections/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "transactionId": "COD-1KXYZ123-ABC456",
    "amount": 5000,
    "netAmount": 4850,
    "createdAt": "2025-01-20T10:30:00Z"
  }
]
```

### 7. Get Pending Balance
```http
GET http://localhost:3001/api/payments/pending-balance/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "pendingBalance": 15750.50
}
```

### 8. Get Merchant Statistics
```http
GET http://localhost:3001/api/payments/statistics/merchant/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200):**
```json
{
  "walletBalance": 5000,
  "pendingBalance": 15750.50,
  "totalCodCollected": 150000,
  "totalCodTransactions": 250,
  "totalDeliveryFees": 7500,
  "totalPayouts": 100000,
  "thisMonthCollections": 25000
}
```

### 9. Get Overall Statistics
```http
GET http://localhost:3001/api/payments/statistics/overall
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200):**
```json
{
  "totalCodCollected": 5000000,
  "totalCodTransactions": 8500,
  "totalPayouts": 3500000,
  "totalPayoutTransactions": 450,
  "pendingPayouts": 250000,
  "todayCollections": 75000,
  "thisMonthCollections": 850000
}
```

---

## Pickups

### 1. Create Pickup Request
```http
POST http://localhost:3001/api/pickups
Authorization: Bearer <MERCHANT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "pickupAddress": "Merchant Warehouse, Dhaka",
  "pickupCity": "Dhaka",
  "pickupArea": "Gulshan",
  "pickupTime": "2025-01-28T10:00:00Z",
  "contactPerson": "Warehouse Manager",
  "contactPhone": "01798765432",
  "shipmentCount": 5,
  "notes": "Please ring the bell twice"
}
```

**Response (201):**
```json
{
  "success": true,
  "pickup": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "pickupNumber": "PU-20250128-0001",
    "status": "PENDING",
    "shipmentCount": 5,
    "createdAt": "2025-01-28T10:00:00Z"
  }
}
```

### 2. Get All Pickups
```http
GET http://localhost:3001/api/pickups?status=pending&page=1&limit=20
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "total": 50,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "pickupNumber": "PU-20250128-0001",
      "status": "PENDING",
      "pickupAddress": "Merchant Warehouse, Dhaka",
      "shipmentCount": 5
    }
  ]
}
```

### 3. Get Pickup Statistics
```http
GET http://localhost:3001/api/pickups/statistics
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "total": 100,
  "pending": 10,
  "assigned": 5,
  "inProgress": 3,
  "completed": 75,
  "cancelled": 7
}
```

### 4. Get Agent's Today Pickups
```http
GET http://localhost:3001/api/pickups/today
Authorization: Bearer <AGENT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "total": 5,
  "pickups": [...]
}
```

### 5. Get Pickup by ID
```http
GET http://localhost:3001/api/pickups/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "pickup": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "pickupNumber": "PU-20250128-0001",
    "status": "PENDING",
    "pickupAddress": "Merchant Warehouse, Dhaka",
    "shipmentCount": 5
  }
}
```

### 6. Update Pickup
```http
PATCH http://localhost:3001/api/pickups/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <MERCHANT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "pickupTime": "2025-01-28T11:00:00Z",
  "notes": "Updated instructions"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Pickup updated successfully"
}
```

### 7. Assign Pickup to Agent
```http
POST http://localhost:3001/api/pickups/123e4567-e89b-12d3-a456-426614174000/assign
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "agentId": "123e4567-e89b-12d3-a456-426614174001"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Pickup assigned successfully"
}
```

### 8. Start Pickup
```http
POST http://localhost:3001/api/pickups/123e4567-e89b-12d3-a456-426614174000/start
Authorization: Bearer <AGENT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Pickup started successfully",
  "status": "IN_PROGRESS"
}
```

### 9. Complete Pickup
```http
POST http://localhost:3001/api/pickups/123e4567-e89b-12d3-a456-426614174000/complete
Authorization: Bearer <AGENT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "scannedAwbs": ["FXC2025010001", "FXC2025010002"],
  "notes": "All items picked up"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Pickup completed successfully",
  "scannedCount": 2
}
```

### 10. Cancel Pickup
```http
POST http://localhost:3001/api/pickups/123e4567-e89b-12d3-a456-426614174000/cancel
Authorization: Bearer <MERCHANT_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Pickup cancelled successfully"
}
```

---

## Notifications

### 1. Send Notification
```http
POST http://localhost:3001/api/notifications
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "type": "email",
  "title": "Shipment Update",
  "message": "Your shipment has been delivered"
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "type": "email",
  "title": "Shipment Update",
  "message": "Your shipment has been delivered",
  "isRead": false,
  "createdAt": "2025-01-28T10:00:00Z"
}
```

### 2. Send Email
```http
POST http://localhost:3001/api/notifications/email
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "recipient": "user@example.com",
  "subject": "Shipment Delivered",
  "body": "Your shipment FX20250128000001 has been delivered successfully"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Email queued for delivery"
}
```

### 3. Send SMS
```http
POST http://localhost:3001/api/notifications/sms
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "recipient": "01712345678",
  "message": "Your shipment is out for delivery. Rider name: Ahmed. Call: 01987654321"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "SMS queued for delivery"
}
```

### 4. Send Push Notification
```http
POST http://localhost:3001/api/notifications/push
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Shipment Update",
  "body": "Your shipment is out for delivery",
  "data": {
    "awb": "FX20250128000001",
    "status": "OUT_FOR_DELIVERY"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Push notification queued for delivery"
}
```

### 5. Get My Notifications
```http
GET http://localhost:3001/api/notifications/my-notifications?isRead=false
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "type": "push",
    "title": "Shipment Update",
    "message": "Your shipment is out for delivery",
    "isRead": false,
    "createdAt": "2025-01-28T10:00:00Z"
  }
]
```

### 6. Get Unread Count
```http
GET http://localhost:3001/api/notifications/unread-count
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "count": 5
}
```

### 7. Mark as Read
```http
PATCH http://localhost:3001/api/notifications/123e4567-e89b-12d3-a456-426614174000/read
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "isRead": true,
  "readAt": "2025-01-28T10:30:00Z"
}
```

### 8. Mark All as Read
```http
PATCH http://localhost:3001/api/notifications/mark-all-read
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### 9. Get Notification Statistics
```http
GET http://localhost:3001/api/notifications/statistics
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200):**
```json
{
  "total": 1000,
  "sent": 950,
  "failed": 50,
  "unread": 0,
  "byType": {
    "email": 400,
    "sms": 350,
    "push": 250
  }
}
```

### 10. Trigger Shipment Created Notification
```http
POST http://localhost:3001/api/notifications/shipment/created
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "shipmentId": "123e4567-e89b-12d3-a456-426614174001",
  "awb": "FX20250128000001",
  "data": {
    "receiverName": "John Doe",
    "deliveryArea": "Gulshan",
    "codAmount": 1500
  }
}
```

**Response (201):**
```json
{
  "success": true
}
```

---

## WebSocket Events

### Connect to WebSocket
```javascript
const socket = io('http://localhost:3001/tracking', {
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('Connected to tracking namespace');
  console.log('Socket ID:', socket.id);
});
```

### Subscribe to Shipment Tracking
```javascript
socket.emit('subscribe', { awb: 'FX20250128000001' }, (response) => {
  console.log('Subscribe response:', response);
  // Response: { success: true, awb: 'FX20250128000001', message: '...' }
});
```

### Listen for Status Updates
```javascript
socket.on('status-update', (data) => {
  console.log('Status update:', data);
  // {
  //   awb: 'FX20250128000001',
  //   status: 'OUT_FOR_DELIVERY',
  //   timestamp: '2025-01-28T14:00:00Z'
  // }
});
```

### Listen for Location Updates
```javascript
socket.on('location-update', (data) => {
  console.log('Location update:', data);
  // {
  //   awb: 'FX20250128000001',
  //   latitude: 23.8103,
  //   longitude: 90.4125,
  //   accuracy: 10,
  //   timestamp: '2025-01-28T15:30:00Z'
  // }
});
```

### Listen for ETA Updates
```javascript
socket.on('eta-update', (data) => {
  console.log('ETA update:', data);
  // {
  //   awb: 'FX20250128000001',
  //   eta: '2-4 hours',
  //   estimatedDelivery: '2025-01-28T18:00:00Z',
  //   timestamp: '2025-01-28T15:30:00Z'
  // }
});
```

### Unsubscribe from Tracking
```javascript
socket.emit('unsubscribe', { awb: 'FX20250128000001' }, (response) => {
  console.log('Unsubscribe response:', response);
  // Response: { success: true, awb: 'FX20250128000001', message: '...' }
});
```

### Listen for Test Events
```javascript
socket.on('test-event', (data) => {
  console.log('Test event:', data);
  // {
  //   awb: 'FX20250128000001',
  //   message: 'This is a test broadcast from backend',
  //   timestamp: '2025-01-28T15:30:00Z'
  // }
});
```

### Error Handling
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

---

## Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Delete successful |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

---

## Authentication

Most endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Rate Limiting

- **General endpoints:** 100 requests per minute
- **WebSocket connections:** Unlimited
- **File uploads:** 10 MB max per file

---

**Last Updated:** October 29, 2025  
**API Version:** 1.0.0  
**Status:** Production Ready ✅
