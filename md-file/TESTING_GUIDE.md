# 🧪 Authentication Testing Guide

## Prerequisites

1. **Backend Running**: Ensure backend is running at `http://localhost:3000`
2. **Frontend Running**: Run `npm run dev` in the frontend directory
3. **Database**: Ensure PostgreSQL is running with the courier database

## Test Scenarios

### 1. Signup Flow

#### Test Case 1.1: MERCHANT Signup

**Steps:**

1. Navigate to http://localhost:3000/signup
2. Select "MERCHANT" role
3. Fill in the form:
   - Name: `Test Merchant`
   - Email: `merchant@test.com`
   - Phone: `1234567890`
   - Password: `password123`
   - Confirm Password: `password123`
   - Business Name: `Test Business`
   - Business Address: `123 Test St`
4. Click "Sign Up"

**Expected Result:**

- ✅ Form submits successfully
- ✅ Redirected to `/verify-otp` page
- ✅ OTP sent to email
- ✅ User stored in database with `isVerified: false`

#### Test Case 1.2: RIDER Signup

**Steps:**

1. Navigate to http://localhost:3000/signup
2. Select "RIDER" role
3. Fill in the form (NO business fields should appear):
   - Name: `Test Rider`
   - Email: `rider@test.com`
   - Phone: `9876543210`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Sign Up"

**Expected Result:**

- ✅ Business fields hidden
- ✅ Form submits successfully
- ✅ Redirected to `/verify-otp` page

#### Test Case 1.3: CUSTOMER Signup

**Steps:**

1. Navigate to http://localhost:3000/signup
2. Select "CUSTOMER" role
3. Fill in basic details
4. Click "Sign Up"

**Expected Result:**

- ✅ Business fields hidden
- ✅ Form submits successfully
- ✅ Redirected to `/verify-otp` page

#### Test Case 1.4: Validation Errors

**Steps:**

1. Navigate to http://localhost:3000/signup
2. Try submitting with:
   - Invalid email (e.g., `notanemail`)
   - Password less than 8 characters
   - Passwords that don't match
   - Missing required fields

**Expected Result:**

- ✅ Validation errors displayed below each field
- ✅ Form doesn't submit
- ✅ Submit button remains enabled after fixing errors

### 2. OTP Verification Flow

#### Test Case 2.1: Valid OTP

**Steps:**

1. After signup, on `/verify-otp` page
2. Check email for OTP code (or check backend logs)
3. Enter the 6-digit OTP in the input fields
4. Click "Verify"

**Expected Result:**

- ✅ OTP inputs accept one digit each
- ✅ Auto-focus moves to next input
- ✅ Verification successful
- ✅ Redirected to `/dashboard`
- ✅ User's `isVerified` set to `true` in database

#### Test Case 2.2: Invalid OTP

**Steps:**

1. On `/verify-otp` page
2. Enter incorrect 6-digit code (e.g., `000000`)
3. Click "Verify"

**Expected Result:**

- ✅ Error message displayed: "Invalid OTP"
- ✅ OTP inputs cleared or remain filled
- ✅ Can try again

#### Test Case 2.3: Resend OTP

**Steps:**

1. On `/verify-otp` page
2. Click "Resend OTP" button

**Expected Result:**

- ✅ Success message: "OTP sent successfully"
- ✅ New OTP sent to email
- ✅ Old OTP becomes invalid
- ✅ Button shows loading state during request

#### Test Case 2.4: Paste OTP

**Steps:**

1. On `/verify-otp` page
2. Copy a 6-digit code (e.g., `123456`)
3. Click on any OTP input field
4. Paste the code (Ctrl+V or Cmd+V)

**Expected Result:**

- ✅ All 6 digits fill automatically
- ✅ Focus remains on last input
- ✅ Verify button becomes enabled

#### Test Case 2.5: Backspace Navigation

**Steps:**

1. On `/verify-otp` page
2. Enter some digits
3. Press Backspace

**Expected Result:**

- ✅ Current digit clears
- ✅ Focus moves to previous input
- ✅ Can continue typing backwards

### 3. Login Flow

#### Test Case 3.1: Login with Verified Account

**Steps:**

1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - Email: `merchant@test.com`
   - Password: `password123`
3. Click "Login"

**Expected Result:**

- ✅ Login successful
- ✅ Redirected to `/dashboard`
- ✅ Tokens stored in localStorage
- ✅ User info available in Zustand store

#### Test Case 3.2: Login with Unverified Account

**Steps:**

1. Create a new account but don't verify OTP
2. Try to login with those credentials

**Expected Result:**

- ✅ Login successful
- ✅ Redirected to `/verify-otp` (not dashboard)
- ✅ Must verify before accessing dashboard

#### Test Case 3.3: Login with Wrong Password

**Steps:**

1. Navigate to http://localhost:3000/login
2. Enter correct email but wrong password
3. Click "Login"

