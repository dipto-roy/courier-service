# 👥 User Management API - Complete Package

## 📦 Files Created

I've created a **complete API documentation package** for User Management endpoints:

### 1. **USER_ENDPOINTS.json** (Main Documentation)
   - Complete API specification in JSON format
   - All 9 endpoints with detailed examples
   - Request/response structures
   - Error codes and descriptions
   - Field descriptions and validations
   - **Size:** ~1500 lines of comprehensive documentation

### 2. **USER_ENDPOINTS_POSTMAN.json** (Postman Collection)
   - Ready-to-import Postman collection
   - 16 pre-configured requests with examples
   - Variables: base_url, access_token, user_id
   - Bearer token authentication configured
   - Request descriptions and notes

### 3. **USER_API_QUICK_REFERENCE.md** (Quick Guide)
   - Easy-to-read markdown format
   - Copy-paste JSON examples
   - All 9 endpoints explained
   - Query parameters guide
   - Common error responses
   - Field descriptions table

### 4. **test-user-api.sh** (Automated Testing)
   - Bash script with all 14 curl commands
   - Color-coded output
   - Tests all endpoints in sequence
   - Easy to customize

---

## 📋 All User Endpoints (9 Total)

| # | Method | Endpoint | Role | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/users` | admin | Create new user |
| 2 | GET | `/users` | admin, support | Get all users (paginated) |
| 3 | GET | `/users/statistics` | admin | Get user statistics |
| 4 | GET | `/users/{id}` | admin, support | Get user by ID |
| 5 | PATCH | `/users/{id}` | admin, support | Update user |
| 6 | PATCH | `/users/{id}/kyc` | admin, finance | Update KYC status |
| 7 | PATCH | `/users/{id}/wallet` | admin, finance | Update wallet balance |
| 8 | DELETE | `/users/{id}` | admin | Soft delete user |
| 9 | POST | `/users/{id}/restore` | admin | Restore deleted user |

---

## 🚀 Quick Start (3 Methods)

### Method 1: Postman (Recommended) 👈

1. **Import Collection:**
   ```
   Open Postman → Import → Select: USER_ENDPOINTS_POSTMAN.json
   ```

2. **Set Variables:**
   - `base_url`: http://localhost:3001/api
   - `access_token`: Get from login endpoint
   - `user_id`: User UUID for testing

3. **Login First:**
   ```bash
   POST /api/auth/login
   Body: { "email": "admin@example.com", "password": "password" }
   ```
   Copy `accessToken` from response

4. **Test Endpoints:**
   - Start with "Get All Users"
   - Try "Create User"
   - Test filters and pagination

---

### Method 2: Automated Script

```bash
# Edit the script first
nano test-user-api.sh

# Set your access token
ACCESS_TOKEN="your_jwt_token_here"

# Run all tests
./test-user-api.sh
```

---

### Method 3: Individual curl Commands

See `USER_API_QUICK_REFERENCE.md` for copy-paste examples.

---

## 📝 Example Usage

### 1. Create User (Admin)

**Request:**
```bash
POST http://localhost:3001/api/users
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "01712345678",
  "password": "Password@123",
  "role": "merchant",
  "city": "Dhaka",
  "area": "Gulshan",
  "address": "House 12, Road 5",
  "companyName": "ABC Company Ltd."
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phone": "01712345678",
  "role": "merchant",
  "isActive": true,
  "isVerified": false,
  "walletBalance": 0,
  "city": "Dhaka"
}
```

---

### 2. Get All Users (Filtered)

**Request:**
```bash
GET http://localhost:3001/api/users?role=merchant&isActive=true&page=1&limit=20
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "merchant",
      "walletBalance": 5000
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### 3. Update Wallet (Credit)

**Request:**
```bash
PATCH http://localhost:3001/api/users/{id}/wallet
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "operation": "credit",
  "amount": 5000,
  "remarks": "Monthly delivery payment"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "walletBalance": 10000
}
```

---

## 🔍 Query Parameters Reference

### Get All Users Filters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number | `?page=2` |
| `limit` | number | Items per page (max: 100) | `?limit=20` |
| `search` | string | Search name, email, phone | `?search=john` |
| `role` | enum | Filter by role | `?role=merchant` |
| `isActive` | boolean | Filter by active status | `?isActive=true` |
| `isEmailVerified` | boolean | Filter by email verification | `?isEmailVerified=true` |
| `isKYCVerified` | boolean | Filter by KYC verification | `?isKYCVerified=false` |
| `city` | string | Filter by city | `?city=Dhaka` |
| `sortBy` | string | Sort field | `?sortBy=createdAt` |
| `sortOrder` | string | ASC or DESC | `?sortOrder=DESC` |

### Example Queries

```bash
# All merchants in Dhaka
GET /users?role=merchant&city=Dhaka

# KYC verified users
GET /users?isKYCVerified=true&isActive=true

