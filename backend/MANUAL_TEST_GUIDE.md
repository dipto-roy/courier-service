# 🧪 Complete Manual Testing Guide - FastX Courier System

**Generated:** 2025-10-30  
**Purpose:** বাংলা-তে manual testing guide সব features verify করার জন্য  
**Database:** courier_service (PostgreSQL)  
**Server:** http://localhost:3001

---

## 📋 Table of Contents
1. [Pre-Testing Setup](#pre-testing-setup)
2. [Test Scenario 1: Basic User Flow](#test-scenario-1-basic-user-flow)
3. [Test Scenario 2: GPS Tracking](#test-scenario-2-gps-tracking)
4. [Test Scenario 3: Shipment Lifecycle](#test-scenario-3-shipment-lifecycle)
5. [Test Scenario 4: WebSocket Real-time](#test-scenario-4-websocket-real-time)
6. [Test Scenario 5: COD & Wallet](#test-scenario-5-cod--wallet)
7. [Verification Queries](#verification-queries)

---

## 🔧 Pre-Testing Setup

### 1. Server শুরু করুন
```bash
cd /home/dip-roy/courier-service
npm run start:dev
```

### 2. Database Check করুন
```bash
psql -U postgres -d courier_service -c "SELECT version();"
psql -U postgres -d courier_service -c "SELECT COUNT(*) FROM users;"
psql -U postgres -d courier_service -c "SELECT COUNT(*) FROM rider_locations;"
```

### 3. Environment Variables Check
```bash
cat .env | grep -E "(DATABASE|JWT|PORT)"
```

Expected Output:
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/courier_service`
- `JWT_SECRET=...`
- `PORT=3001`

---

## 🎯 Test Scenario 1: Basic User Flow

### **Test 1.1: Create Merchant Account**

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Electronics Store",
    "email": "abc.electronics@test.com",
    "phone": "01712345001",
    "password": "SecurePass123!",
    "role": "merchant",
    "city": "Dhaka",
    "area": "Gulshan",
    "address": "ABC Warehouse, Plot 15, Block G, Gulshan-1"
  }'
```

✅ **Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "ABC Electronics Store",
      "email": "abc.electronics@test.com",
      "phone": "01712345001",
      "role": "merchant"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**📝 Notes:**
- Token save করুন (পরে লাগবে)
- User ID note করুন

---

### **Test 1.2: Create Customer Account**

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Customer",
    "email": "john.customer@test.com",
    "phone": "01556789001",
    "password": "SecurePass123!",
    "role": "customer",
    "city": "Dhaka",
    "area": "Dhanmondi",
    "address": "House 10, Road 5, Dhanmondi-3"
  }'
```

---

### **Test 1.3: Create Rider Account**

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Rider",
    "email": "ahmed.rider@test.com",
    "phone": "01334567001",
    "password": "SecurePass123!",
    "role": "rider",
    "city": "Dhaka",
    "area": "Gulshan",
    "address": "Rider Base, Gulshan-2"
  }'
```

**🔑 Save Rider Token!** - GPS tracking এ লাগবে

---

### **Test 1.4: Login Merchant**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "abc.electronics@test.com",
    "password": "SecurePass123!"
  }'
```

✅ **Expected:** JWT Token পাবেন

⚠️ **If OTP Required:**
```bash
# Check database for OTP code
psql -U postgres -d courier_service -c "SELECT otp, otp_expires_at FROM users WHERE email='abc.electronics@test.com';"

# Then login with OTP
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "abc.electronics@test.com",
    "otp": "123456"
  }'
```

---

### **Test 1.5: Get User Profile**

```bash
# Replace YOUR_TOKEN with actual token from login
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ **Expected:** User details with role and permissions

---

## 📍 Test Scenario 2: GPS Tracking

**এই section এ আপনার actual coordinates (23.7808875, 90.4161712) test করবো**

### **Test 2.1: Update Rider Location (Your Test Coordinates)**

```bash
# Use Rider Token from Test 1.3
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 23.7808875,
    "longitude": 90.4161712,
    "accuracy": 8.5,
    "speed": 25,
    "heading": 180,
    "battery": 85
  }'
```

✅ **Expected Response:**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "id": "...",
    "latitude": "23.7808875",
    "longitude": "90.4161712",
    "accuracy": 8.5,
    "speed": 25,
    "heading": 180,
    "battery": 85,
    "timestamp": "2025-10-30T..."
  }
}
```

---

### **Test 2.2: Database Verification - Check GPS Precision**

```bash
psql -U postgres -d courier_service -c "
  SELECT 
    id,
    rider_id,
    latitude,
    longitude,
    latitude::text AS lat_text,
    longitude::text AS lon_text,
    created_at
  FROM rider_locations 
  WHERE latitude = 23.7808875 
    AND longitude = 90.4161712
  ORDER BY created_at DESC 
  LIMIT 1;
"
```

✅ **Expected:**
- `latitude`: 23.7808875 (exact match)
- `longitude`: 90.4161712 (exact match)
- Precision: ±1.1 cm (7 decimal places)

---

### **Test 2.3: Update Multiple GPS Points (Simulating Movement)**

```bash
# Point 1: Gulshan Hub
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 23.8103590,
    "longitude": 90.4125330,
    "accuracy": 10,
    "speed": 0,
    "heading": 0,
    "battery": 90
  }'

sleep 5

# Point 2: Your Test Location (In Transit)
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 23.7808875,
    "longitude": 90.4161712,
    "accuracy": 8,
    "speed": 25,
    "heading": 180,
    "battery": 85
  }'

