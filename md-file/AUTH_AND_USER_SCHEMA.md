# 🔐 Authentication & User Schema Guide

**Last Updated:** October 30, 2025

---

## User Entity Database Schema

### Database Table: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL (hashed),
  role ENUM('admin', 'merchant', 'agent', 'hub_staff', 'rider', 'customer', 'finance', 'support'),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_kyc_verified BOOLEAN DEFAULT false,
  two_fa_enabled BOOLEAN DEFAULT false,
  two_fa_secret VARCHAR (encrypted),
  otp_code VARCHAR,
  otp_expiry TIMESTAMP,
  refresh_token TEXT,
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  address VARCHAR,
  city VARCHAR,
  area VARCHAR,
  postal_code VARCHAR,
  latitude VARCHAR,
  longitude VARCHAR,
  hub_id UUID,
  merchant_business_name VARCHAR,
  merchant_trade_license VARCHAR,
  profile_image VARCHAR,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP (soft delete),
  
  INDEX (email),
  INDEX (phone),
  INDEX (role)
);
```

---

## User Roles & Permissions

### 1. **CUSTOMER** (Default Role)
- End customer/buyer
- Can create shipments as sender
- Can track shipments (public tracking)
- Can view wallet balance
- Can update profile

```json
{
  "name": "John Doe",
  "email": "customer@example.com",
  "phone": "01712345678",
  "password": "SecurePass123!",
  "role": "customer"
}
```

### 2. **MERCHANT**
- Sells/ships products
- Can create shipments
- Can bulk upload shipments (CSV)
- Can manage pickups
- Can view detailed tracking
- Has wallet for COD collections
- Can initiate payouts
- Required fields: `name`, `email`, `phone`, `password`, `address`, `city`, `area`, `merchantBusinessName`

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

### 3. **RIDER**
- Delivers shipments
- Can complete deliveries with OTP
- Can collect COD
- Can mark RTO/failed delivery
- Can update live location (GPS tracking)
- Can view assigned manifests & shipments

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

### 4. **AGENT**
- Picks up shipments from merchants
- Can complete pickups with shipment scanning
- Can view assigned pickups
- Can see today's pickup schedule

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

### 5. **HUB_STAFF**
- Manage hub operations
- Inbound/outbound scanning
- Create & manage manifests
- Sort shipments
- Track inventory
- Assign riders to manifests

```json
{
  "name": "Hub Manager",
  "email": "hubstaff@example.com",
  "phone": "01556789012",
  "password": "SecurePass123!",
  "role": "hub_staff",
  "city": "Dhaka",
  "area": "Gulshan",
  "address": "Hub Location Address",
  "hubId": "hub-uuid-here"
}
```

### 6. **ADMIN**
- System administrator (created by super-admin only)
- Create users with any role
- Manage all system operations
- View statistics
- Handle disputes

```json
{
  "name": "System Admin",
  "email": "admin@example.com",
  "phone": "01234567890",
  "password": "SecurePass123!",
  "role": "admin"
}
```

### 7. **FINANCE**
- Handle financial operations (created by admin only)
- Process COD collections
- Manage payouts
- View transaction statistics
- Process T+7 settlements

```json
{
  "name": "Finance Manager",
  "email": "finance@example.com",
  "phone": "01212121212",
  "password": "SecurePass123!",
  "role": "finance"
}
```

### 8. **SUPPORT**
- Customer support team (created by admin only)
- Send notifications/announcements
- View user details
- Handle complaints
- View all transactions

```json
{
  "name": "Support Agent",
  "email": "support@example.com",
  "phone": "01313131313",
  "password": "SecurePass123!",
  "role": "support"
}
```

---

## Authentication Endpoints

### Signup (POST /api/auth/signup)

**All Roles - Basic Fields:**
```json
{
  "name": "User Full Name",           // Required: string
  "email": "user@example.com",        // Required: valid email
  "phone": "01712345678",             // Required: valid BD phone
  "password": "SecurePass123!",       // Required: min 8 chars
  "role": "customer",                 // Optional: defaults to 'customer'
  "city": "Dhaka",                    // Optional: city name
  "area": "Gulshan",                  // Optional: area/district
  "address": "House 10, Road 5"       // Optional: full address
}
```

**Merchant-Specific Fields:**
```json
{
  "merchantBusinessName": "ABC Store",      // Optional: business name
  "merchantTradeLicense": "TRADE-2025-123"  // Optional: trade license number
}
```

**Complete Merchant Signup:**
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
  "merchantBusinessName": "ABC Store",
  "merchantTradeLicense": "TRADE-2025-12345"
}
```

**Response on Success (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Ahmed Merchant",
    "email": "merchant@example.com",
    "phone": "01798765432",
    "role": "merchant",
    "isActive": true,
    "isVerified": false,
    "isKycVerified": false,
    "twoFaEnabled": false,
    "walletBalance": "0.00",
    "city": "Dhaka",
    "area": "Dhanmondi",
    "address": "Merchant Warehouse, Road 10",
    "merchantBusinessName": "ABC Store",
    "createdAt": "2025-01-28T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJyb2xlIjoibWVyY2hhbnQiLCJpYXQiOjE2Mzc5MzQ3MDB9.signature...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTYzNzk..." 
}
```

**Response on Error (400, 409):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Email already exists"
}
```

