# Courier Service - API Documentation

Complete REST API reference for the Courier Service backend.

**Base URL**: `http://localhost:3001/api` (development)

**Authentication**: JWT Bearer token in `Authorization` header

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Endpoints](#user-endpoints)
3. [Shipment Endpoints](#shipment-endpoints)
4. [Tracking Endpoints](#tracking-endpoints)
5. [Rider Endpoints](#rider-endpoints)
6. [Hub Endpoints](#hub-endpoints)
7. [Payment Endpoints](#payment-endpoints)
8. [Notification Endpoints](#notification-endpoints)
9. [Pickup Endpoints](#pickup-endpoints)
10. [SLA Endpoints](#sla-endpoints)
11. [Audit Endpoints](#audit-endpoints)

---

## Authentication Endpoints

### 1. User Registration

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER"
}

Response (201):
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### 2. User Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "CUSTOMER",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### 3. Refresh Access Token

```http
POST /api/auth/refresh
Authorization: Bearer <refreshToken>

Response (200):
{
  "accessToken": "eyJhbGc..."
}
```

### 4. OTP Generation

```http
POST /api/auth/otp/generate
Content-Type: application/json

{
  "phone": "+1234567890"
}

Response (200):
{
  "otpId": "uuid",
  "expiresIn": 300,
  "message": "OTP sent successfully"
}
```

### 5. OTP Verification

```http
POST /api/auth/otp/verify
Content-Type: application/json

{
  "phone": "+1234567890",
  "otp": "123456"
}

Response (200):
{
  "verified": true,
  "accessToken": "eyJhbGc..."
}
```

### 6. Logout

```http
POST /api/auth/logout
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### 7. Get Current User

```http
GET /api/users/me
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 8. Update User Profile

```http
PUT /api/users/me
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "+9876543210"
}

Response (200):
{
  "id": "uuid",
  "name": "Jane Doe",
  "phone": "+9876543210",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### 9. Get All Users (Admin & Support only)

```http
GET /api/users?page=1&limit=20&role=CUSTOMER
Authorization: Bearer <adminToken>

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CUSTOMER",
      "status": "ACTIVE"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### 10. Get User by ID (Admin & Support only)

```http
GET /api/users/:id
Authorization: Bearer <adminToken>

Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "profile": {
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York"
  }
}
```

### 11. Deactivate User (Admin only)

```http
PATCH /api/users/:id/deactivate
Authorization: Bearer <adminToken>

Response (200):
{
  "message": "User deactivated successfully"
}
```

---

## Shipment Endpoints

### 12. Get All Shipments

```http
GET /api/shipments?page=1&limit=20&status=PENDING
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "awb": "CSE123456789",
      "customerId": "uuid",
      "recipientName": "Alice Smith",
      "recipientPhone": "+1111111111",
      "origin": {
        "address": "123 Main St",
        "city": "New York",
        "coordinates": { "lat": 40.7128, "lng": -74.0060 }
      },
      "destination": {
        "address": "456 Oak Ave",
        "city": "Los Angeles",
        "coordinates": { "lat": 34.0522, "lng": -118.2437 }
      },
      "status": "PENDING",
      "deliveryType": "EXPRESS",
      "weight": 2.5,
      "codAmount": 0,
      "deliveryFee": 50.00,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

### 13. Create Shipment

```http
POST /api/shipments
Authorization: Bearer <customerToken>
Content-Type: application/json

{
  "recipientName": "Alice Smith",
  "recipientPhone": "+1111111111",
  "origin": {
    "address": "123 Main St",
    "city": "New York",
    "coordinates": { "lat": 40.7128, "lng": -74.0060 }
  },
  "destination": {
    "address": "456 Oak Ave",
    "city": "Los Angeles",
    "coordinates": { "lat": 34.0522, "lng": -118.2437 }
  },
  "weight": 2.5,
  "deliveryType": "EXPRESS",
  "codAmount": 100.00,
  "specialInstructions": "Handle with care"
}

Response (201):
{
  "id": "uuid",
  "awb": "CSE123456789",
  "status": "PENDING",
  "deliveryFee": 50.00,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 14. Get Shipment by ID

```http
GET /api/shipments/:id
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "uuid",
  "awb": "CSE123456789",
  "customerId": "uuid",
  "recipientName": "Alice Smith",
  "status": "IN_TRANSIT",
  "deliveryType": "EXPRESS",
  "weight": 2.5,
  "codAmount": 100.00,
  "deliveryFee": 50.00,
  "trackingHistory": [
    {
      "status": "PENDING",
      "location": "New York",
      "timestamp": "2024-01-01T00:00:00Z"
    },
    {
      "status": "PICKED_UP",
      "location": "New York Hub",
      "timestamp": "2024-01-01T08:00:00Z"
    }
  ]
}
```

### 15. Get Shipment by AWB (Airway Bill)

```http
GET /api/shipments/track/:awb
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "uuid",
  "awb": "CSE123456789",
  "status": "IN_TRANSIT",
  "currentLocation": {
    "lat": 35.5, "lng": -98.5,
    "city": "Kansas",
    "timestamp": "2024-01-02T14:30:00Z"
  },
  "estimatedDeliveryDate": "2024-01-04T00:00:00Z"
}
```

### 16. Update Shipment

```http
PUT /api/shipments/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "recipientName": "Alice Johnson",
  "specialInstructions": "Leave at door"
}

Response (200):
{
  "message": "Shipment updated successfully"
}
```

### 17. Get Shipments by Status

```http
GET /api/shipments/by-status/PENDING
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [...],
  "total": 25,
  "status": "PENDING"
}
```

### 18. Get Shipment Statistics

```http
GET /api/shipments/statistics
Authorization: Bearer <accessToken>

Response (200):
{
  "total": 150,
  "byStatus": {
    "PENDING": 25,
    "PICKED_UP": 30,
    "IN_TRANSIT": 50,
    "DELIVERED": 40,
    "CANCELLED": 5
  },
  "byDeliveryType": {
    "GROUND": 60,
    "EXPRESS": 70,
    "OVERNIGHT": 20
  },
  "totalRevenue": 7500.00,
  "totalCOD": 2500.00
}
```

### 19. Bulk Upload Shipments

```http
POST /api/shipments/bulk-upload
Authorization: Bearer <merchantToken>
Content-Type: multipart/form-data

[CSV file with columns: recipientName, recipientPhone, address, city, weight, codAmount, etc.]

Response (201):
{
  "uploadId": "uuid",
  "totalShipments": 100,
  "successCount": 98,
  "failureCount": 2,
  "failures": [
    { "row": 5, "error": "Invalid phone number" },
    { "row": 12, "error": "Missing recipient address" }
  ]
}
```

### 20. Cancel Shipment

```http
DELETE /api/shipments/:id
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Shipment cancelled successfully"
}
```

---

## Tracking Endpoints

### 21. Get Real-time Tracking

```http
GET /api/tracking/:awb
Authorization: Bearer <accessToken> (optional for public tracking)

Response (200):
{
  "awb": "CSE123456789",
  "status": "IN_TRANSIT",
  "currentLocation": {
    "lat": 35.5,
    "lng": -98.5,
    "city": "Kansas",
    "timestamp": "2024-01-02T14:30:00Z"
  },
  "lastUpdated": "2024-01-02T14:30:00Z",
  "estimatedDeliveryDate": "2024-01-04T00:00:00Z"
}
```

### 22. Get Detailed Tracking History

```http
GET /api/tracking/detailed/:awb
Authorization: Bearer <accessToken>

Response (200):
{
  "awb": "CSE123456789",
  "trackingHistory": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "status": "PENDING",
      "location": "New York Customer Location",
      "coordinates": { "lat": 40.7128, "lng": -74.0060 },
      "details": "Shipment created"
    },
    {
      "timestamp": "2024-01-01T08:00:00Z",
      "status": "PICKED_UP",
      "location": "New York Hub",
      "coordinates": { "lat": 40.7489, "lng": -73.9680 },
      "details": "Picked up by rider"
    },
    {
      "timestamp": "2024-01-02T14:30:00Z",
      "status": "IN_TRANSIT",
      "location": "Kansas Hub",
      "coordinates": { "lat": 39.0473, "lng": -95.6752 },
      "details": "In transit to destination"
    }
  ],
  "currentStatus": "IN_TRANSIT"
}
```

### 23. Update Tracking Location (Rider)

```http
POST /api/tracking/update
Authorization: Bearer <riderToken>
Content-Type: application/json

{
  "shipmentId": "uuid",
  "latitude": 35.5,
  "longitude": -98.5,
  "city": "Kansas",
  "accuracy": 10
}

Response (200):
{
  "message": "Location updated successfully"
}
```

### WebSocket Tracking Events

```javascript
// Client connection
socket.on('connect', () => {
  socket.emit('track', { awb: 'CSE123456789' });
});

// Listen for updates
socket.on('tracking:update', (data) => {
  console.log('New location:', data);
  // { awb, status, location, timestamp }
});

// Real-time shipper notifications
socket.on('shipment:status-change', (data) => {
  // { shipmentId, previousStatus, newStatus }
});
```

---

## Rider Endpoints

### 24. Get Rider Profile

```http
GET /api/riders/me
Authorization: Bearer <riderToken>

Response (200):
{
  "id": "uuid",
  "userId": "uuid",
  "licensePlate": "ABC123XYZ",
  "vehicleType": "MOTORCYCLE",
  "licenseExpiry": "2025-12-31",
  "deliveriesCount": 156,
  "activeStatus": "ONLINE",
  "currentLocation": {
    "lat": 40.7128,
    "lng": -74.0060,
    "city": "New York",
    "lastUpdated": "2024-01-02T14:30:00Z"
  }
}
```

### 25. Get Assigned Manifests

```http
GET /api/riders/manifests
Authorization: Bearer <riderToken>

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "manifestNumber": "MNF20240101001",
      "shipmentCount": 25,
      "status": "IN_TRANSIT",
      "pickupHub": "New York Hub",
      "assignedTime": "2024-01-02T08:00:00Z"
    }
  ],
  "total": 12
}
```

### 26. Get Manifest Details

```http
GET /api/riders/manifests/:manifestId
Authorization: Bearer <riderToken>

Response (200):
{
  "id": "uuid",
  "manifestNumber": "MNF20240101001",
  "shipments": [
    {
      "id": "uuid",
      "awb": "CSE123456789",
      "recipientName": "Alice Smith",
      "recipientPhone": "+1111111111",
      "destination": "456 Oak Ave, LA",
      "status": "PICKED_UP",
      "codAmount": 100.00,
      "otp": "123456"
    }
  ]
}
```

### 27. Verify Delivery OTP

```http
POST /api/riders/verify-otp
Authorization: Bearer <riderToken>
Content-Type: application/json

{
  "shipmentId": "uuid",
  "otp": "123456"
}

Response (200):
{
  "message": "OTP verified successfully",
  "shipmentStatus": "DELIVERED"
}
```

### 28. Update Rider Location

```http
POST /api/riders/location
Authorization: Bearer <riderToken>
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 5
}

Response (200):
{
  "message": "Location updated successfully"
}
```

### 29. Update Rider Status

```http
PATCH /api/riders/status
Authorization: Bearer <riderToken>
Content-Type: application/json

{
  "status": "OFFLINE"
}

Response (200):
{
  "status": "OFFLINE"
}
```

---

## Hub Endpoints

### 30. Get Hub Manifests

```http
GET /api/hub/manifests?status=CREATED
Authorization: Bearer <hubStaffToken>

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "manifestNumber": "MNF20240101001",
      "createdAt": "2024-01-01T10:00:00Z",
      "shipmentCount": 25,
      "status": "CREATED",
      "createdBy": "Staff Name"
    }
  ],
  "total": 50
}
```

### 31. Create Manifest

```http
POST /api/hub/manifests
Authorization: Bearer <hubStaffToken>
Content-Type: application/json

{
  "shipmentIds": ["uuid1", "uuid2", "uuid3"],
  "riderId": "uuid"
}

Response (201):
{
  "id": "uuid",
  "manifestNumber": "MNF20240101001",
  "status": "CREATED",
  "shipmentCount": 3
}
```

### 32. Inbound Scan

```http
POST /api/hub/inbound-scan
Authorization: Bearer <hubStaffToken>
Content-Type: application/json

{
  "awb": "CSE123456789",
  "manifestNumber": "MNF20240101001"
}

Response (200):
{
  "message": "Inbound scan recorded",
  "shipmentStatus": "PICKED_UP"
}
```

### 33. Outbound Scan

```http
POST /api/hub/outbound-scan
Authorization: Bearer <hubStaffToken>
Content-Type: application/json

{
  "awb": "CSE123456789"
}

Response (200):
{
  "message": "Outbound scan recorded",
  "shipmentStatus": "IN_TRANSIT"
}
```

### 34. Get Hub Details

```http
GET /api/hub/:hubId
Authorization: Bearer <hubStaffToken>

Response (200):
{
  "id": "uuid",
  "name": "New York Hub",
  "city": "New York",
  "address": "789 Hub Street",
  "capacity": 1000,
  "staffCount": 15,
  "status": "ACTIVE",
  "workingHours": "08:00-20:00"
}
```

---

## Payment Endpoints

### 35. Get Payment Transactions

```http
GET /api/payments/transactions?page=1&limit=20
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "shipmentId": "uuid",
      "amount": 150.00,
      "type": "PREPAID",
      "status": "COMPLETED",
      "transactionId": "TXN123456",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 250,
  "page": 1,
  "limit": 20
}
```

### 36. Get Transaction Details

```http
GET /api/payments/transactions/:transactionId
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "uuid",
  "shipmentId": "uuid",
  "awb": "CSE123456789",
  "amount": 150.00,
  "type": "PREPAID",
  "status": "COMPLETED",
  "paymentMethod": "CARD",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 37. Create Payment (Prepaid)

```http
POST /api/payments/create
Authorization: Bearer <customerToken>
Content-Type: application/json

{
  "shipmentId": "uuid",
  "amount": 150.00,
  "paymentMethod": "CARD"
}

Response (201):
{
  "id": "uuid",
  "transactionId": "TXN123456",
  "status": "PENDING",
  "amount": 150.00
}
```

### 38. Confirm COD Payment (Hub)

```http
POST /api/payments/cod/confirm
Authorization: Bearer <hubStaffToken>
Content-Type: application/json

{
  "shipmentId": "uuid",
  "amountCollected": 100.00
}

Response (200):
{
  "message": "COD payment recorded",
  "nextPayoutDate": "2024-01-08T00:00:00Z"
}
```

### 39. Get Payouts (Merchant)

```http
GET /api/payments/payouts?month=2024-01
Authorization: Bearer <merchantToken>

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "period": "2024-01-01 to 2024-01-31",
      "totalRevenue": 5000.00,
      "totalCOD": 2000.00,
      "commission": 500.00,
      "netAmount": 4500.00,
      "status": "PROCESSED",
      "processedDate": "2024-02-01T00:00:00Z"
    }
  ]
}
```

### 40. Request Payout

```http
POST /api/payments/payout/request
Authorization: Bearer <merchantToken>
Content-Type: application/json

{
  "amount": 4500.00,
  "bankAccount": {
    "accountNumber": "123456789",
    "bankCode": "HDFC",
    "ifsc": "HDFC0001234"
  }
}

Response (201):
{
  "id": "uuid",
  "status": "PENDING",
  "amount": 4500.00,
  "requestedDate": "2024-01-02T14:30:00Z"
}
```

---

## Notification Endpoints

### 41. Get My Notifications

```http
GET /api/notifications/my-notifications?page=1&limit=20
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "type": "EMAIL",
      "subject": "Shipment Delivered",
      "message": "Your shipment CSE123456789 has been delivered",
      "status": "SENT",
      "createdAt": "2024-01-02T14:30:00Z"
    }
  ],
  "total": 45,
  "unread": 3
}
```

### 42. Get Unread Count

```http
GET /api/notifications/unread-count
Authorization: Bearer <accessToken>

Response (200):
{
  "unreadCount": 3,
  "lastChecked": "2024-01-02T12:00:00Z"
}
```

### 43. Mark as Read

```http
PATCH /api/notifications/:notificationId/read
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Notification marked as read"
}
```

### 44. Send Notification (Admin)

```http
POST /api/notifications/send
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "userId": "uuid",
  "type": "EMAIL",
  "subject": "System Update",
  "message": "New feature available",
  "recipientType": "USER"
}

Response (201):
{
  "id": "uuid",
  "status": "SENT"
}
```

### WebSocket Notifications

```javascript
socket.on('connect', () => {
  socket.emit('subscribe:notifications');
});

socket.on('notification:new', (data) => {
  // { id, type, subject, message, timestamp }
});
```

---

## Pickup Endpoints

### 45. Request Pickup

```http
POST /api/pickups/request
Authorization: Bearer <customerToken>
Content-Type: application/json

{
  "pickupDate": "2024-01-05",
  "pickupTime": "14:00",
  "address": "123 Main St",
  "city": "New York",
  "coordinates": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "shipmentsCount": 3
}

Response (201):
{
  "id": "uuid",
  "pickupNumber": "PU20240105001",
  "status": "CONFIRMED",
  "assignedRider": "John Rider"
}
```

### 46. Get Pickup Requests

```http
GET /api/pickups?status=CONFIRMED
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "pickupNumber": "PU20240105001",
      "pickupDate": "2024-01-05",
      "status": "CONFIRMED",
      "shipmentsCount": 3
    }
  ]
}
```

---

## SLA Endpoints

### 47. Get SLA Metrics

```http
GET /api/sla/metrics?period=monthly
Authorization: Bearer <accessToken>

