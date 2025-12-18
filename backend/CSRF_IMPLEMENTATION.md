# CSRF Protection Implementation Guide

## Overview

This guide covers the complete CSRF (Cross-Site Request Forgery) protection implementation for the FastX Courier Service.

## Backend Implementation

### 1. Dependencies Installed

```bash
npm install csrf-csrf cookie-parser @types/cookie-parser
```

### 2. Files Created

#### `/src/csrf/csrf.controller.ts`

- Provides CSRF token endpoint: `GET /api/csrf/token`
- Returns JSON: `{ csrfToken: "..." }`

#### `/src/csrf/csrf.module.ts`

- NestJS module for CSRF functionality

#### `/src/common/middleware/csrf.middleware.ts`

- CSRF middleware using `csrf-csrf` (double submit cookie pattern)
- Protects all routes except:
  - `/api/health`
  - `/api/docs`
  - `/api/track/*`
  - `/api/auth/login`
  - `/api/auth/signup`
  - `/api/auth/verify-otp`
  - `/api/auth/resend-otp`
- Only validates POST, PUT, PATCH, DELETE requests

### 3. Configuration

#### `.env` Addition

```env
CSRF_SECRET=fastx_csrf_secret_2025_change_in_production_use_strong_random_key
```

**⚠️ IMPORTANT**: Change this secret in production!

#### `main.ts` Updates

- Added `cookie-parser` middleware
- Enabled cookies with CORS

#### `app.module.ts` Updates

- Imported `CsrfModule`
- Applied `CsrfMiddleware` globally

### 4. How It Works

1. **Double Submit Cookie Pattern**:
   - Server generates CSRF token
   - Token stored in HTTP-only cookie
   - Same token returned in response body
   - Client includes token in request header
   - Server validates cookie matches header

2. **Flow**:
   ```
   Client → GET /api/csrf/token → Server
   Client ← { csrfToken: "abc..." } + Cookie ← Server
   Client → POST /api/shipments (Header: x-csrf-token: abc...) → Server
   Server validates: Cookie === Header ✓
   ```

## Frontend Implementation

### 1. File Changes

#### `middleware.ts` → `proxy.ts`

- Fixed Next.js deprecation warning
- Renamed `middleware()` to `proxy()`
- Maintains same redirect logic

#### `src/common/lib/apiClient.ts`

- Added CSRF token fetching
- Automatically includes token in non-GET requests
- Refreshes token when needed

### 2. How It Works

1. **On App Start**:

   ```typescript
   fetchCsrfToken(); // Automatically called
   ```

2. **On Each Request**:

   ```typescript
   apiClient.post('/shipments', data);
   // Interceptor automatically adds:
   // headers['x-csrf-token'] = csrfToken
   ```

3. **Token Refresh**:
   - Token fetched once on app load
   - Re-fetched if missing before requests
   - Stored in memory (not localStorage)

## Testing

### 1. Test CSRF Token Endpoint

```bash
# Get CSRF token
curl -c cookies.txt http://localhost:3001/api/csrf/token

# Expected response:
# { "csrfToken": "abc123..." }
```

### 2. Test Protected Endpoint

```bash
# Without CSRF token (should fail)
curl -X POST http://localhost:3001/api/shipments \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}'

# Expected: 403 Forbidden or CSRF error

# With CSRF token (should succeed)
TOKEN=$(curl -s -c cookies.txt http://localhost:3001/api/csrf/token | jq -r .csrfToken)
curl -X POST http://localhost:3001/api/shipments \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $TOKEN" \
  -d '{"data":"test"}'

# Expected: 200/201 or normal response
```

### 3. Test Frontend Integration

1. **Start Backend**:

   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start Frontend**:

   ```bash
   cd frontend
   npm run dev
   ```

3. **Check Browser Console**:
   - No CSRF-related errors
   - Network tab shows `x-csrf-token` header on POST/PUT/DELETE
   - Cookies tab shows `x-csrf-token` cookie

4. **Test Actions**:
   - Create shipment
   - Update shipment
   - Delete shipment
   - All should work without errors

## Security Features

### 1. Protection Level

- ✅ CSRF attacks blocked
- ✅ Double submit cookie pattern
- ✅ HTTP-only cookies (XSS protection)
- ✅ SameSite=Lax (additional protection)
- ✅ Secure flag in production

### 2. Public Endpoints

These endpoints are NOT protected (as they should be):

- Health checks
- API documentation
- Public tracking
- Authentication endpoints (login/signup)

### 3. Production Checklist