**Expected Result:**

- ✅ Error message displayed: "Invalid credentials"
- ✅ Form remains on login page
- ✅ Can try again

#### Test Case 3.4: Login with Non-existent Email

**Steps:**

1. Navigate to http://localhost:3000/login
2. Enter email that doesn't exist
3. Click "Login"

**Expected Result:**

- ✅ Error message displayed: "Invalid credentials"
- ✅ (Same message as wrong password for security)

#### Test Case 3.5: Password Visibility Toggle

**Steps:**

1. On login form
2. Start typing password (should show dots)
3. Click the eye icon

**Expected Result:**

- ✅ Password becomes visible
- ✅ Eye icon changes to "eye-off"
- ✅ Click again to hide password

### 4. Protected Routes

#### Test Case 4.1: Access Dashboard When Logged Out

**Steps:**

1. Clear browser localStorage (DevTools → Application → Local Storage → Clear)
2. Navigate to http://localhost:3000/dashboard

**Expected Result:**

- ✅ Redirected to `/login`
- ✅ Cannot access dashboard
- ✅ After login, can access dashboard

#### Test Case 4.2: Access Dashboard When Logged In

**Steps:**

1. Login with verified account
2. Navigate to http://localhost:3000/dashboard

**Expected Result:**

- ✅ Dashboard loads
- ✅ Sidebar visible with navigation
- ✅ Header shows user name and email
- ✅ Logout button visible

#### Test Case 4.3: Direct URL Access

**Steps:**

1. While logged out, try to access:
   - `/dashboard`
   - `/dashboard/shipments`
   - `/dashboard/tracking`

**Expected Result:**

- ✅ All redirect to `/login`
- ✅ After login → redirect to originally requested page

### 5. Session Management

#### Test Case 5.1: Logout

**Steps:**

1. Login and access dashboard
2. Click "Logout" button in header

**Expected Result:**

- ✅ User logged out
- ✅ Tokens cleared from localStorage
- ✅ Zustand store cleared
- ✅ Redirected to `/login`
- ✅ Cannot access dashboard anymore

#### Test Case 5.2: Page Refresh Persistence

**Steps:**

1. Login to dashboard
2. Refresh the page (F5)

**Expected Result:**

- ✅ Still logged in
- ✅ Dashboard still accessible
- ✅ User data still available
- ✅ (Auth state persisted via localStorage)

#### Test Case 5.3: Token Expiry (Auto-Logout)

**Steps:**

1. Login to dashboard
2. Wait for access token to expire (check backend JWT expiry time)
3. Try to make an API call

**Expected Result:**

- ✅ API returns 401
- ✅ Frontend automatically tries to refresh token
- ✅ If refresh fails → logout and redirect to `/login`
- ✅ If refresh succeeds → API call retried with new token

#### Test Case 5.4: Multiple Tabs

**Steps:**

1. Login in Tab 1
2. Open Tab 2 → should be logged in
3. Logout in Tab 1
4. Switch to Tab 2 and try to navigate

**Expected Result:**

- ✅ Tab 2 should also be logged out (via localStorage sync or event)
- ✅ Or Tab 2 should detect logout on next API call

### 6. Role-Based UI

#### Test Case 6.1: MERCHANT Dashboard

**Steps:**

1. Login as MERCHANT
2. Check sidebar menu

**Expected Result:**

- ✅ Dashboard link visible
- ✅ Shipments link visible
- ✅ Tracking link visible
- ✅ Payments link visible
- ✅ Users link NOT visible (admin only)
- ✅ Hubs link NOT visible (admin only)
- ✅ Manifests link NOT visible (rider only)

#### Test Case 6.2: RIDER Dashboard

**Steps:**

1. Login as RIDER
2. Check sidebar menu

**Expected Result:**

- ✅ Dashboard link visible
- ✅ Manifests link visible
- ✅ Tracking link visible
- ✅ Payments link NOT visible (merchant only)
- ✅ Users/Hubs NOT visible (admin only)

#### Test Case 6.3: ADMIN Dashboard

**Steps:**

1. Login as ADMIN (create via backend or SQL)
2. Check sidebar menu

**Expected Result:**

- ✅ Dashboard link visible
- ✅ Shipments link visible
- ✅ Tracking link visible
- ✅ Users link visible
- ✅ Hubs link visible
- ✅ All sections accessible

### 7. Form Validation

#### Test Case 7.1: Email Validation

**Steps:**

1. On signup/login form
2. Try invalid emails:
   - `notanemail`
   - `test@`
   - `@test.com`
   - `test.com`

**Expected Result:**

- ✅ Error: "Invalid email address"
- ✅ Cannot submit

#### Test Case 7.2: Password Validation

**Steps:**

1. On signup form
2. Try passwords:
   - Less than 8 characters: `pass123`
   - Empty: ``
   - Valid: `password123`