sleep 5

# Point 3: Banani
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 23.8068160,
    "longitude": 90.3688270,
    "accuracy": 9,
    "speed": 20,
    "heading": 270,
    "battery": 80
  }'

sleep 5

# Point 4: Dhanmondi (Destination)
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 23.7449160,
    "longitude": 90.3575580,
    "accuracy": 7,
    "speed": 0,
    "heading": 0,
    "battery": 78
  }'
```

---

### **Test 2.4: Get Rider Location History**

```bash
curl -X GET "http://localhost:3001/api/rider/location-history?hours=24" \
  -H "Authorization: Bearer RIDER_TOKEN"
```

✅ **Expected:** Array of all GPS points with timestamps

---

### **Test 2.5: Distance Calculation Verification**

```bash
psql -U postgres -d courier_service << 'EOF'
-- Calculate distance from your test location to Gulshan Hub
WITH test_location AS (
  SELECT 23.7808875 AS lat1, 90.4161712 AS lon1
),
gulshan_hub AS (
  SELECT 23.8103590 AS lat2, 90.4125330 AS lon2
)
SELECT 
  ROUND(
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * 
      cos(radians(lon2) - radians(lon1)) + 
      sin(radians(lat1)) * sin(radians(lat2))
    )::numeric, 
    2
  ) AS distance_km
FROM test_location, gulshan_hub;
EOF
```

✅ **Expected:** Approximately 3.30 km

---

## 📦 Test Scenario 3: Shipment Lifecycle

### **Test 3.1: Create Shipment (Merchant)**

```bash
curl -X POST http://localhost:3001/api/shipments \
  -H "Authorization: Bearer MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "senderName": "ABC Electronics",
    "senderPhone": "01712345001",
    "senderAddress": "ABC Warehouse, Gulshan-1",
    "senderCity": "Dhaka",
    "senderArea": "Gulshan",
    
    "recipientName": "John Customer",
    "recipientPhone": "01556789001",
    "recipientAddress": "House 10, Road 5, Dhanmondi-3",
    "recipientCity": "Dhaka",
    "recipientArea": "Dhanmondi",
    
    "weight": 2.5,
    "codAmount": 35000,
    "productDescription": "Samsung Galaxy S24 - Mobile Phone",
    "deliveryType": "express",
    "packageValue": 85000,
    "notes": "Handle with care - fragile electronics"
  }'
```

✅ **Expected:**
```json
{
  "success": true,
  "data": {
    "awb": "FX20251030000001",
    "status": "PENDING_PICKUP",
    "estimatedDeliveryDate": "2025-11-01T...",
    "deliveryCharge": 150
  }
}
```

**📝 Save AWB Number!** - Tracking এ লাগবে

---

### **Test 3.2: Public Tracking (No Auth Required)**

```bash
curl -X GET http://localhost:3001/api/tracking/public/FX20251030000001
```

✅ **Expected:**
- Shipment details
- Current status
- Status history
- Estimated delivery date

---

### **Test 3.3: Get Merchant's Shipments**

```bash
curl -X GET http://localhost:3001/api/shipments \
  -H "Authorization: Bearer MERCHANT_TOKEN"
```

✅ **Expected:** Array of all shipments created by merchant

---

### **Test 3.4: Create Bulk Shipments**

```bash
curl -X POST http://localhost:3001/api/shipments/bulk \
  -H "Authorization: Bearer MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shipments": [
      {
        "senderName": "ABC Electronics",
        "senderPhone": "01712345001",
        "senderAddress": "ABC Warehouse, Gulshan-1",
        "recipientName": "Customer 1",
        "recipientPhone": "01556789002",
        "recipientAddress": "Address 1, Dhanmondi",
        "recipientCity": "Dhaka",
        "recipientArea": "Dhanmondi",
        "weight": 1.0,
        "codAmount": 1500,
        "productDescription": "Product 1"
      },
      {
        "senderName": "ABC Electronics",
        "senderPhone": "01712345001",
        "senderAddress": "ABC Warehouse, Gulshan-1",
        "recipientName": "Customer 2",
        "recipientPhone": "01556789003",
        "recipientAddress": "Address 2, Banani",
        "recipientCity": "Dhaka",
        "recipientArea": "Banani",
        "weight": 0.8,
        "codAmount": 2200,
        "productDescription": "Product 2"
      },
      {
        "senderName": "ABC Electronics",
        "senderPhone": "01712345001",
        "senderAddress": "ABC Warehouse, Gulshan-1",
        "recipientName": "Customer 3",
        "recipientPhone": "01556789004",
        "recipientAddress": "Address 3, Mirpur",
        "recipientCity": "Dhaka",
        "recipientArea": "Mirpur",
        "weight": 1.2,
        "codAmount": 3500,
        "productDescription": "Product 3"
      }
    ]
  }'