- [ ] Change `CSRF_SECRET` to strong random value
- [ ] Verify `secure: true` in production
- [ ] Test all POST/PUT/DELETE endpoints
- [ ] Monitor CSRF token errors in logs
- [ ] Add rate limiting on token endpoint

## Troubleshooting

### Issue: "CSRF token missing"

**Solution**:

1. Check browser cookies for `x-csrf-token`
2. Verify `/api/csrf/token` endpoint is accessible
3. Check browser console for CSRF fetch errors

### Issue: "CSRF token mismatch"

**Solution**:

1. Clear browser cookies
2. Refresh CSRF token
3. Check if multiple tabs are causing issues

### Issue: "Public endpoints are protected"

**Solution**:

1. Add endpoint to `publicPaths` in `csrf.middleware.ts`
2. Restart backend

### Issue: Frontend requests failing

**Solution**:

1. Check `withCredentials: true` in axios config
2. Verify CORS allows credentials
3. Check browser console for CORS errors

## Advanced Configuration

### Custom Cookie Options

Edit `csrf.middleware.ts` and `csrf.controller.ts`:

```typescript
cookieOptions: {
  httpOnly: true,
  sameSite: 'strict', // 'lax' | 'strict' | 'none'
  secure: true, // Enable in production
  path: '/',
  maxAge: 3600000, // 1 hour
}
```

### Add More Public Paths

Edit `csrf.middleware.ts`:

```typescript
const publicPaths = [
  '/api/health',
  '/api/docs',
  '/api/track',
  '/api/auth/login',
  '/api/your-new-public-endpoint', // Add here
];
```

### Token Expiration

Tokens don't expire by default with double submit pattern.
For time-based expiration, implement custom logic:

```typescript
// Store token with timestamp
localStorage.setItem('csrfTokenTimestamp', Date.now().toString());

// Check expiration before use
const timestamp = localStorage.getItem('csrfTokenTimestamp');
const isExpired = Date.now() - Number(timestamp) > 3600000; // 1 hour
if (isExpired) {
  await fetchCsrfToken();
}
```

## API Reference

### Backend Endpoints

#### GET `/api/csrf/token`

Get CSRF token for authenticated requests.

**Response**:

```json
{
  "csrfToken": "abc123xyz456..."
}
```

**Cookies Set**:

- `x-csrf-token`: HTTP-only cookie with token value

### Frontend Functions

#### `fetchCsrfToken()`

```typescript
const token = await fetchCsrfToken();
```

Fetches fresh CSRF token from backend.

#### `apiClient`

```typescript
import apiClient from '@/src/common/lib/apiClient';

// Automatically includes CSRF token
await apiClient.post('/api/shipments', data);
await apiClient.put('/api/shipments/123', data);
await apiClient.delete('/api/shipments/123');
```

## Migration Steps

### For Existing Projects

1. **Install Backend Dependencies**:

   ```bash
   cd backend
   npm install csrf-csrf cookie-parser @types/cookie-parser
   ```

2. **Copy Files**:
   - `/src/csrf/csrf.controller.ts`
   - `/src/csrf/csrf.module.ts`
   - `/src/common/middleware/csrf.middleware.ts`

3. **Update Backend**:
   - Update `app.module.ts` (add CsrfModule, middleware)
   - Update `main.ts` (add cookie-parser)
   - Update `.env` (add CSRF_SECRET)

4. **Update Frontend**:
   - Update `src/common/lib/apiClient.ts` (add CSRF logic)
   - Rename `middleware.ts` to `proxy.ts`

5. **Test**:
   - Start backend and frontend
   - Test all POST/PUT/DELETE endpoints
   - Verify no errors in console

## Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Change CSRF_SECRET before production
3. ✅ Monitor CSRF token errors in logs
4. ✅ Use `withCredentials: true` for all API calls
5. ✅ Don't store CSRF tokens in localStorage
6. ✅ Keep public endpoints list minimal
7. ✅ Test token refresh logic
8. ✅ Add rate limiting on token endpoint
9. ✅ Use SameSite cookies when possible
10. ✅ Validate tokens on every state-changing request

## Additional Resources

- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Double Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
- [csrf-csrf NPM Package](https://www.npmjs.com/package/csrf-csrf)
- [NestJS Security](https://docs.nestjs.com/security/csrf)

## Summary

✅ **Backend**: CSRF middleware + token endpoint + cookie handling
✅ **Frontend**: Automatic token fetching + request interceptor
✅ **Security**: Double submit cookie + HTTP-only + SameSite
✅ **Testing**: Manual + integration testing ready
✅ **Production**: Configuration checklist provided

**Status**: ✅ CSRF Protection Fully Implemented
