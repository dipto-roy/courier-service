# 🚀 Quick Start - Authentication System

## Start the Application

### 1. Start Backend (Terminal 1)

```bash
cd /home/dip-roy/courier-service
npm run start:dev
```

**Backend runs on**: http://localhost:3000

### 2. Start Frontend (Terminal 2)

```bash
cd /home/dip-roy/courier-service/frontend
npm run dev
```

**Frontend runs on**: http://localhost:3000 (or next available port)

## Test the Auth Flow (5 Minutes)

### Step 1: Signup (30 seconds)

1. Open http://localhost:3000/signup
2. Click "MERCHANT" role
3. Fill the form:
   ```
   Name: Test User
   Email: test@example.com
   Phone: 1234567890
   Password: password123
   Confirm Password: password123
   Business Name: Test Business
   Business Address: 123 Test St
   ```
4. Click "Sign Up"

**What happens:**

- Form submits to backend
- OTP sent to email (check backend logs for OTP code)
- Redirected to `/verify-otp` page

### Step 2: Verify OTP (20 seconds)

1. Check backend terminal logs for OTP code:
   ```
   [Nest] INFO OTP for test@example.com: 123456
   ```
2. Enter the 6-digit code in the OTP inputs
3. Click "Verify"

**What happens:**

- OTP verified
- Email marked as verified
- Redirected to `/dashboard`

### Step 3: Explore Dashboard (30 seconds)

1. You should now see the dashboard with:

   - Sidebar with navigation links
   - Header with your name and email
   - Stats cards (placeholder data)
   - Logout button

2. Click around to see role-based menu items

### Step 4: Test Logout (10 seconds)

1. Click "Logout" button in header
2. You should be redirected to `/login`
3. Try accessing `/dashboard` directly - should redirect to `/login`

### Step 5: Login (20 seconds)

1. On login page, enter:
   ```
   Email: test@example.com
   Password: password123
   ```
2. Click "Login"
3. You should be back in the dashboard

**Success! ✅** Authentication system is working.

## Common Issues & Solutions

### Issue: "Cannot connect to backend"

**Solution:**

```bash
# Check if backend is running
curl http://localhost:3000/api/health

# If not, start it:
cd /home/dip-roy/courier-service
npm run start:dev
```

### Issue: "Module not found" errors

**Solution:**

```bash
# Reinstall dependencies
cd /home/dip-roy/courier-service/frontend
rm -rf node_modules
npm install
```

### Issue: "Port already in use"

**Solution:**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Issue: "TypeScript errors in IDE"

**Solution:**

- Ignore false positives about module resolution
- Run `npm run type-check` to verify actual compilation
- Restart VS Code TypeScript server: Cmd+Shift+P → "Restart TS Server"

### Issue: "Can't see OTP code"

**Solution:**
Check backend terminal logs:

```bash
# Look for lines like:
[Nest] INFO OTP for user@email.com: 123456
```

### Issue: "Dashboard redirects to login immediately"

**Solution:**
Check browser localStorage:

```javascript
// In browser console
localStorage.getItem('auth-storage');
// Should contain user and tokens
```

If empty, login again. If still redirecting, check browser console for errors.

## Available Routes

### Public Routes (No Auth Required)

- `/login` - Login page
- `/signup` - Signup page
- `/verify-otp` - OTP verification (requires signup/login first)

### Protected Routes (Auth Required)

- `/dashboard` - Dashboard home
- `/dashboard/shipments` - Shipments (not implemented yet)
- `/dashboard/tracking` - Tracking (not implemented yet)
- `/dashboard/payments` - Payments - MERCHANT only (not implemented yet)
- `/dashboard/manifests` - Manifests - RIDER only (not implemented yet)
- `/dashboard/users` - Users - ADMIN only (not implemented yet)
- `/dashboard/hubs` - Hubs - ADMIN only (not implemented yet)

## Testing Different Roles

### Create MERCHANT Account

```
Role: MERCHANT
Requires: businessName, businessAddress
Access: Shipments, Payments, Tracking
```

### Create RIDER Account

```
Role: RIDER
No business fields
Access: Manifests, Tracking
```

### Create CUSTOMER Account

```
Role: CUSTOMER
No business fields
Access: Own shipments, Tracking
```

### Create ADMIN Account (via Database)

```sql
-- Run in PostgreSQL
UPDATE users
SET role = 'ADMIN'
WHERE email = 'test@example.com';
```

## Development Tools

### React Query DevTools

- Automatically available at bottom right of page
- Click to expand and see:
  - All queries
  - Query status
  - Cached data
  - Refresh queries

### Browser DevTools

```javascript
// Check auth state
JSON.parse(localStorage.getItem('auth-storage'));

// Check stored tokens
const state = JSON.parse(localStorage.getItem('auth-storage'));
console.log(state.state.accessToken);
```

### Network Tab

- Open DevTools → Network tab
- Filter by "Fetch/XHR"
- See all API calls:
  - `POST /auth/signup`
  - `POST /auth/verify-otp`
  - `POST /auth/login`
  - `POST /auth/logout`
  - `POST /auth/refresh` (automatic on token expiry)

## Next Steps

### Immediate Testing

- [ ] Test all signup roles (MERCHANT, RIDER, CUSTOMER)
- [ ] Test OTP resend functionality
- [ ] Test password visibility toggle
- [ ] Test form validation errors
- [ ] Test logout and re-login
- [ ] Test protected route redirects

### Next Feature: Shipments Module

Once auth is tested and working:

1. Implement shipment service
2. Create shipment forms
3. Build shipment list with filters
4. Add shipment details page

See `FRONTEND_ROADMAP.md` Phase 3 for details.

## Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check for linting errors
npm run lint:fix     # Fix linting errors
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript types

# Backend
npm run start:dev    # Start in development mode
npm run test         # Run tests
npm run test:e2e     # Run E2E tests

# Database
npm run migration:run     # Run pending migrations
npm run migration:revert  # Revert last migration
```

## Documentation

- `AUTH_MODULE_COMPLETE.md` - Full auth implementation details
- `TESTING_GUIDE.md` - Comprehensive testing scenarios
- `BUILD_STATUS.md` - Overall project status
- `FRONTEND_ROADMAP.md` - Complete implementation roadmap

---

**Need Help?**

1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify both servers are running
4. Clear localStorage and try again
5. Restart both servers

**Everything Working?** → Proceed to Phase 3: Shipments Module 🚀
