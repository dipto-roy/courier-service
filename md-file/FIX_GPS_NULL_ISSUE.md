# 🔧 GPS Latitude/Longitude NULL Issue - সমাধান

**সমস্যা:** Users table এবং Shipments table এ latitude/longitude NULL হয়ে যাচ্ছে

---

## 📊 বর্তমান অবস্থা

### ✅ যেখানে GPS Data ঠিক আছে:

**`rider_locations` table:**
```sql
SELECT COUNT(*), COUNT(latitude), COUNT(longitude) FROM rider_locations;
-- Result: 7 records, all have latitude/longitude ✅
```

**Example Data:**
```
latitude: 23.7808875 ✅
longitude: 90.4161712 ✅
```

### ❌ যেখানে GPS Data NULL:

**1. `users` table:**
```sql
SELECT name, email, latitude, longitude FROM users WHERE email = 'rider9999@test.com';
-- Result: latitude = NULL, longitude = NULL ❌
```

**2. `shipments` table:**
```sql
SELECT awb, receiver_latitude, receiver_longitude FROM shipments LIMIT 5;
-- Result: 7 out of 8 shipments have NULL latitude/longitude ❌
```

---

## 🎯 সমাধান

### Solution 1: Users Table এ GPS Save করা

**Users table এর latitude/longitude হলো user এর home/office address এর GPS coordinates।**

#### API দিয়ে Update করুন:

```bash
# Rider এর location update
curl -X PATCH http://localhost:3001/api/auth/update-profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 23.7808875,
    "longitude": 90.4161712,
    "address": "Updated Address with GPS"
  }'
```

#### অথবা Database এ Direct Update:

```sql
UPDATE users 
SET 
  latitude = 23.7808875,
  longitude = 90.4161712
WHERE email = 'rider9999@test.com';
```

**Test করুন:**
```bash
PGPASSWORD=postgres psql -U postgres -h localhost -d courier_service -c "
UPDATE users 
SET latitude = 23.7808875, longitude = 90.4161712
WHERE email = 'rider9999@test.com';

SELECT name, email, latitude, longitude 
FROM users 
WHERE email = 'rider9999@test.com';
"
```

---

### Solution 2: Shipments Table এ GPS Save করা

**Shipment create করার সময় receiver_latitude এবং receiver_longitude দিতে হবে।**

#### ❌ বর্তমান API Call (GPS ছাড়া):

```bash
curl -X POST http://localhost:3001/api/shipments \
  -H "Authorization: Bearer MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": {
      "name": "ABC Store",
      "phone": "01712345001",
      "address": "Gulshan-1",
      "city": "Dhaka",
      "area": "Gulshan"
    },
    "receiver": {
      "name": "Customer",
      "phone": "01556789001",
      "address": "Dhanmondi-3",
      "city": "Dhaka",
      "area": "Dhanmondi"
    },
    "weight": 2.5,
    "codAmount": 35000,
    "productDescription": "Samsung Phone",
    "deliveryType": "express",
    "paymentMethod": "cod"
  }'
```

#### ✅ সঠিক API Call (GPS সহ):

```bash
curl -X POST http://localhost:3001/api/shipments \
  -H "Authorization: Bearer MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": {
      "name": "ABC Electronics",
      "phone": "01712345001",
      "address": "ABC Warehouse, Gulshan-1",
      "city": "Dhaka",
      "area": "Gulshan",
      "latitude": "23.8103590",
      "longitude": "90.4125330"
    },
    "receiver": {
      "name": "John Customer",
      "phone": "01556789001",
      "address": "House 10, Road 5, Dhanmondi-3",
      "city": "Dhaka",
      "area": "Dhanmondi",
      "latitude": "23.7449160",
      "longitude": "90.3575580"
    },
    "weight": 2.5,
    "codAmount": 35000,
    "productDescription": "Samsung Galaxy S24",
    "deliveryType": "express",
    "paymentMethod": "cod"
  }'
```

---

### Solution 3: Existing Shipments Update করা

**যদি shipment already create হয়ে গেছে, database এ update করুন:**

```sql
-- Example: Dhanmondi customer এর জন্য
UPDATE shipments 
SET 
  receiver_latitude = '23.7449160',
  receiver_longitude = '90.3575580'
WHERE receiver_area = 'Dhanmondi'
  AND receiver_latitude IS NULL;

-- Verify
SELECT 
  awb,
  receiver_name,
  receiver_area,
  receiver_latitude,
  receiver_longitude
FROM shipments
WHERE receiver_latitude IS NOT NULL;
```

---

## 🗺️ Common Dhaka GPS Coordinates

**Shipment create করার সময় এই coordinates use করুন:**

```javascript
const dhakaLocations = {
  "Gulshan": { lat: "23.8103590", lon: "90.4125330" },
  "Dhanmondi": { lat: "23.7449160", lon: "90.3575580" },
  "Banani": { lat: "23.8068160", lon: "90.3688270" },
  "Mirpur": { lat: "23.8141560", lon: "90.3469220" },
  "Uttara": { lat: "23.8759380", lon: "90.3795030" },
  "Motijheel": { lat: "23.7337850", lon: "90.4178780" },
  "Mohammadpur": { lat: "23.7650000", lon: "90.3580000" },
  "Lalmatia": { lat: "23.7570000", lon: "90.3650000" }
};
```

