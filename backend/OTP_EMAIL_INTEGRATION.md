# OTP Email Integration - Quick Test Guide

## ✅ Implementation Complete

OTP emails are now automatically sent when:

1. **User signs up** - OTP sent to verify account
2. **Unverified user tries to login** - New OTP sent

## 📧 Email Configuration

Make sure your `.env` file has valid email credentials:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=FastX Courier <noreply@fastxcourier.com>
```

### Gmail Setup (Recommended)

1. Enable 2-Factor Authentication in Gmail
2. Generate App Password: Google Account → Security → 2-Step Verification → App passwords
3. Use the generated 16-character password as `EMAIL_PASSWORD`

## 🧪 Testing Flow

### 1. User Signup

```bash
POST http://localhost:30001/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+8801712345678",
  "password": "Password123!",
  "role": "merchant"
}
```

**Expected Response:**

```json
{
  "message": "User created successfully. Please verify your account with OTP.",
  "email": "test@example.com",
  "phone": "+8801712345678"
}
```

**Email Sent:**

- **Subject:** "Verify Your FastX Courier Account"
- **Template:** Professional OTP verification email
- **Content:** 6-digit OTP code (valid for 5 minutes)

### 2. Check Email

The user will receive an email like this:

```
🔐 OTP Verification

Dear Test User,

Your OTP for verification is:

    123456

This OTP will expire in 5 minutes.

Do not share this OTP with anyone.
```

### 3. Verify OTP

```bash
POST http://localhost:30001/api/auth/verify-otp
Content-Type: application/json

{
  "email": "test@example.com",
  "otpCode": "123456"
}
```

**Expected Response:**

```json
{
  "message": "Account verified successfully",
  "user": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### 4. Test Unverified Login

If user tries to login before verifying:

```bash
POST http://localhost:30001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123!"
}
```

**Expected Response:**

```json
{
  "statusCode": 400,
  "message": "Account not verified. A new OTP has been sent.",
  "error": "Bad Request"
}
```

**New OTP Email Sent Automatically**

## 📝 Email Template Features

The OTP email includes:

- ✅ Professional FastX Courier branding
- ✅ Large, centered OTP code (easy to read)
- ✅ Expiry time warning (5 minutes)
- ✅ Security warning (don't share OTP)
- ✅ Mobile-responsive design
- ✅ Clean HTML formatting

## 🔍 Verification Process

### Database Check

```sql
SELECT id, name, email, "isVerified", "otpCode", "otpExpiry"
FROM users
WHERE email = 'test@example.com';
```

**Before Verification:**

```
isVerified: false
otpCode: 123456
otpExpiry: 2025-11-23 12:35:00
```

**After Verification:**

```
isVerified: true
otpCode: null
otpExpiry: null
```

## 🔧 Error Handling

### Email Sending Fails

If email sending fails (network issue, wrong credentials):

- User registration still completes
- OTP is stored in database
- Error is logged to console
- User can request new OTP by trying to login

### OTP Expired

```json
{
  "statusCode": 400,
  "message": "OTP expired. Please request a new one.",
  "error": "Bad Request"
}
```

**Solution:** User logs in again, new OTP is sent.

### Invalid OTP

```json
{
  "statusCode": 400,
  "message": "Invalid OTP",
  "error": "Bad Request"
}
```

## 🚀 Testing with Real Email

### Step 1: Update .env

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-real-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

### Step 2: Start Backend

```bash
cd backend
npm run start:dev
```

### Step 3: Register with Your Email

```bash
curl -X POST http://localhost:30001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "your-real-email@gmail.com",
    "phone": "+8801712345678",
    "password": "Test123!",
    "role": "merchant"
  }'
```

### Step 4: Check Your Inbox

- Look for email from "FastX Courier"
- Copy the 6-digit OTP code

### Step 5: Verify OTP

```bash
curl -X POST http://localhost:30001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-real-email@gmail.com",
    "otpCode": "YOUR_OTP_HERE"
  }'
```

## 📊 Success Indicators

✅ Backend console shows: "Email sent to test@example.com: <message-id>"
✅ User receives OTP email within seconds
✅ OTP verification returns access tokens
✅ User can login without OTP after verification

## 🐛 Troubleshooting

### "Failed to send OTP email" in console

**Check:**

- EMAIL_HOST, EMAIL_PORT correct
- EMAIL_USER is valid email
- EMAIL_PASSWORD is correct (use app password for Gmail)
- Internet connection working

### Email not received

**Check:**

- Spam/Junk folder
- Email address is correct
- Gmail allows "Less secure app access" or use App Password

### SMTP Connection Error

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solution:** Use Gmail App Password instead of regular password

## 🎯 Next Steps

1. ✅ OTP email sending is enabled
2. ✅ Professional email template
3. ✅ Error handling implemented
4. 🔜 Add email resend endpoint (optional)
5. 🔜 Add SMS OTP support (optional)
6. 🔜 Add rate limiting for OTP requests

## 📚 Related Files

- **Service:** `src/modules/auth/auth.service.ts`
- **Module:** `src/modules/auth/auth.module.ts`
- **Email Service:** `src/modules/notifications/email.service.ts`
- **Email Template:** `otpVerificationTemplate()` method
- **Controller:** `src/modules/auth/auth.controller.ts`

## 🔐 Security Notes

- OTP expires in 5 minutes (configurable)
- OTP is cleared after successful verification
- Failed registration doesn't expose user existence
- OTP sending failure doesn't block registration
- Email credentials stored securely in .env (never commit!)

---

**Status:** ✅ OTP Email Integration Complete
**Date:** November 23, 2025
**Version:** 1.0