# Search by name with pagination
GET /users?search=john&page=2&limit=50

# Recent users (last 10)
GET /users?sortBy=createdAt&sortOrder=DESC&limit=10
```

---

## 🔑 User Roles

| Role | Access Level | Use Case |
|------|--------------|----------|
| `admin` | Full access | System administrators |
| `merchant` | Create shipments | Business users |
| `customer` | Receive shipments | End customers |
| `rider` | Delivery operations | Delivery personnel |
| `support` | View/Edit users | Customer support |
| `finance` | KYC & Wallet | Financial operations |
| `agent` | Pickup operations | Pickup agents |

---

## 🎯 Common Use Cases

### Use Case 1: Create Merchant Account
```json
POST /users
{
  "fullName": "ABC Trading Ltd.",
  "email": "contact@abctrading.com",
  "phone": "01712345678",
  "password": "SecurePass123",
  "role": "merchant",
  "city": "Dhaka",
  "companyName": "ABC Trading Ltd."
}
```

### Use Case 2: Approve Merchant KYC
```json
PATCH /users/{id}/kyc
{
  "isKYCVerified": true,
  "kycRemarks": "Trade license verified. NID verified. Bank account verified."
}
```

### Use Case 3: Credit Delivery Payment
```json
PATCH /users/{id}/wallet
{
  "operation": "credit",
  "amount": 12500,
  "remarks": "Delivery payment for 50 shipments - October 2025"
}
```

### Use Case 4: Search Active Merchants
```
GET /users?role=merchant&isActive=true&isKYCVerified=true
```

---

## 🚨 Common Errors

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Solution:** Login to get access token

---

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```
**Solution:** User role doesn't have permission

---

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```
**Solution:** Check user ID exists

---

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email or phone already exists"
}
```
**Solution:** Use different email/phone

---

## 📊 Response Structure

### Single User Response
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "phone": "string",
  "role": "enum",
  "isActive": "boolean",
  "isVerified": "boolean",
  "isKycVerified": "boolean",
  "walletBalance": "number",
  "city": "string",
  "area": "string",
  "address": "string",
  "merchantBusinessName": "string",
  "lastLogin": "datetime",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Paginated List Response
```json
{
  "data": [/* array of users */],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Statistics Response
```json
{
  "totalUsers": 150,
  "activeUsers": 142,
  "verifiedUsers": 120,
  "byRole": { /* breakdown by role */ },
  "byCity": { /* breakdown by city */ },
  "totalWalletBalance": 750000
}
```

---

## 💡 Best Practices

1. **Authentication:**
   - Always include Bearer token
   - Refresh token before expiry
   - Use HTTPS in production

2. **Pagination:**
   - Start with small limits (10-20)
   - Use filters to reduce data
   - Sort by relevant fields

3. **Error Handling:**
   - Check status codes
   - Handle 401/403 gracefully
   - Retry on 5xx errors

4. **Wallet Operations:**
   - Always include remarks
   - Check balance before debit
   - Keep transaction records

5. **KYC Verification:**
   - Verify all documents
   - Include detailed remarks
   - Keep audit trail

---

## 📚 Documentation Files

| File | Purpose | Format |
|------|---------|--------|
| `USER_ENDPOINTS.json` | Complete API spec | JSON |
| `USER_ENDPOINTS_POSTMAN.json` | Postman collection | JSON |
| `USER_API_QUICK_REFERENCE.md` | Quick guide | Markdown |
| `test-user-api.sh` | Automated tests | Bash |
| `USER_API_SUMMARY.md` | This file | Markdown |

---

## 🎉 Ready to Use!

**Everything is set up!** Choose your preferred method:

### Option 1: Postman (Visual)
```
1. Import USER_ENDPOINTS_POSTMAN.json
2. Set access_token variable
3. Click Send on any request
```

### Option 2: Command Line (Quick)
```bash
./test-user-api.sh
```

### Option 3: Manual Testing (Learning)
```
Copy examples from USER_API_QUICK_REFERENCE.md
```

---

## 📞 Need Help?

- **Full API Spec:** `USER_ENDPOINTS.json`
- **Quick Examples:** `USER_API_QUICK_REFERENCE.md`
- **Postman Collection:** `USER_ENDPOINTS_POSTMAN.json`
- **Automated Tests:** `test-user-api.sh`

---

## 🔗 Related Files

- **OTP Verification:** `OTP_VERIFICATION_GUIDE.md`
- **SMS Setup:** `SMS_GATEWAY_SETUP.md`
- **Auth Endpoints:** (Coming soon)
- **Shipment Endpoints:** (Coming soon)

---

**All User Management endpoints documented and ready to test!** 🚀

**Current Status:**
- ✅ 9 endpoints fully documented
- ✅ Postman collection ready
- ✅ curl examples provided
- ✅ Automated test script created
- ✅ Quick reference guide available

Happy Testing! 🎉
