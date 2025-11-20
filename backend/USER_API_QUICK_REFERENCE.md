# 👥 User Management API - Quick Reference

All user endpoints with JSON examples for Postman testing.

---

## 🔐 Authentication

**All endpoints require Bearer token authentication:**

```
Authorization: Bearer {access_token}
```

**Get access token from login:**
```bash
POST /api/auth/login
```

---

## 📚 Endpoints Summary

| # | Method | Endpoint | Role Required | Description |
|---|--------|----------|---------------|-------------|
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

## 1️⃣ Create User (Admin Only)

### Request
```http
POST http://localhost:3001/api/users
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Body
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
  "companyName": "ABC Company Ltd.",
  "businessWebsite": "www.abccompany.com"
}
```

**Roles:** `admin`, `merchant`, `customer`, `rider`, `support`, `finance`, `agent`

### Response (201)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phone": "01712345678",
  "role": "merchant",
  "isActive": true,
  "isVerified": false,
  "isKycVerified": false,
  "walletBalance": 0,
  "city": "Dhaka",
  "area": "Gulshan",
  "address": "House 12, Road 5",
  "merchantBusinessName": "ABC Company Ltd.",
  "createdAt": "2025-10-28T10:30:00.000Z"
}
```

---

## 2️⃣ Get All Users (Paginated)

### Request
```http
GET http://localhost:3001/api/users?page=1&limit=10
Authorization: Bearer {access_token}
```

### Query Parameters (All Optional)
```
page=1                          # Page number
limit=10                        # Items per page (max: 100)
search=john                     # Search by name, email, phone
role=merchant                   # Filter by role
isActive=true                   # Filter by active status
isEmailVerified=true            # Filter by email verification
isKYCVerified=false             # Filter by KYC verification
city=Dhaka                      # Filter by city
sortBy=createdAt                # Sort field
sortOrder=DESC                  # ASC or DESC
```

### Examples
```
# All users
GET /users

# Merchants only
GET /users?role=merchant&isActive=true

# Search by name
GET /users?search=john

# KYC verified users in Dhaka
GET /users?isKYCVerified=true&city=Dhaka

# Page 2 with 20 items
GET /users?page=2&limit=20
```

### Response (200)
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "phone": "01712345678",
      "role": "merchant",
      "isActive": true,
      "isVerified": true,
      "isKycVerified": false,
      "walletBalance": 5000,
      "city": "Dhaka",
      "createdAt": "2025-10-27T08:00:00.000Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## 3️⃣ Get User Statistics (Admin Only)

### Request
```http
GET http://localhost:3001/api/users/statistics
Authorization: Bearer {access_token}
```

### Response (200)
```json
{
  "totalUsers": 150,
  "activeUsers": 142,
  "inactiveUsers": 8,
  "verifiedUsers": 120,
  "kycVerifiedUsers": 85,
  "byRole": {
    "admin": 3,
    "merchant": 50,
    "customer": 60,
    "rider": 25,
    "support": 5,
    "finance": 4,
    "agent": 3
  },
  "byCity": {
    "Dhaka": 100,
    "Chittagong": 30,
    "Sylhet": 15,
    "Rajshahi": 5
  },
  "totalWalletBalance": 750000,
  "newUsersThisMonth": 15,
  "newUsersToday": 2
}
```

---

## 4️⃣ Get User by ID

### Request
```http
GET http://localhost:3001/api/users/{user_id}
Authorization: Bearer {access_token}
```

### Example
```
GET /users/550e8400-e29b-41d4-a716-446655440000
```

### Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "phone": "01712345678",
  "role": "merchant",
  "isActive": true,
  "isVerified": true,
  "isKycVerified": false,
  "walletBalance": 5000,
  "city": "Dhaka",
  "area": "Gulshan",
  "address": "House 12, Road 5",
  "merchantBusinessName": "ABC Company Ltd.",
  "lastLogin": "2025-10-28T10:30:00.000Z",
  "createdAt": "2025-10-27T08:00:00.000Z"
}
```

---

## 5️⃣ Update User

### Request
```http
PATCH http://localhost:3001/api/users/{user_id}
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Body (All Fields Optional)
```json
{
  "fullName": "John Michael Doe",
  "email": "john.michael@example.com",
  "phone": "01712345679",
  "password": "NewPassword@123",
  "city": "Chittagong",
  "area": "Agrabad",
  "isActive": true,
  "isEmailVerified": true
}
```

### Examples

**Update name only:**
```json
{
  "fullName": "Jane Smith Updated"
}
```

**Activate account:**
```json
{
  "isActive": true,
  "isEmailVerified": true,
  "isPhoneVerified": true
}
```

**Update address:**
```json
{
  "city": "Dhaka",
  "area": "Dhanmondi",
  "address": "House 5, Road 3/A"
}
```

### Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.michael@example.com",
  "name": "John Michael Doe",
  "phone": "01712345679",
  "isActive": true,
  "updatedAt": "2025-10-28T11:00:00.000Z"
}
```