```

✅ **Expected:** 3 shipments created with unique AWB numbers

---

## 🔌 Test Scenario 4: WebSocket Real-time

### **Test 4.1: Check Gateway Status**

```bash
curl -X GET http://localhost:3001/api/tracking/gateway-status
```

✅ **Expected:**
```json
{
  "status": "operational",
  "namespace": "/tracking",
  "connectedClients": 0,
  "activeSubscriptions": 0,
  "uptime": "...",
  "events": ["subscribe-tracking", "location-update", "status-update", "test-event"]
}
```

---

### **Test 4.2: WebSocket Connection Test (Using Node.js)**

Create file: `test-websocket.js`

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3001/tracking', {
  transports: ['websocket'],
  reconnection: true
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket');
  console.log('Socket ID:', socket.id);
  
  // Subscribe to shipment tracking
  socket.emit('subscribe-tracking', {
    awb: 'FX20251030000001'
  });
  
  console.log('📡 Subscribed to AWB: FX20251030000001');
});

socket.on('location-update', (data) => {
  console.log('📍 Location Update:', data);
  console.log(`   Latitude: ${data.location.latitude}`);
  console.log(`   Longitude: ${data.location.longitude}`);
  console.log(`   Speed: ${data.location.speed} km/h`);
  console.log(`   ETA: ${data.eta}`);
});

socket.on('status-update', (data) => {
  console.log('📦 Status Update:', data);
  console.log(`   AWB: ${data.awb}`);
  console.log(`   Status: ${data.status}`);
});

socket.on('eta-update', (data) => {
  console.log('⏰ ETA Update:', data);
  console.log(`   Old ETA: ${data.oldEta}`);
  console.log(`   New ETA: ${data.newEta}`);
  console.log(`   Reason: ${data.reason}`);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket');
});

socket.on('connect_error', (error) => {
  console.error('Connection Error:', error.message);
});

// Keep running for 5 minutes
setTimeout(() => {
  socket.disconnect();
  process.exit(0);
}, 300000);
```

**Run:**
```bash
node test-websocket.js
```

✅ **Expected:** Real-time updates as rider moves

---

## 💰 Test Scenario 5: COD & Wallet

### **Test 5.1: Check Merchant Wallet**

```bash
curl -X GET http://localhost:3001/api/payments/wallet \
  -H "Authorization: Bearer MERCHANT_TOKEN"
```

✅ **Expected:**
```json
{
  "success": true,
  "data": {
    "balance": 0,
    "pendingCOD": 35000,
    "totalCollected": 35000,
    "totalSettled": 0,
    "currency": "BDT"
  }
}
```

---

### **Test 5.2: Request Payout**

```bash
curl -X POST http://localhost:3001/api/payments/request-payout \
  -H "Authorization: Bearer MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "bankDetails": {
      "accountName": "ABC Electronics Ltd",
      "accountNumber": "1234567890",
      "bankName": "Standard Bank",
      "branchName": "Gulshan Branch",
      "routingNumber": "123456789"
    }
  }'
```

✅ **Expected:** Payout request created (Finance will approve)

---

## 🔍 Verification Queries

### **Query 1: Check All Users Created**

```bash
psql -U postgres -d courier_service -c "
  SELECT 
    id,
    name,
    email,
    phone,
    role,
    is_verified,
    created_at
  FROM users 
  ORDER BY created_at DESC 
  LIMIT 10;
"
```

---

### **Query 2: Check GPS Tracking Data**

```bash
psql -U postgres -d courier_service -c "
  SELECT 
    rl.id,
    u.name AS rider_name,
    rl.latitude,
    rl.longitude,
    rl.speed,
    rl.heading,
    rl.battery,
    rl.created_at
  FROM rider_locations rl
  JOIN users u ON u.id = rl.rider_id
  ORDER BY rl.created_at DESC
  LIMIT 10;
"
```

---

### **Query 3: Check Shipments with Status**

```bash
psql -U postgres -d courier_service -c "
  SELECT 
    awb,
    status,
    recipient_name,
    recipient_area,
    cod_amount,
    delivery_type,
    created_at
  FROM shipments
  ORDER BY created_at DESC
  LIMIT 10;
"
```