---

## 🧪 Complete Test করুন

### Test 1: User GPS Update

```bash
# Create test rider
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GPS Test Rider 2",
    "email": "gpsrider2@test.com",
    "phone": "01338888888",
    "password": "Test123!",
    "role": "rider",
    "city": "Dhaka",
    "area": "Gulshan",
    "address": "Gulshan Base",
    "latitude": "23.8103590",
    "longitude": "90.4125330"
  }'

# Verify OTP
PGPASSWORD=postgres psql -U postgres -h localhost -d courier_service -c \
  "UPDATE users SET is_verified = true WHERE email = 'gpsrider2@test.com';"

# Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gpsrider2@test.com","password":"Test123!"}' | jq -r '.accessToken')

# Check user GPS
PGPASSWORD=postgres psql -U postgres -h localhost -d courier_service -c \
  "SELECT name, email, latitude, longitude FROM users WHERE email = 'gpsrider2@test.com';"
```

### Test 2: Shipment with GPS

```bash
# First, get merchant token (use existing merchant from previous tests)
MERCHANT_EMAIL="m1761783427688@test.com"
MERCHANT_PASS="Pass123!"

MERCHANT_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$MERCHANT_EMAIL\",\"password\":\"$MERCHANT_PASS\"}" | jq -r '.accessToken')

echo "Merchant Token: ${MERCHANT_TOKEN:0:30}..."

# Create shipment with GPS
curl -X POST http://localhost:3001/api/shipments \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": {
      "name": "ABC Electronics",
      "phone": "01712345001",
      "address": "Gulshan Hub",
      "city": "Dhaka",
      "area": "Gulshan",
      "latitude": "23.8103590",
      "longitude": "90.4125330"
    },
    "receiver": {
      "name": "Test Customer",
      "phone": "01556789001",
      "address": "Dhanmondi-3",
      "city": "Dhaka",
      "area": "Dhanmondi",
      "latitude": "23.7449160",
      "longitude": "90.3575580"
    },
    "weight": 2.5,
    "codAmount": 35000,
    "productDescription": "Test Product with GPS",
    "deliveryType": "express",
    "paymentMethod": "cod"
  }' | jq .

# Verify in database
PGPASSWORD=postgres psql -U postgres -h localhost -d courier_service -c "
SELECT 
  awb,
  receiver_name,
  receiver_area,
  receiver_latitude,
  receiver_longitude
FROM shipments
ORDER BY created_at DESC
LIMIT 1;
"
```

---

## 📝 API DTO Update করা (Backend Code)

**যদি API latitude/longitude accept না করে, তাহলে DTO file update করতে হবে:**

### File: `src/auth/dto/create-user.dto.ts`

```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsEnum(['customer', 'merchant', 'rider', 'agent', 'hub_staff', 'admin', 'finance', 'support'])
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsString()
  @IsOptional()
  address?: string;

  // ✅ এই দুটো field add করুন
  @IsString()
  @IsOptional()
  latitude?: string;

  @IsString()
  @IsOptional()
  longitude?: string;
}
```

### File: `src/shipments/dto/create-shipment.dto.ts`

```typescript
class AddressDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  area: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  // ✅ এই দুটো field add করুন
  @IsString()
  @IsOptional()
  latitude?: string;

  @IsString()
  @IsOptional()
  longitude?: string;
}

export class CreateShipmentDto {
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  sender: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  receiver: AddressDto;

  // ... rest of the fields
}
```

---

## ✅ Final Verification

```bash
# Check all tables
PGPASSWORD=postgres psql -U postgres -h localhost -d courier_service << 'EOF'
\echo '=== USERS TABLE GPS STATUS ==='
SELECT 
  role,
  COUNT(*) as total,
  COUNT(latitude) as has_gps
FROM users
GROUP BY role
ORDER BY role;

\echo ''
\echo '=== SHIPMENTS TABLE GPS STATUS ==='
SELECT 
  COUNT(*) as total_shipments,
  COUNT(receiver_latitude) as has_receiver_gps
FROM shipments;

\echo ''
\echo '=== RIDER_LOCATIONS TABLE GPS STATUS ==='
SELECT 
  COUNT(*) as total_locations,
  COUNT(latitude) as has_gps,
  MIN(latitude) as min_lat,
  MAX(latitude) as max_lat
FROM rider_locations;
EOF
```

---

## 🎯 Summary

### Issue কেন হয়েছিল:

1. **Users table:** Signup করার সময় latitude/longitude দেওয়া হয়নি
2. **Shipments table:** Create করার সময় receiver.latitude/longitude দেওয়া হয়নি
3. **rider_locations table:** ✅ এখানে কোনো সমস্যা নেই - perfectly কাজ করছে

### সমাধান:

1. ✅ Signup করার সময় latitude/longitude include করুন
2. ✅ Shipment create করার সময় sender/receiver GPS coordinates দিন
3. ✅ Existing data update করতে চাইলে SQL command use করুন
4. ✅ DTO files update করুন যদি API validation issue থাকে

### Test Results:

- **rider_locations:** ✅ 7/7 records have GPS
- **users:** ⚠️ Need to add GPS during signup
- **shipments:** ⚠️ Need to add GPS during creation

**আপনার GPS tracking system (23.7808875, 90.4161712) perfectly কাজ করছে rider_locations table এ!** 🎉