Response (200):
{
  "period": "January 2024",
  "totalShipments": 150,
  "onTimeDeliveries": 142,
  "lateDeliveries": 8,
  "slaPercentage": 94.67,
  "averageDeliveryTime": "2.3 days"
}
```

### 48. Get Breach Alerts

```http
GET /api/sla/breaches
Authorization: Bearer <accessToken>

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "shipmentId": "uuid",
      "awb": "CSE123456789",
      "breachType": "DELIVERY_DELAY",
      "severity": "HIGH",
      "detectedAt": "2024-01-03T14:30:00Z"
    }
  ]
}
```

### 49. Get SLA for Shipment

```http
GET /api/sla/shipment/:shipmentId
Authorization: Bearer <accessToken>

Response (200):
{
  "shipmentId": "uuid",
  "awb": "CSE123456789",
  "slaDeadline": "2024-01-04T00:00:00Z",
  "estimatedDelivery": "2024-01-03T18:00:00Z",
  "status": "ON_TRACK",
  "timeRemaining": "2 days 3 hours"
}
```

---

## Audit Endpoints

### 50. Get Audit Logs

```http
GET /api/audit/logs?userId=uuid&action=LOGIN
Authorization: Bearer <adminToken>

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "action": "LOGIN",
      "resourceType": "USER",
      "resourceId": "uuid",
      "changes": { "status": "active" },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-01-02T14:30:00Z"
    }
  ],
  "total": 500
}
```

### 51. Get User Activity

```http
GET /api/audit/user/:userId
Authorization: Bearer <adminToken>

Response (200):
{
  "userId": "uuid",
  "userName": "John Doe",
  "activityCount": 125,
  "lastActivity": "2024-01-02T14:30:00Z",
  "actions": ["LOGIN", "CREATE_SHIPMENT", "CANCEL_SHIPMENT"]
}
```

---

## Error Responses

All endpoints return standard error format:

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-01-02T14:30:00Z"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (validation failed)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Public endpoints**: 100 requests/hour
- **Authenticated endpoints**: 1000 requests/hour
- **Admin endpoints**: 5000 requests/hour

Rate limit headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704196200
```

---

## Pagination

List endpoints support pagination:

Query Parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field (e.g., `createdAt`)
- `order` - ASC or DESC (default: DESC)

Response format:

```json
{
  "data": [...],
  "total": 250,
  "page": 1,
  "limit": 20,
  "totalPages": 13
}
```

---

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get shipments (with token)
curl -X GET http://localhost:3001/api/shipments \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create shipment
curl -X POST http://localhost:3001/api/shipments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...shipment data...}'
```

---

## Swagger Documentation

Interactive API documentation available at:

- Development: `http://localhost:3001/api/docs`
- Production: `https://api.courier-service.com/api/docs`