---

### **Query 4: GPS Precision Test**

```bash
psql -U postgres -d courier_service -c "
  SELECT 
    pg_typeof(latitude) AS latitude_type,
    pg_typeof(longitude) AS longitude_type,
    latitude,
    longitude,
    latitude::text AS lat_text,
    longitude::text AS lon_text
  FROM rider_locations 
  WHERE latitude = 23.7808875 
    AND longitude = 90.4161712
  LIMIT 1;
"
```

✅ **Expected:**
- `latitude_type`: numeric
- `longitude_type`: numeric
- Exact match: 23.7808875, 90.4161712

---

### **Query 5: Calculate Distance Between All Points**

```bash
psql -U postgres -d courier_service << 'EOF'
WITH locations AS (
  SELECT 
    id,
    latitude,
    longitude,
    created_at,
    LAG(latitude) OVER (ORDER BY created_at) AS prev_lat,
    LAG(longitude) OVER (ORDER BY created_at) AS prev_lon
  FROM rider_locations
  ORDER BY created_at
)
SELECT 
  id,
  latitude,
  longitude,
  prev_lat,
  prev_lon,
  CASE 
    WHEN prev_lat IS NOT NULL THEN
      ROUND(
        6371 * acos(
          cos(radians(prev_lat)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(prev_lon)) + 
          sin(radians(prev_lat)) * sin(radians(latitude))
        )::numeric, 
        2
      )
    ELSE NULL
  END AS distance_km,
  created_at
FROM locations
WHERE prev_lat IS NOT NULL;
EOF
```

---

## ✅ Success Criteria

### **GPS Tracking:**
- [x] Coordinates 23.7808875, 90.4161712 stored correctly
- [x] DECIMAL(10,7) precision maintained (±1.1 cm)
- [x] Distance calculations accurate
- [x] Real-time updates working

### **WebSocket:**
- [x] Connection successful
- [x] Subscribe to tracking working
- [x] Real-time location updates received
- [x] Status updates received

### **Shipment Flow:**
- [x] Create shipment successful
- [x] Public tracking working
- [x] Status updates working
- [x] Bulk upload working

### **Authentication:**
- [x] Signup for all roles working
- [x] Login with JWT working
- [x] OTP verification (if enabled)
- [x] Role-based access working

---

## 🎯 Performance Benchmarks

### **GPS Update Frequency:**
- Target: Every 10-30 seconds
- Accuracy: ±5-10 meters
- Database write: <50ms

### **WebSocket Latency:**
- Connection: <100ms
- Event broadcast: <50ms
- Client update: <200ms total

### **API Response Times:**
- GET requests: <200ms
- POST requests: <500ms
- Bulk operations: <2s

---

## 🐛 Troubleshooting

### **Issue 1: OTP Required**

```bash
# Disable OTP for testing (in code)
# Or manually verify:
psql -U postgres -d courier_service -c "
  UPDATE users 
  SET is_verified = true 
  WHERE email = 'abc.electronics@test.com';
"
```

---

### **Issue 2: WebSocket Not Connecting**

```bash
# Check if server running
curl http://localhost:3001/api/tracking/gateway-status

# Check Socket.IO logs
npm run start:dev | grep -i socket
```

---

### **Issue 3: GPS Not Updating**

```bash
# Check rider_locations table
psql -U postgres -d courier_service -c "SELECT COUNT(*) FROM rider_locations;"

# Check rider authentication
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer RIDER_TOKEN"
```

---

## 📊 Test Results Summary

**Create this after testing:**

```markdown
## Test Execution Results

- **Date:** 2025-10-30
- **Tester:** Dipto Roy
- **Environment:** Development (localhost:3001)

### Results:

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Create Merchant | ✅ PASS | Token: xyz... |
| 1.2 | Create Customer | ✅ PASS | - |
| 1.3 | Create Rider | ✅ PASS | - |
| 1.4 | Login Merchant | ⚠️ OTP | OTP verification required |
| 2.1 | GPS Update (23.7808875, 90.4161712) | ✅ PASS | Precision: ±1.1 cm |
| 2.3 | GPS Movement Simulation | ✅ PASS | 4 points tracked |
| 2.5 | Distance Calculation | ✅ PASS | 3.30 km verified |
| 3.1 | Create Shipment | ✅ PASS | AWB: FX20251030000001 |
| 4.1 | Gateway Status | ✅ PASS | Operational |
| 4.2 | WebSocket Connection | ✅ PASS | Real-time updates working |
| 5.1 | Merchant Wallet | ✅ PASS | Balance: 0, Pending: 35000 |

### Overall Status: ✅ ALL CORE FEATURES WORKING
```

---

**এই guide follow করলে সব features manually verify করতে পারবেন!** 🚀
