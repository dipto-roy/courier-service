# Rider Module - Backend Integration Guide

## ✅ Status: Ready for Testing

The frontend Rider Module has been updated to match the backend API endpoints exactly. All services, types, and hooks are now aligned with the backend implementation.

---

## 📋 Backend API Endpoints

### Base URL

```
http://localhost:3001/api
```

### Authentication

All rider endpoints require:

- **Bearer Token**: JWT token from login
- **Role**: `RIDER` role required
- **Header**: `Authorization: Bearer <your_jwt_token>`

---

## 🔌 Available Endpoints

### 1. Get Assigned Manifests

```http
GET /rider/manifests?status={status}
```

**Query Parameters:**

- `status` (optional): Filter by manifest status

**Response:**

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
      "shipments": [...]
    }
  ]
}
```

---

### 2. Get Assigned Shipments

```http
GET /rider/shipments?status={status}
```

**Query Parameters:**

- `status` (optional): Filter by shipment status

**Response:**

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
      "otpCode": "123456"
    }
  ]
}
```

---

### 3. Get Shipment Details

```http
GET /rider/shipments/:awb
```

**Path Parameters:**

- `awb`: Shipment AWB number (e.g., `FX20250128000001`)

**Response:**

```json
{
  "success": true,
  "shipment": {
    "id": "uuid",
    "awb": "FX20250128000001",
    "status": "OUT_FOR_DELIVERY",
    "receiverName": "John Doe",
    "receiverPhone": "01712345678",
    "receiverAddress": "123 Main St, Gulshan, Dhaka",
    "codAmount": 1500,
    "otpCode": "123456"
  }
}
```

---

### 4. Generate OTP

```http
POST /rider/generate-otp
```

**Request Body:**

```json
{
  "awbNumber": "FX20250128000001"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP generated and sent to customer",
  "awb": "FX20250128000001",
  "otpGenerated": true
}
```

---

### 5. Complete Delivery

```http
POST /rider/complete-delivery
```

**Request Body:**

```json
{
  "awbNumber": "FX20250128000001",
  "otpCode": "123456",
  "signatureUrl": "https://storage.example.com/signatures/abc123.jpg",
  "podPhotoUrl": "https://storage.example.com/pod/xyz789.jpg",
  "codAmountCollected": 1500,
  "deliveryNote": "Delivered to customer",
  "latitude": 23.8103,
  "longitude": 90.4125
}
```

**Response:**

```json
{
  "success": true,
  "message": "Delivery completed successfully",
  "awb": "FX20250128000001",
  "deliveredAt": "2025-01-28T14:30:00Z",
  "codCollected": 1500
}
```

---

### 6. Record Failed Delivery

```http
POST /rider/failed-delivery
```

**Request Body:**

```json
{
  "awbNumber": "FX20250128000001",
  "reason": "CUSTOMER_NOT_AVAILABLE",
  "notes": "Called customer multiple times, no response",
  "photoUrl": "https://storage.example.com/failed/abc123.jpg",
  "latitude": 23.8103,
  "longitude": 90.4125
}
```

**Failed Delivery Reasons Enum:**

- `CUSTOMER_NOT_AVAILABLE`
- `CUSTOMER_REFUSED`
- `INCORRECT_ADDRESS`
- `CUSTOMER_REQUESTED_RESCHEDULE`
- `PAYMENT_ISSUE`
- `UNREACHABLE_LOCATION`
- `BUSINESS_CLOSED`
- `OTHER`

**Response:**

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

### 7. Mark RTO

```http
POST /rider/mark-rto
```

**Request Body:**

```json
{
  "awbNumber": "FX20250128000001",
  "reason": "CUSTOMER_REFUSED",
  "notes": "Customer refused to accept the package"
}
```

**Response:**

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

### 8. Update Location

```http
POST /rider/update-location
```

**Request Body:**