---

## 6️⃣ Update KYC Status

### Request
```http
PATCH http://localhost:3001/api/users/{user_id}/kyc
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Body - Approve KYC
```json
{
  "isKYCVerified": true,
  "kycRemarks": "KYC documents verified successfully. Trade license and NID verified."
}
```

### Body - Reject KYC
```json
{
  "isKYCVerified": false,
  "kycRemarks": "Invalid trade license. Please resubmit valid documents."
}
```

### Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "isKycVerified": true,
  "merchantBusinessName": "ABC Company Ltd.",
  "updatedAt": "2025-10-28T11:15:00.000Z"
}
```

---

## 7️⃣ Update Wallet Balance

### Request
```http
PATCH http://localhost:3001/api/users/{user_id}/wallet
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Body - Credit Money
```json
{
  "operation": "credit",
  "amount": 5000,
  "remarks": "Monthly delivery payment for October 2025"
}
```

### Body - Debit Money
```json
{
  "operation": "debit",
  "amount": 500,
  "remarks": "Service charge deduction for Q4 2025"
}
```

### Body - Refund
```json
{
  "operation": "credit",
  "amount": 250,
  "remarks": "Refund for cancelled shipment #AWB123456789"
}
```

### Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "walletBalance": 6000,
  "updatedAt": "2025-10-28T11:30:00.000Z"
}
```

### Error - Insufficient Balance (400)
```json
{
  "statusCode": 400,
  "message": "Insufficient wallet balance for debit operation",
  "error": "Bad Request"
}
```

---

## 8️⃣ Delete User (Soft Delete)

### Request
```http
DELETE http://localhost:3001/api/users/{user_id}
Authorization: Bearer {access_token}
```

### Response (204)
```
No Content
```

**Notes:**
- Soft delete - data not permanently removed
- Sets `deletedAt` timestamp
- User won't appear in normal queries
- Can be restored

---

## 9️⃣ Restore Deleted User

### Request
```http
POST http://localhost:3001/api/users/{user_id}/restore
Authorization: Bearer {access_token}
```

### Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "isActive": true,
  "deletedAt": null,
  "updatedAt": "2025-10-28T11:45:00.000Z"
}
```

---

## 🎯 Common Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email or phone already exists",
  "error": "Conflict"
}
```

---

## 🔑 User Roles

| Role | Description |
|------|-------------|
| `admin` | Full system access |
| `merchant` | Business users who create shipments |
| `customer` | End customers who receive shipments |
| `rider` | Delivery personnel |
| `support` | Customer support staff |
| `finance` | Financial operations staff |
| `agent` | Pickup agents |

---

## 📝 Field Descriptions

### User Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | User unique identifier |
| `email` | String | Email address (unique) |
| `name` | String | Full name |
| `phone` | String | Phone number (unique) |
| `role` | Enum | User role |
| `isActive` | Boolean | Account active status |
| `isVerified` | Boolean | Email/phone verified |
| `isKycVerified` | Boolean | KYC verification status |
| `twoFaEnabled` | Boolean | 2FA enabled |
| `walletBalance` | Number | Wallet balance in BDT |
| `address` | String | Full address |
| `city` | String | City name |
| `area` | String | Area/locality |
| `merchantBusinessName` | String | Business name (merchants) |
| `lastLogin` | DateTime | Last login timestamp |
| `createdAt` | DateTime | Account creation |
| `updatedAt` | DateTime | Last update |
| `deletedAt` | DateTime | Soft delete timestamp |

---

## 🚀 Quick Start

### 1. Import Postman Collection
```
File: USER_ENDPOINTS_POSTMAN.json
```

### 2. Set Variables
- `base_url`: http://localhost:3001/api
- `access_token`: Your JWT token from login
- `user_id`: User ID for testing

### 3. Login First
```bash
POST /api/auth/login
```

Copy `accessToken` to Postman environment variable.

### 4. Test Endpoints
Start with "Get All Users" to see existing data.

---

## 📚 Files Available

1. **USER_ENDPOINTS.json** - Complete API documentation
2. **USER_ENDPOINTS_POSTMAN.json** - Postman collection
3. **USER_API_QUICK_REFERENCE.md** - This file

---

## 💡 Tips

- All timestamps are in UTC (ISO 8601 format)
- Sensitive fields excluded from responses (password, tokens)
- Default pagination: page=1, limit=10
- Maximum limit per page: 100
- All amounts in BDT (Bangladeshi Taka)
- Use soft delete for data preservation

---

Happy Testing! 🎉