**Expected Result:**

- ✅ Error for short password: "Password must be at least 8 characters"
- ✅ Error for empty: "Required"
- ✅ No error for valid password

#### Test Case 7.3: Phone Validation

**Steps:**

1. On signup form
2. Try phone numbers:
   - Letters: `abcd123456`
   - Too short: `123`
   - Valid: `1234567890`

**Expected Result:**

- ✅ Validation based on schema
- ✅ Clear error messages

### 8. Loading States

#### Test Case 8.1: Login Button

**Steps:**

1. Fill login form
2. Click "Login"
3. Observe button during API call

**Expected Result:**

- ✅ Button text changes to "Logging in..."
- ✅ Button disabled during request
- ✅ Re-enabled after success/error

#### Test Case 8.2: Signup Button

**Steps:**

1. Fill signup form
2. Click "Sign Up"

**Expected Result:**

- ✅ Button shows "Signing up..." or spinner
- ✅ Button disabled
- ✅ Form inputs disabled

#### Test Case 8.3: Verify OTP Button

**Steps:**

1. Enter OTP
2. Click "Verify"

**Expected Result:**

- ✅ Button shows loading state
- ✅ Disabled during verification

#### Test Case 8.4: Resend OTP Button

**Steps:**

1. Click "Resend OTP"

**Expected Result:**

- ✅ Button shows "Sending..." or spinner
- ✅ Disabled during request

### 9. Error Handling

#### Test Case 9.1: Network Error

**Steps:**

1. Stop backend server
2. Try to login

**Expected Result:**

- ✅ Error message: "Network error" or similar
- ✅ Form remains on page
- ✅ Can retry after restarting backend

#### Test Case 9.2: Backend Validation Error

**Steps:**

1. Trigger backend validation (e.g., duplicate email)

**Expected Result:**

- ✅ Backend error message displayed
- ✅ User-friendly error text

#### Test Case 9.3: 500 Server Error

**Steps:**

1. Cause backend to return 500 (e.g., database down)

**Expected Result:**

- ✅ Generic error message
- ✅ Not exposing backend stack trace

### 10. Browser Compatibility

#### Test Case 10.1: Chrome

- ✅ All features work
- ✅ No console errors

#### Test Case 10.2: Firefox

- ✅ All features work
- ✅ No console errors

#### Test Case 10.3: Safari

- ✅ All features work
- ✅ Especially test localStorage and OTP paste

#### Test Case 10.4: Edge

- ✅ All features work

### 11. Mobile Responsiveness

#### Test Case 11.1: Mobile Login

**Steps:**

1. Open on mobile or use DevTools device mode
2. Navigate to login page

**Expected Result:**

- ✅ Form fields appropriately sized
- ✅ Button tappable
- ✅ No horizontal scroll
- ✅ Keyboard doesn't break layout

#### Test Case 11.2: Mobile Dashboard

**Steps:**

1. Login on mobile

**Expected Result:**

- ✅ Sidebar either hidden or hamburger menu
- ✅ Content readable
- ✅ Logout button accessible

#### Test Case 11.3: Mobile OTP Input

**Steps:**

1. Signup on mobile
2. Try entering OTP

**Expected Result:**

- ✅ Numeric keyboard appears
- ✅ Inputs large enough to tap
- ✅ Paste works on mobile

## Debugging Tips

### View Auth State

```javascript
// In browser console
JSON.parse(localStorage.getItem('auth-storage'));
```

### View React Query Cache

```javascript
// React Query DevTools
// Bottom right corner of page when dev server running
```

### View Network Requests

```
Chrome DevTools → Network tab
Filter by XHR to see API calls
Check request/response for auth endpoints
```

### Check Backend Logs

```bash
# In backend terminal
# Should see POST /api/auth/login, /api/auth/signup, etc.
```

### Clear All Data and Start Fresh

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## Automated Testing (TODO)

These manual tests should eventually be automated:

```typescript
// tests/auth/login.spec.ts
describe('Login', () => {
  it('should login with valid credentials', () => {
    // Test implementation
  });

  it('should show error with invalid credentials', () => {
    // Test implementation
  });
});
```

## Performance Checks

- [ ] Login completes in < 2 seconds
- [ ] Signup completes in < 2 seconds
- [ ] OTP verification completes in < 1 second
- [ ] Dashboard loads in < 1 second after auth check
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] No unnecessary re-renders (use React DevTools Profiler)

## Security Checks

- [ ] Passwords not visible in network requests (should be sent over HTTPS in production)
- [ ] Tokens not exposed in URLs
- [ ] Protected routes actually protected
- [ ] Token refresh works correctly
- [ ] Session timeout works
- [ ] No sensitive data in localStorage (only tokens)

---

**Happy Testing! 🧪**

Report any issues you find with:

- Steps to reproduce
- Expected vs actual behavior
- Browser and device info
- Screenshots if applicable
