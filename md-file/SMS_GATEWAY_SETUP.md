# SMS Gateway Setup Guide

This guide explains how to configure SMS gateway for FastX Courier Service.

---

## 🚀 Quick Start

The SMS service now supports **4 providers**:
1. **Log Mode** (Development - No actual SMS sent)
2. **Twilio** (International)
3. **SSL Wireless** (Bangladesh)
4. **Nexmo/Vonage** (International)
5. **Generic REST API** (Custom provider)

---

## 📋 Configuration

### Step 1: Choose Your Provider

Edit `.env` and set `SMS_PROVIDER`:

```env
# Options: 'log', 'twilio', 'ssl-wireless', 'nexmo', 'generic'
SMS_PROVIDER=log
```

### Step 2: Configure Provider Credentials

Based on your chosen provider, configure the respective credentials:

---

## 🔧 Provider-Specific Setup

### Option 1: Development Mode (Log Only)

**Best for**: Development and testing without actual SMS sending

```env
SMS_PROVIDER=log
SMS_SENDER_ID=FastX
```

**Features**:
- ✅ No API calls made
- ✅ SMS logged to console
- ✅ Always returns success
- ✅ No cost, no credentials needed

**Output**:
```
[DEV MODE] SMS would be sent to +8801712345678: FastX: Your OTP is 123456
```

---

### Option 2: Twilio (International)

**Best for**: International SMS delivery, high reliability

**Setup**:
1. Sign up at https://www.twilio.com/
2. Get your Account SID and Auth Token
3. Get a Twilio phone number
4. Configure `.env`:

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
SMS_SENDER_ID=FastX
```

**Pricing**: ~$0.0075 per SMS (varies by country)

**Installation**:
```bash
npm install twilio
```

**Documentation**: https://www.twilio.com/docs/sms/quickstart/node

---

### Option 3: SSL Wireless (Bangladesh) ⭐ RECOMMENDED

**Best for**: Bangladesh market, local support, competitive pricing

**Setup**:
1. Visit https://sslwireless.com/ or contact sales
2. Register for SMS Plus service
3. Get API Token and SID
4. Apply for Sender ID approval (e.g., "FastX")
5. Configure `.env`:

```env
SMS_PROVIDER=ssl-wireless
SSL_SMS_API_TOKEN=your_api_token_here
SSL_SMS_SID=your_sid_here
SSL_SMS_SENDER_ID=FastX
```

**Pricing**: ~৳0.20-0.40 per SMS (Bangladesh)

**Installation**:
```bash
npm install axios
```

**Phone Number Format**:
- Input: `+8801712345678`
- SSL Wireless expects: `01712345678` (auto-converted)

**API Documentation**: https://sslwireless.com/developer

**Sample Response**:
```json
{
  "status": "success",
  "status_code": "2000",
  "data": "Message sent successfully"
}
```

---

### Option 4: Nexmo/Vonage

**Best for**: International SMS, competitive pricing

**Setup**:
1. Sign up at https://www.vonage.com/
2. Get API Key and Secret
3. Configure `.env`:

```env
SMS_PROVIDER=nexmo
NEXMO_API_KEY=your_api_key
NEXMO_API_SECRET=your_api_secret
NEXMO_FROM_NAME=FastX
SMS_SENDER_ID=FastX
```

**Pricing**: ~$0.0057 per SMS (varies by country)

**Installation**:
```bash
npm install axios
```

**Documentation**: https://developer.vonage.com/messaging/sms/overview

---

### Option 5: Generic REST API

**Best for**: Custom SMS providers with REST API

**Setup**:
Configure your provider's API details:

```env
SMS_PROVIDER=generic
SMS_API_URL=https://your-provider.com/api/send
SMS_API_KEY=your_api_key_here
SMS_SENDER_ID=FastX
```

**Request Format**:
```json
{
  "apiKey": "your_api_key",
  "to": "+8801712345678",
  "message": "Your SMS message here",
  "senderId": "FastX"
}
```

**Headers**:
```
Content-Type: application/json
Authorization: Bearer your_api_key
```

---

## 🧪 Testing Your Configuration

### Test 1: Verify Service Initialization

```bash
npm run start:dev
```

Look for:
```
[SmsService] SMS service initialized
```

### Test 2: Send Test SMS via API

Use Postman or curl to test the notification endpoint:

```bash
curl -X POST http://localhost:3001/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "userId": "user-uuid",
    "type": "sms",
    "title": "Test SMS",
    "message": "This is a test message from FastX Courier"
  }'
```

### Test 3: Send OTP SMS

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+8801712345678",
    "password": "password123",
    "name": "Test User",
    "role": "merchant"
  }'
```

**Expected**: OTP SMS sent to phone number

---

## 📊 SMS Templates

The service includes 10 pre-built templates:

| Template | Usage | Example |
|----------|-------|---------|
| `shipment-created` | New shipment | "FastX: Your shipment FX20251028 has been created" |
| `shipment-picked-up` | Pickup complete | "FastX: Shipment picked up and in transit" |
| `out-for-delivery` | Delivery started | "FastX: Your shipment is out for delivery" |
| `delivered` | Delivery complete | "FastX: Shipment delivered successfully" |
| `failed-delivery` | Delivery failed | "FastX: Delivery failed. Reason: Customer unavailable" |
| `otp-verification` | User OTP | "FastX: Your OTP is 123456. Valid for 5 minutes" |
| `delivery-otp` | Delivery OTP | "FastX: Delivery OTP for FX20251028 is 456789" |
| `cod-collection` | COD collected | "FastX: COD 2500 BDT collected" |
| `payout-initiated` | Payout started | "FastX: Payout of 5000 BDT initiated" |
| `payout-completed` | Payout done | "FastX: Payout completed. 5000 BDT credited" |

