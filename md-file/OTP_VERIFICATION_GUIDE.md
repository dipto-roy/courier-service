# 📱 OTP Verification Testing Guide

Complete guide for testing OTP verification flow with Postman in FastX Courier Service.

## 🚀 Quick Start

### Option 1: Import Postman Collection (Recommended)

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `OTP_VERIFICATION_POSTMAN.json`
5. Click **Import**
6. Collection will appear in your Collections sidebar

### Option 2: Manual Testing (Copy-paste requests below)

---

## 📋 Complete OTP Flow

### Step 1: Start Development Server

```bash
npm run start:dev
```

**Expected Output:**
```
[SmsService] SMS service initialized
[Application] Nest application successfully started
[Application] Server is running on: http://localhost:3001
```

---

### Step 2: Signup (Generate OTP)

**Endpoint:** `POST http://localhost:3001/api/auth/signup`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
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

**Expected Response (201 Created):**
```json
{
  "message": "User created successfully. Please verify your account with OTP.",
  "email": "testuser@example.com",
  "phone": "+8801712345678"
}
```

**What Happens:**
- ✅ User created in database with `isVerified: false`
- ✅ 6-digit OTP generated (random number)
- ✅ OTP saved to database with 5-minute expiry
- ✅ **Check server console for OTP** (since SMS_PROVIDER=log)

**Server Console Output:**
```
[SmsService] [DEV MODE] SMS would be sent to +8801712345678: Your FastX verification code is 654321. Valid for 5 minutes. Do not share this code with anyone.
```

**📝 Copy the OTP code from console!** (Example: `654321`)

---

### Step 3: Get OTP from Server Logs

Look for this line in your terminal:

```
[SmsService] [DEV MODE] SMS would be sent to +8801712345678: Your FastX verification code is 123456
```

**Copy the 6-digit code** (Example: `123456`)

---

### Step 4: Verify OTP

**Endpoint:** `POST http://localhost:3001/api/auth/verify-otp`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "testuser@example.com",
  "otpCode": "123456"
}
```

**Replace `123456` with the actual OTP from server logs!**

**Expected Success Response (200 OK):**
```json
{
  "message": "Account verified successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "testuser@example.com",
    "name": "Test User",
    "phone": "+8801712345678",
    "role": "customer",
    "isVerified": true,
    "isActive": true,
    "city": "Dhaka",
    "area": "Gulshan",
    "address": "House 10, Road 5, Gulshan-1",
    "createdAt": "2025-10-28T10:30:00.000Z",
    "updatedAt": "2025-10-28T10:35:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzMwMTE1NjAwLCJleHAiOjE3MzAxMTkyMDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzMwMTE1NjAwLCJleHAiOjE3MzA3MjA0MDB9.yyyyyyyyyyyyyyyyyyyyyyyyyyy"
}
```

**What Happens:**
- ✅ OTP validated
- ✅ User marked as verified (`isVerified: true`)
- ✅ OTP cleared from database
- ✅ Access token and refresh token generated
- ✅ User can now login without OTP

---

### Step 5: Login After Verification

**Endpoint:** `POST http://localhost:3001/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "testuser@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200 OK):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
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

✅ **Success!** User is now fully authenticated.

---

## 🧪 Testing Different Scenarios

### Scenario 1: Invalid OTP

**Request:**
```json
{
  "email": "testuser@example.com",
  "otpCode": "999999"
}
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Invalid OTP",
  "error": "Bad Request"
}
```

---

### Scenario 2: Expired OTP

**Steps:**
1. Signup and get OTP
2. Wait 6 minutes (OTP expires in 5 minutes)
3. Try to verify with expired OTP

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "OTP expired. Please request a new one.",
  "error": "Bad Request"
}
```

**Solution:** Login again to get new OTP

---

### Scenario 3: Already Verified Account

**Request:** Verify OTP twice

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Account already verified",
  "error": "Bad Request"
}
```

---

### Scenario 4: Login Unverified Account (Get New OTP)

**Endpoint:** `POST http://localhost:3001/api/auth/login`

**Request:**
```json
{
  "email": "unverified@example.com",
  "password": "SecurePass123!"
}
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Account not verified. A new OTP has been sent.",
  "error": "Bad Request"
}
```

**What Happens:**
- ✅ New OTP generated
- ✅ Check server console for new OTP code
- ✅ Use new OTP to verify account

---

## 🔍 Debugging Tips

