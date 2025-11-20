# 🎯 GPS Tracking - Quick Test Commands

**Quick reference for testing the GPS tracking system**

---

## 🔑 Step 1: Authentication

### Create Rider Account
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Rider",
    "email": "test.rider@example.com",
    "phone": "+8801712345678",
    "password": "SecurePass123!",
    "role": "rider",
    "city": "Dhaka",
    "area": "Gulshan",
    "address": "House 10, Road 12, Gulshan-1"
  }'
```

### Get OTP from Database
```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d courier_service \
  -c "SELECT email, otp_code FROM users WHERE email = 'test.rider@example.com';"
```

### Verify Account
```bash
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.rider@example.com",
    "otpCode": "YOUR_OTP_HERE"
  }'
```

### Login and Get Token
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.rider@example.com",
    "password": "SecurePass123!"
  }' | python3 -m json.tool
```

**Save the `accessToken` for next steps!**

---

## 📍 Step 2: Update GPS Location

### Basic Location Update
```bash
TOKEN="YOUR_ACCESS_TOKEN_HERE"

curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 23.7808875,
    "longitude": 90.4161712,
    "accuracy": 10,
    "speed": 25,
    "heading": 180,
    "batteryLevel": 85,
    "isOnline": true
  }' | python3 -m json.tool
```

### Update with Shipment Link
```bash
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 23.810359,
    "longitude": 90.412533,
    "accuracy": 8,
    "speed": 30,
    "isOnline": true,
    "shipmentAwb": "FX20251101644982"
  }' | python3 -m json.tool
```

---

## 📜 Step 3: Get Location History

```bash
curl -X GET "http://localhost:3001/api/rider/location-history?limit=10" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 🗺️ Test Locations (Dhaka)

Copy-paste ready coordinates:

### Gulshan
```json
{
  "latitude": 23.810359,
  "longitude": 90.412533,
  "accuracy": 8,
  "speed": 30,
  "heading": 90,
  "batteryLevel": 85
}
```

### Dhanmondi
```json
{
  "latitude": 23.744916,
  "longitude": 90.357558,
  "accuracy": 12,
  "speed": 25,
  "heading": 180,
  "batteryLevel": 82
}
```

### Banani
```json
{
  "latitude": 23.806816,
  "longitude": 90.368827,
  "accuracy": 10,
  "speed": 35,
  "heading": 270,
  "batteryLevel": 80
}
```

### Mirpur
```json
{
  "latitude": 23.814156,
  "longitude": 90.346922,
  "accuracy": 15,
  "speed": 20,
  "heading": 45,
  "batteryLevel": 78
}
```

### Uttara
```json
{
  "latitude": 23.879542,
  "longitude": 90.391841,
  "accuracy": 8,
  "speed": 40,
  "heading": 135,
  "batteryLevel": 75
}
```

---

## 🔍 Database Verification

### Check Latest Locations
```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d courier_service \
  -c "SELECT latitude, longitude, accuracy, speed, created_at FROM rider_locations ORDER BY created_at DESC LIMIT 5;"
```

### Check Precision
```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d courier_service \
  -c "SELECT latitude, longitude FROM rider_locations WHERE latitude = 23.7808875;"
```

### Check Shipment Links
```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d courier_service \
  -c "SELECT latitude, longitude, shipment_id, created_at FROM rider_locations WHERE shipment_id IS NOT NULL;"
```

---

## 🧪 Complete Test Sequence

Run all at once (replace TOKEN):

```bash
#!/bin/bash
TOKEN="YOUR_ACCESS_TOKEN_HERE"

echo "=== Test 1: Gulshan ==="
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":23.810359,"longitude":90.412533,"accuracy":8,"speed":30,"heading":90,"batteryLevel":85}' \
  -s | python3 -m json.tool

sleep 2

echo -e "\n=== Test 2: Banani ==="
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":23.806816,"longitude":90.368827,"accuracy":10,"speed":35,"heading":270,"batteryLevel":82}' \
  -s | python3 -m json.tool

sleep 2

echo -e "\n=== Test 3: Dhanmondi ==="
curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":23.744916,"longitude":90.357558,"accuracy":12,"speed":25,"heading":180,"batteryLevel":80}' \
  -s | python3 -m json.tool

sleep 2

echo -e "\n=== Get Location History ==="
curl -X GET "http://localhost:3001/api/rider/location-history?limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -s | python3 -m json.tool
```

Save as `test-gps.sh`, make executable with `chmod +x test-gps.sh`, then run: `./test-gps.sh`

---

## ⚡ Quick Verification

Check if everything works:

```bash
# 1. Server running?
curl -s http://localhost:3001/api/health || echo "Server not running"

# 2. Database accessible?
PGPASSWORD=postgres psql -h localhost -U postgres -d courier_service -c "SELECT COUNT(*) FROM rider_locations;"

# 3. Recent locations?
PGPASSWORD=postgres psql -h localhost -U postgres -d courier_service -c "SELECT COUNT(*) FROM rider_locations WHERE created_at > NOW() - INTERVAL '1 hour';"
```

---

## 📊 Performance Test

Test response times:

```bash
TOKEN="YOUR_ACCESS_TOKEN_HERE"

echo "Testing location update speed..."
time curl -X POST http://localhost:3001/api/rider/update-location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":23.7808875,"longitude":90.4161712,"accuracy":10,"speed":25}' \
  -s -o /dev/null

echo "Testing history retrieval speed..."
time curl -X GET "http://localhost:3001/api/rider/location-history?limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -s -o /dev/null
```

**Expected:** < 100ms for both ✅

---

## 🎯 Common Issues

### Issue: Token expired
**Error:** `401 Unauthorized`  
**Solution:** Login again to get new token

### Issue: Invalid coordinates
**Error:** `400 Bad Request`  
**Solution:** Check latitude (-90 to 90) and longitude (-180 to 180)

### Issue: Server not responding
**Solution:** 
```bash
cd /home/dip-roy/courier-service
npm run start:dev
```

### Issue: Database connection failed
**Solution:** Check PostgreSQL is running:
```bash
sudo systemctl status postgresql
```

---

**Quick Reference Version:** 1.0.0  
**Last Updated:** November 1, 2025

---

## 📚 Related Documentation

- [GPS_TRACKING_GUIDE.md](./GPS_TRACKING_GUIDE.md) - Complete feature documentation
- [GPS_TRACKING_TEST_REPORT.md](./GPS_TRACKING_TEST_REPORT.md) - Full test results
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - All API endpoints
- [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md) - Frontend integration
