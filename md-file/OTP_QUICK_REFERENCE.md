# 📋 OTP Verification - Quick Copy-Paste Examples

Ready-to-use request examples for Postman testing.

---

## 🔧 Setup

**Base URL:** `http://localhost:3001/api`

**Make sure server is running:**
```bash
npm run start:dev
```

---

## 1️⃣ Signup (Get OTP)

### Request

```
POST http://localhost:3001/api/auth/signup
Content-Type: application/json
```

### Body (Copy this)

```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "phone": "+8801712345678",
  "password": "SecurePass123!",
  "role": "customer",
  "city": "Dhaka",
  "area": "Gulshan",
  "address": "House 10, Road 5, Gulshan-1"
}
```

### Expected Response

```json
{
  "message": "User created successfully. Please verify your account with OTP.",
  "email": "testuser@example.com",
  "phone": "+8801712345678"
}
```

### 📝 Action: Check Server Console for OTP!

Look for:
```
[SmsService] [DEV MODE] SMS would be sent to +8801712345678: Your FastX verification code is 123456
```

---

## 2️⃣ Verify OTP

### Request

```
POST http://localhost:3001/api/auth/verify-otp
Content-Type: application/json
```

### Body (Copy this - Replace 123456 with actual OTP)

```json
{
  "email": "testuser@example.com",
  "otpCode": "123456"
}
```

### Expected Response

```json
{
  "message": "Account verified successfully",
  "user": {
    "id": "uuid",
    "email": "testuser@example.com",
    "name": "Test User",
    "phone": "+8801712345678",
    "role": "customer",
    "isVerified": true,
    "isActive": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 📝 Action: Copy the accessToken for next requests!

---

## 3️⃣ Login After Verification

### Request

```
POST http://localhost:3001/api/auth/login
Content-Type: application/json
```

### Body (Copy this)

```json
{
  "email": "testuser@example.com",
  "password": "SecurePass123!"
}
```

### Expected Response

```json
{
  "user": {
    "id": "uuid",
    "email": "testuser@example.com",
    "name": "Test User",
    "isVerified": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 4️⃣ Get User Profile (Protected Route)

### Request

```
GET http://localhost:3001/api/auth/me
Authorization: Bearer {accessToken}
```

### Expected Response

```json
{
  "user": {
    "id": "uuid",
    "email": "testuser@example.com",
    "name": "Test User",
    "phone": "+8801712345678",
    "role": "customer",
    "isVerified": true,
    "isActive": true
  }
}
```

---

## 🧪 Error Scenarios

### Invalid OTP

**Request:**
```json
{
  "email": "testuser@example.com",
  "otpCode": "999999"
}
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "Invalid OTP",
  "error": "Bad Request"
}
```

---

### Expired OTP

**Wait 6 minutes after signup, then verify**

**Response:**
```json
{
  "statusCode": 400,
  "message": "OTP expired. Please request a new one.",
  "error": "Bad Request"
}
```

---

### Already Verified

**Try to verify OTP twice**

**Response:**
```json
{
  "statusCode": 400,
  "message": "Account already verified",
  "error": "Bad Request"
}
```

---

### Login Unverified Account (Get New OTP)

**Request:**
```json
{
  "email": "unverified@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "Account not verified. A new OTP has been sent.",
  "error": "Bad Request"
}
```

**📝 Check server console for new OTP code!**

---

## 🔍 Database Check

Connect to PostgreSQL:
```bash
psql -U postgres -d fastx_courier
```

Check OTP:
```sql
SELECT email, "otpCode", "otpExpiry", "isVerified" 
FROM users 
WHERE email = 'testuser@example.com';
```

Clear test user:
```sql
DELETE FROM users WHERE email = 'testuser@example.com';
```

---

## 📱 curl Commands

### Signup
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "phone": "+8801712345678",
    "password": "SecurePass123!",
    "role": "customer"
  }'
```

### Verify OTP
```bash
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "otpCode": "123456"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 🎯 Quick Test Checklist

1. [ ] Start server: `npm run start:dev`
2. [ ] Signup with new email
3. [ ] Copy OTP from server console
4. [ ] Verify OTP with copied code
5. [ ] Receive access token and refresh token
6. [ ] Login with verified account
7. [ ] Get user profile with token

✅ **All working = OTP verification complete!**

---

## 🚀 Automated Test

Run the bash script:
```bash
./test-otp.sh
```

This will:
- Create user
- Prompt for OTP from console
- Verify OTP
- Login
- Get profile
- Show success/failure

---

## 📞 Need Help?

- Check `OTP_VERIFICATION_GUIDE.md` for detailed guide
- Check `SMS_GATEWAY_SETUP.md` for SMS configuration
- Server logs show OTP codes in development mode
- Database queries in `check-otp.sql`

---

Happy Testing! 🎉