---

### Login (POST /api/auth/login)

**Request:**
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
    "name": "Ahmed Merchant",
    "email": "merchant@example.com",
    "phone": "01798765432",
    "role": "merchant",
    "isActive": true,
    "isVerified": true,
    "isKycVerified": false,
    "walletBalance": "10000.00",
    "lastLogin": "2025-01-28T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Verify OTP (POST /api/auth/verify-otp)

**Request:**
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
    "email": "user@example.com",
    "isVerified": true
  }
}
```

---

### Refresh Token (POST /api/auth/refresh)

**Request:**
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

---

### Get Current User (GET /api/auth/me)

**Headers:**
```
Authorization: Bearer <ACCESS_TOKEN>
```

**Response (200):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Ahmed Merchant",
    "email": "merchant@example.com",
    "phone": "01798765432",
    "role": "merchant",
    "isActive": true,
    "isVerified": true,
    "isKycVerified": false,
    "twoFaEnabled": false,
    "walletBalance": "10000.00",
    "city": "Dhaka",
    "area": "Dhanmondi",
    "address": "Merchant Warehouse, Road 10",
    "merchantBusinessName": "ABC Store",
    "profileImage": null,
    "lastLogin": "2025-01-28T10:00:00Z",
    "createdAt": "2025-01-28T08:00:00Z",
    "updatedAt": "2025-01-28T10:00:00Z"
  }
}
```

---

### Logout (POST /api/auth/logout)

**Headers:**
```
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

## Password Requirements

- **Minimum length:** 8 characters
- **Must contain:**
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (!@#$%^&*)

**Examples:**
- ✅ SecurePass123!
- ✅ MyPassword@2025
- ✅ Courier#Service123
- ❌ password123 (no uppercase/special char)
- ❌ PASSWORD (no number/special char)

---

## User Fields Reference

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| name | string | ✅ | 255 | User's full name |
| email | string | ✅ | 255 | Valid email, unique |
| phone | string | ✅ | 20 | Valid BD phone, unique |
| password | string | ✅ | - | Min 8 chars, hashed in DB |
| role | enum | ❌ | - | Defaults to 'customer' |
| city | string | ❌ | 100 | City name |
| area | string | ❌ | 100 | Area/district |
| address | string | ❌ | 500 | Full address |
| merchantBusinessName | string | ❌ | 255 | Business name (merchants only) |
| merchantTradeLicense | string | ❌ | 255 | Trade license (merchants only) |
| profileImage | string | ❌ | 500 | Profile image URL |
| latitude | string | ❌ | - | GPS latitude (riders) |
| longitude | string | ❌ | - | GPS longitude (riders) |
| hubId | UUID | ❌ | - | Hub assignment (hub_staff) |

---

## Wallet System

### Initial Balance
- All new users start with **0.00** wallet balance

### For Merchants:
- **COD Collections:** Added when shipment is delivered
- **Deductions:** Delivery fees, platform fees
- **Pending Balance:** Collections older than 7 days (T+7 eligible)
- **Payouts:** Manual payouts by finance team via bank transfer

### Example Merchant Wallet Flow:
1. Shipment created with 1000 BDT COD amount
2. Rider delivers → 1000 BDT added to wallet
3. After 7 days → becomes eligible for payout
4. Finance initiates payout → 1000 - fees deducted
5. Bank confirms → marked as completed

---

## KYC Verification

**Initial Status:** `isKycVerified: false`

**KYC Fields to Collect:**
- National ID number
- Date of birth
- Address proof
- Business license (merchants only)
- Bank account details

**Process:**
1. User submits KYC documents
2. Admin/Finance team verifies
3. Status updated to `true`
4. User can now initiate payouts

---

## Two-Factor Authentication (2FA)

**Status:** `twoFaEnabled: false` (disabled by default)

**Available Methods:**
- OTP via SMS
- TOTP (Time-based One-Time Password)

**To Enable 2FA:**
1. User requests 2FA setup
2. System generates secret
3. User scans QR code or enters secret in authenticator app
4. User confirms with OTP
5. Status set to `true`

---

## Postman Collection Usage

### Import into Postman:

1. Create new Collection: "FastX Courier API"
2. Add Authorization:
   - Type: Bearer Token
   - Token: `{{accessToken}}`
3. Set Variable in collection:
   - `baseUrl: http://localhost:3001/api`
   - `accessToken: <your_token_here>`

### Test Flow:
```
1. POST /auth/signup → Get accessToken
2. Save token to {{accessToken}}
3. GET /auth/me → Verify user
4. Use token for authenticated endpoints
```

---

## Common Error Responses

### Signup Errors:

**Email Already Exists (409):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Email already exists"
}
```

**Invalid Email Format (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid email format"
}
```

**Phone Already Exists (409):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Phone number already registered"
}
```

**Weak Password (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
}
```

### Login Errors:

**Invalid Credentials (401):**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

**User Not Found (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found"
}
```

**Account Inactive (403):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Account is inactive"
}
```

---

**Document Generated:** October 30, 2025  
**Database Version:** 1.0  
**Status:** Production Ready ✅