---

## 💰 Cost Comparison (Bangladesh Market)

| Provider | Cost/SMS | Setup Time | Reliability | Local Support |
|----------|----------|------------|-------------|---------------|
| **SSL Wireless** | ৳0.20-0.40 | 2-3 days | ⭐⭐⭐⭐⭐ | ✅ Yes |
| **Twilio** | ৳0.60-0.80 | Instant | ⭐⭐⭐⭐⭐ | ❌ No |
| **Nexmo** | ৳0.45-0.65 | Instant | ⭐⭐⭐⭐ | ❌ No |

**Recommendation**: Use **SSL Wireless** for Bangladesh operations.

---

## 🔐 Security Best Practices

### 1. Environment Variables
```bash
# NEVER commit these to git
SSL_SMS_API_TOKEN=keep_this_secret
TWILIO_AUTH_TOKEN=keep_this_secret
```

### 2. Rate Limiting
Already configured in `app.module.ts`:
```typescript
ThrottlerModule.forRoot([{
  ttl: 60000,  // 60 seconds
  limit: 10,   // 10 SMS per minute
}])
```

### 3. OTP Expiration
Configured in `.env`:
```env
OTP_EXPIRATION=300  # 5 minutes
OTP_LENGTH=6
```

### 4. Phone Number Validation
Use international format:
```
✅ +8801712345678
❌ 01712345678
❌ 8801712345678
```

---

## 🐛 Troubleshooting

### Issue 1: SMS Not Sending

**Check**:
1. Is `SMS_PROVIDER` set correctly?
2. Are credentials configured?
3. Check logs for error messages
4. Verify phone number format

**Debug**:
```bash
# Check logs
npm run start:dev

# Look for:
[SmsService] SMS service initialized
[SmsService] SMS sent to +8801712345678
```

### Issue 2: SSL Wireless "Invalid Token"

**Solution**:
1. Verify API Token is correct
2. Check if SID is correct
3. Ensure your IP is whitelisted (contact SSL support)
4. Test token with their API testing tool

### Issue 3: Twilio "Invalid Phone Number"

**Solution**:
1. Use E.164 format: `+8801712345678`
2. Verify country code is correct
3. Check if number is blacklisted
4. Ensure Twilio phone number is active

### Issue 4: "Module Not Found: twilio"

**Solution**:
```bash
npm install twilio
# or
npm install axios
```

---

## 📈 Monitoring & Analytics

### Check SMS Delivery Status

**In Database**:
```sql
SELECT * FROM notifications 
WHERE type = 'sms' 
ORDER BY created_at DESC 
LIMIT 100;
```

**In Logs**:
```bash
# Filter SMS logs
npm run start:dev | grep "SMS sent"
```

### Track Failed SMS

```sql
SELECT * FROM notifications 
WHERE type = 'sms' 
AND delivery_status = 'failed';
```

---

## 🔄 Integration with Auth Module

The SMS service is ready to be integrated with authentication. To activate:

### Edit `src/modules/auth/auth.service.ts`

**Line 64** - Signup OTP:
```typescript
// Replace TODO with:
await this.emailService.sendEmail({
  to: user.email,
  subject: 'Verify Your Account',
  template: 'otp-verification',
  context: { otp: otpCode, userName: user.name, expiryMinutes: 5 }
});

await this.smsService.sendOtp(user.phone, otpCode);
```

**Line 108** - Login OTP:
```typescript
// Replace TODO with:
await this.smsService.sendOtp(user.phone, otpCode);
```

---

## 📱 Bangladesh SMS Providers (Alternatives)

If SSL Wireless doesn't work for you, consider:

1. **Brilliant IT** - https://www.brilliant.com.bd/
2. **Ajuratech** - https://www.ajuratech.com/
3. **Alpha SMS** - https://www.alphasms.com.bd/
4. **Mimsms** - https://www.mimsms.com/
5. **BulkSMSBD** - https://www.bulksmsbd.com/

All follow similar REST API patterns.

---

## ✅ Production Checklist

Before going live:

- [ ] SMS provider credentials configured
- [ ] Sender ID approved by provider
- [ ] SMS templates tested
- [ ] Phone number validation working
- [ ] Rate limiting configured
- [ ] Monitoring set up
- [ ] Fallback provider configured (optional)
- [ ] Cost alerts configured
- [ ] Error handling tested
- [ ] Integration with Auth module complete

---

## 🚀 Next Steps

1. **Configure Email Service** - Complete the notification stack
2. **Integrate with Auth** - Connect OTP sending to signup/login
3. **Test Complete Flow** - Signup → OTP → Verify → Login
4. **Monitor Costs** - Track SMS usage and optimize

---

## 📞 Support

For SMS gateway issues:
- **SSL Wireless**: support@sslwireless.com, +880-2-8836464
- **Twilio**: https://www.twilio.com/help/contact
- **Nexmo**: https://developer.vonage.com/community

For application issues:
- Check logs: `npm run start:dev`
- Review documentation: `IMPLEMENTATION_GUIDE.md`
- Check integration status: `NOT_INTEGRATED.md`

---

**Last Updated**: October 28, 2025  
**Service Version**: 1.0  
**Supported Providers**: 5 (Log, Twilio, SSL Wireless, Nexmo, Generic)