```json
{
  "latitude": 23.8103,
  "longitude": 90.4125,
  "accuracy": 10.5,
  "speed": 15.2,
  "heading": 270,
  "batteryLevel": 85,
  "shipmentAwb": "FX20250128000001",
  "isOnline": true
}
```

**Response:**

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

---

### 9. Get Location History

```http
GET /rider/location-history?limit={limit}
```

**Query Parameters:**

- `limit` (optional): Number of records to return (default: 50)

**Response:**

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
      "heading": 270,
      "batteryLevel": 85,
      "isOnline": true,
      "timestamp": "2025-01-28T14:30:00Z"
    }
  ]
}
```

---

### 10. Get Statistics

```http
GET /rider/statistics
```

**Response:**

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

## 🔄 Frontend Changes Made

### 1. Service Layer Updates (`rider.service.ts`)

- ✅ Changed from `shipmentId` to `awbNumber` parameter
- ✅ Updated all endpoints to match backend routes
- ✅ Added new methods: `getShipments()`, `getShipmentByAwb()`, `markRTO()`, `getLocationHistory()`, `getStatistics()`
- ✅ Removed deprecated methods: `getDailyStats()`, `getEarnings()`, `startManifest()`, `completeManifest()`

### 2. Type Updates (`types.ts`)

- ✅ Added backend-matching DTOs: `GenerateOTP`, `CompleteDelivery`, `FailedDelivery`
- ✅ Added `FailedDeliveryReason` enum with all 8 backend reasons
- ✅ Updated `LocationUpdate` schema to include `shipmentAwb` and `isOnline`
- ✅ Aligned field names: `otpCode`, `podPhotoUrl`, `deliveryNote`, etc.

### 3. Hook Updates (`useManifests.ts`, `useDeliveryActions.ts`)

- ✅ Added `useShipments()` and `useShipment(awb)` hooks
- ✅ Added `useLocationHistory()` hook
- ✅ Updated `useRiderStats()` to `useRiderStats()` (no parameters)
- ✅ Updated `useGenerateOTP()` to accept `awbNumber` string
- ✅ Updated `useCompleteDelivery()` to accept complete DTO
- ✅ Updated `useFailDelivery()` to accept complete DTO
- ✅ Added `useMarkRTO()` hook

### 4. Query Key Updates (`queryClient.ts`)

- ✅ Added `shipments(status?)` key
- ✅ Added `shipment(awb)` key
- ✅ Added `statistics()` key
- ✅ Added `locationHistory(limit?)` key
- ✅ Removed deprecated keys: `deliveries`, `stats`, `earnings`

---

## 🧪 Testing Checklist

### Phase 1: Authentication

- [ ] Test login with rider credentials
- [ ] Verify JWT token is stored in localStorage
- [ ] Test protected route access
- [ ] Test token refresh on 401 error
- [ ] Test logout and token cleanup

### Phase 2: Manifests & Shipments

- [ ] Test `GET /rider/manifests` - list all manifests
- [ ] Test `GET /rider/shipments` - list all shipments
- [ ] Test `GET /rider/shipments/:awb` - get shipment details
- [ ] Verify data displays correctly in UI components
- [ ] Test loading and error states

### Phase 3: OTP & Delivery Completion

- [ ] Test `POST /rider/generate-otp` - generate OTP
- [ ] Verify OTP displays in UI
- [ ] Test `POST /rider/complete-delivery` - complete with OTP
- [ ] Test with invalid OTP (should fail)
- [ ] Test COD collection during completion
- [ ] Test with/without proof upload
- [ ] Verify query invalidation (data refreshes)

### Phase 4: Failed Delivery

- [ ] Test `POST /rider/failed-delivery` - mark as failed
- [ ] Test all 8 failure reason enum values
- [ ] Test with optional notes and photo
- [ ] Verify 3-attempt auto-RTO logic (backend behavior)
- [ ] Test query invalidation

### Phase 5: RTO

- [ ] Test `POST /rider/mark-rto` - mark for RTO
- [ ] Verify status change to RTO_INITIATED
- [ ] Test with different failure reasons

### Phase 6: GPS Tracking

- [ ] Test `POST /rider/update-location` - send location
- [ ] Test LocationTracker component auto-update (30s interval)
- [ ] Test battery level monitoring
- [ ] Test permission handling (granted/denied/prompt)
- [ ] Test `GET /rider/location-history` - view history
- [ ] Test with different limit parameters

### Phase 7: Statistics

- [ ] Test `GET /rider/statistics` - get performance stats
- [ ] Verify RiderDashboard displays stats correctly
- [ ] Test auto-refresh every 5 minutes
- [ ] Verify calculations (success rate, on-time rate)

### Phase 8: Integration Tests

- [ ] Test complete delivery workflow end-to-end
- [ ] Test failed delivery workflow
- [ ] Test GPS tracking while delivering
- [ ] Test offline handling (location queue)
- [ ] Test error handling for all endpoints
- [ ] Test concurrent operations

---

## 🚀 Quick Start Testing

### 1. Start Backend

```bash
cd backend
npm run start:dev
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Login as Rider

