# Testing Guide - CSRF Protection & Integration

## Quick Test Steps

### 1. Start Backend (Terminal 1)

```bash
cd /home/dip-roy/courier-service/backend
npm run start:dev
```

**Wait for:**

```
🚀 FastX Courier Backend is running!
```

### 2. Test Backend Health

```bash
curl http://localhost:3001/api/health
```

**Expected:**

```json
{
  "status": "OK",
  "uptime": 123.456,
  "timestamp": "2025-11-24T...",
  "environment": "development"
}
```

### 3. Test CSRF Token Endpoint

```bash
curl -s -c /tmp/test-cookies.txt http://localhost:3001/api/csrf/token | jq '.'
```

**Expected:**

```json
{
  "csrfToken": "abc123...def456..."
}
```

**Verify Cookie:**

```bash
cat /tmp/test-cookies.txt | grep csrf
```

**Expected:**

```
localhost    FALSE   /   FALSE   1764...   x-csrf-token   abc123...def456...
```

### 4. Start Frontend (Terminal 2)

```bash
cd /home/dip-roy/courier-service/frontend
npm run dev
```

**Watch for:**

- ✅ No "middleware deprecated" warning
- ✅ Server starts on port 3001
- ✅ "Ready" message appears

### 5. Open Browser

1. Navigate to: `http://localhost:3001`
2. Open DevTools (F12)
3. Go to Console tab
4. Check for errors (should be none)

### 6. Check CSRF Token Fetching

In browser console, check Network tab:

1. Look for request to `/api/csrf/token`
2. Status should be 200
3. Response should contain `csrfToken`
4. Cookies tab should show `x-csrf-token`

### 7. Test CSRF Protection

**Option A: Create Shipment (Frontend)**

1. Login to dashboard
2. Navigate to Shipments
3. Click "Create Shipment"
4. Fill form and submit
5. Check Network tab:
   - Request should have `x-csrf-token` header
   - No 403 errors

**Option B: Manual API Test**

```bash
# Get token
TOKEN=$(curl -s -c /tmp/cookies.txt http://localhost:3001/api/csrf/token | jq -r .csrfToken)

# Test without token (should fail)
curl -X POST http://localhost:3001/api/shipments \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test with token (should work or require auth)
curl -X POST http://localhost:3001/api/shipments \
  -b /tmp/cookies.txt \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $TOKEN" \
  -d '{"test": "data"}'
```

## Detailed Test Checklist

### Backend Tests

- [ ] Health endpoint responds
- [ ] CSRF token endpoint returns token
- [ ] Cookie is set with proper flags
- [ ] GET requests work without CSRF token
- [ ] POST without token returns 403
- [ ] POST with valid token works
- [ ] PUT/PATCH/DELETE require CSRF token
- [ ] Public endpoints work without token

### Frontend Tests

- [ ] App loads without errors
- [ ] No middleware deprecation warning
- [ ] CSRF token fetched on load
- [ ] Token visible in browser cookies
- [ ] POST requests include CSRF header
- [ ] PUT requests include CSRF header
- [ ] DELETE requests include CSRF header
- [ ] No 403 CSRF errors in console

### Integration Tests

- [ ] Frontend can call backend APIs
- [ ] Cookies are properly shared
- [ ] CORS works with credentials
- [ ] Token refresh works if needed
- [ ] Multiple tabs work correctly
- [ ] Login/logout flow works

## Expected Behavior

### ✅ Correct Behavior

1. **On App Load:**
   - CSRF token fetched automatically
   - Cookie set in browser
   - No errors in console

2. **On POST/PUT/DELETE:**
   - Request includes `x-csrf-token` header
   - Cookie sent with request
   - Backend validates and allows request

3. **On GET:**
   - No CSRF token required
   - Request succeeds normally

4. **On Public Endpoints:**
   - No CSRF token required
   - Auth may or may not be required
   - Works as expected

### ❌ Incorrect Behavior

1. **403 Forbidden on Protected Endpoints:**
   - Missing CSRF token
   - Token mismatch
   - Cookie not sent

2. **CORS Errors:**
   - `withCredentials` not set
   - Backend not allowing credentials
   - Origin mismatch

3. **Token Not Found:**
   - `/api/csrf/token` endpoint failing
   - Cookie not being set
   - Browser blocking cookies

## Troubleshooting

### Problem: Backend won't start

**Check:**

```bash
cd /home/dip-roy/courier-service/backend
npm install
npm run start:dev
```

**Look for:**

- Compilation errors
- Missing dependencies
- Port already in use

### Problem: Frontend shows middleware warning

**Fix:**

```bash
cd /home/dip-roy/courier-service/frontend
rm -rf .next
npm run dev
```

### Problem: CSRF 403 errors

**Check:**

1. Cookie exists: DevTools → Application → Cookies
2. Header exists: DevTools → Network → Request Headers
3. Values match: Cookie value === Header value

**Debug:**

```typescript
// Add to apiClient.ts
console.log('CSRF Token:', csrfToken);
console.log('Request headers:', config.headers);
```

### Problem: CORS errors

**Check backend main.ts:**

```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true, // ← Must be true
});
```

**Check frontend apiClient.ts:**

```typescript
const apiClient = axios.create({
  withCredentials: true, // ← Must be true
});
```

## Success Criteria

### ✅ All Tests Pass When:

1. Backend starts without errors
2. Frontend starts without warnings
3. CSRF token endpoint returns token
4. Browser receives and stores cookie
5. POST/PUT/DELETE include CSRF header
6. Protected endpoints don't return 403
7. Public endpoints work without token
8. Login/logout flow works correctly

### 🎉 Ready for Production When:

1. All tests pass
2. CSRF_SECRET changed to strong value
3. HTTPS enabled
4. Rate limiting added
5. Monitoring set up
6. Documentation complete

## Quick Commands Reference

```bash
# Backend
cd /home/dip-roy/courier-service/backend
npm run start:dev          # Start dev server
npm run build             # Build for production
npm run start:prod        # Start production

# Frontend
cd /home/dip-roy/courier-service/frontend
npm run dev               # Start dev server
npm run build             # Build for production
npm run start             # Start production

# Testing
curl http://localhost:3001/api/health                    # Health check
curl http://localhost:3001/api/csrf/token                # Get CSRF token
curl -X POST http://localhost:3001/api/test \            # Test CSRF
  -b cookies.txt \
  -H "x-csrf-token: TOKEN"

# Cleanup
rm -rf backend/dist backend/node_modules/.cache
rm -rf frontend/.next frontend/node_modules/.cache
```

## Next Steps After Testing

1. **If All Tests Pass:**
   - ✅ Mark as complete
   - ✅ Update production checklist
   - ✅ Prepare deployment

2. **If Tests Fail:**
   - 🔍 Review error messages
   - 🔍 Check implementation
   - 🔍 Verify configuration
   - 🔍 Consult troubleshooting guide

3. **Production Deployment:**
   - 📝 Complete production checklist
   - 🔐 Change all secrets
   - 🌐 Enable HTTPS
   - 📊 Set up monitoring
   - 🚀 Deploy!

---

**Ready to Test?** Start with Step 1 above! 🚀