### 1. Check Server Logs

Always watch your terminal for OTP codes:

```bash
npm run start:dev
```

Look for lines like:
```
[SmsService] [DEV MODE] SMS would be sent to +8801712345678: Your FastX verification code is 123456
```

---

### 2. Check Database Directly

Connect to PostgreSQL:

```bash
psql -U postgres -d fastx_courier
```

Check user OTP:

```sql
SELECT 
  email, 
  "otpCode", 
  "otpExpiry", 
  "isVerified",
  "isActive"
FROM users 
WHERE email = 'testuser@example.com';
```

**Example Output:**
```
            email            | otpCode | otpExpiry           | isVerified | isActive
-----------------------------+---------+---------------------+------------+----------
 testuser@example.com        | 123456  | 2025-10-28 10:35:00 | false      | true
```

---

### 3. Clear Test Data

Delete test user:

```sql
DELETE FROM users WHERE email = 'testuser@example.com';
```

---

## 📱 Testing with Real SMS (Production)

### Configure SMS Provider

Edit `.env`:

```env
# For Bangladesh (RECOMMENDED)
SMS_PROVIDER=ssl-wireless
SSL_SMS_API_TOKEN=your_actual_token
SSL_SMS_SID=your_actual_sid
SSL_SMS_SENDER_ID=FastX

# OR for International
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_actual_sid
TWILIO_AUTH_TOKEN=your_actual_token
TWILIO_PHONE_NUMBER=+1234567890
```

Restart server:

```bash
npm run start:dev
```

Now OTP will be sent via **real SMS** to the phone number!

---

## 🎯 Complete Test Checklist

- [ ] Server running on port 3001
- [ ] Signup creates user successfully
- [ ] OTP appears in server console logs
- [ ] Verify OTP with correct code succeeds
- [ ] Verify OTP with wrong code fails (400)
- [ ] Verify expired OTP fails (400)
- [ ] Verify already verified account fails (400)
- [ ] Login with verified account succeeds
- [ ] Login with unverified account generates new OTP
- [ ] Access token and refresh token received
- [ ] User marked as verified in database

---

## 🛠️ Troubleshooting

### Issue 1: "Cannot POST /api/auth/verify-otp"

**Solution:** Check URL is correct:
- ✅ `http://localhost:3001/api/auth/verify-otp`
- ❌ `http://localhost:3001/auth/verify-otp` (missing `/api`)

---

### Issue 2: OTP not showing in logs

**Check:**
1. `SMS_PROVIDER=log` in `.env` file
2. Server is running in development mode
3. Console logs are visible in terminal

---

### Issue 3: "User not found"

**Solution:** Run signup first to create the user!

---

### Issue 4: 401 Unauthorized

**Reason:** Some endpoints require authentication.

**Solution:** Use the `accessToken` from verify-otp response:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📚 API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/signup` | ❌ No | Create account + generate OTP |
| POST | `/api/auth/verify-otp` | ❌ No | Verify OTP + get tokens |
| POST | `/api/auth/login` | ❌ No | Login (or get new OTP if unverified) |
| POST | `/api/auth/refresh` | ❌ No | Refresh access token |
| POST | `/api/auth/logout` | ✅ Yes | Logout user |
| GET | `/api/auth/me` | ✅ Yes | Get current user profile |

---

## 🎉 Success Criteria

✅ **OTP Verification Working When:**

1. Signup creates user with OTP in database
2. OTP visible in server console logs (development mode)
3. Verify-OTP with correct code returns 200 + tokens
4. User `isVerified` changes from `false` to `true`
5. Login after verification succeeds without OTP
6. Invalid/expired OTP returns proper error messages

---

## 🔗 Related Documentation

- **SMS Gateway Setup**: See `SMS_GATEWAY_SETUP.md`
- **SMS Implementation**: See `SMS_IMPLEMENTATION_COMPLETE.md`
- **Missing Integrations**: See `NOT_INTEGRATED.md`

---

## 📞 Next Steps

1. ✅ Test OTP flow with Postman (this guide)
2. ⏳ Configure SMS provider (SSL Wireless or Twilio)
3. ⏳ Integrate SMS service with Auth module
4. ⏳ Test with real phone numbers
5. ⏳ Deploy to production

**Current Status:** OTP verification works, but SMS is in development mode (logs only).

**To activate real SMS:** Configure provider credentials in `.env` and integrate SmsService with AuthService.

---

Happy Testing! 🚀