1. Navigate to `http://localhost:3000/login`
2. Use rider credentials from backend
3. Should redirect to `/rider` dashboard

### 4. Test Basic Flow

1. **View Shipments**: Should load from `/rider/shipments`
2. **Generate OTP**: Click generate on a shipment
3. **Complete Delivery**: Enter OTP and complete
4. **GPS Tracking**: Start location tracking
5. **View Stats**: Check dashboard updates

---

## 🐛 Common Issues & Solutions

### Issue 1: 401 Unauthorized

**Cause**: No JWT token or expired token  
**Solution**: Login again or check token refresh logic

### Issue 2: 403 Forbidden

**Cause**: User doesn't have RIDER role  
**Solution**: Ensure logged-in user has `role: 'rider'`

### Issue 3: OTP Mismatch

**Cause**: Backend generates new OTP, frontend uses old one  
**Solution**: Always generate fresh OTP before completion

### Issue 4: GPS Permission Denied

**Cause**: Browser location permission not granted  
**Solution**: Click "Allow" when prompted or enable in browser settings

### Issue 5: Query Not Updating

**Cause**: Query invalidation not working  
**Solution**: Check queryKeys match exactly between hooks

---

## 📊 Expected API Response Times

| Endpoint                      | Expected Time | Notes                     |
| ----------------------------- | ------------- | ------------------------- |
| GET /rider/manifests          | < 200ms       | Depends on manifest count |
| GET /rider/shipments          | < 200ms       | Depends on shipment count |
| GET /rider/shipments/:awb     | < 100ms       | Single record lookup      |
| POST /rider/generate-otp      | < 500ms       | SMS sending included      |
| POST /rider/complete-delivery | < 300ms       | Updates + notifications   |
| POST /rider/failed-delivery   | < 300ms       | Updates + notifications   |
| POST /rider/update-location   | < 100ms       | Simple insert             |
| GET /rider/location-history   | < 200ms       | Depends on limit          |
| GET /rider/statistics         | < 300ms       | Multiple aggregations     |

---

## 🎯 Next Steps After Testing

1. **If Tests Pass:**

   - Move to Phase 6: Hub Operations Module
   - Document any issues found
   - Create user acceptance test plan

2. **If Tests Fail:**

   - Document exact error messages
   - Check network tab for API responses
   - Verify backend logs
   - Fix issues and retest

3. **Performance Optimization:**
   - Implement request debouncing
   - Add optimistic updates
   - Implement offline queue
   - Add error retry logic

---

## 📞 Support

**Backend API Documentation**: `/backend/API_DOCUMENTATION.md`  
**Frontend Integration Guide**: `/backend/FRONTEND_INTEGRATION_GUIDE.md`  
**Postman Collection**: Available in backend folder

---

**Last Updated**: January 2025  
**Status**: ✅ Ready for Integration Testing
