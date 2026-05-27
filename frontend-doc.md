# FastX Courier — Frontend Documentation

> **Tech Stack:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · Zustand 5 · TanStack React Query 5 · Socket.IO · Leaflet · Zod 4 · React Hook Form 7

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Directory Structure](#2-architecture--directory-structure)
3. [Configuration & Environment](#3-configuration--environment)
4. [Routing & Layouts](#4-routing--layouts)
5. [Common (Shared) Layer](#5-common-shared-layer)
6. [Feature Modules](#6-feature-modules)
7. [Service Layer (`src/services/`)](#7-service-layer-srcservices)
8. [UI Component Library](#8-ui-component-library)
9. [State Management](#9-state-management)
10. [Data Fetching & Caching](#10-data-fetching--caching)
11. [Real-Time (WebSocket)](#11-real-time-websocket)
12. [Authentication & Security](#12-authentication--security)
13. [Form Handling & Validation](#13-form-handling--validation)
14. [Theming & Styling](#14-theming--styling)
15. [File Inventory](#15-file-inventory)

---

## 1. Project Overview

FastX Courier frontend is a **production-ready** dashboard + public tracking application for Bangladesh's logistics industry. It supports **8 user roles** (Admin, Merchant, Agent, Hub Staff, Rider, Customer, Finance, Support) with role-based dashboards, real-time GPS tracking, shipment management, hub operations, payments/COD processing, notifications, and analytics.

### Key Capabilities

| Capability | Description |
|---|---|
| **Multi-Role Dashboard** | Role-based dashboards — Rider, Customer, Merchant each see different UIs |
| **Shipment CRUD** | Create single/bulk shipments, filter, sort, export, print labels/invoices |
| **Real-Time Tracking** | Live GPS map (Leaflet), WebSocket location & status updates |
| **Hub Operations** | Inbound/outbound scanning, manifest creation, sorting, handover |
| **Rider Workflow** | Manifest management, OTP-based delivery, COD collection, GPS tracking |
| **Payments** | COD dashboard, payout initiation, transaction history |
| **Notifications** | Multi-channel (email/SMS/push), real-time WebSocket, browser notifications |
| **Analytics** | Shipment stats, revenue metrics, performance metrics, report export |
| **Dark Mode** | Full dark/light/system theme support via `next-themes` |

### Scripts

```bash
npm run dev          # Start dev server on port 5000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
npm run format:check # Prettier check
npm run type-check   # TypeScript type check (no emit)
npm run clean        # Remove .next directory
```

---

## 2. Architecture & Directory Structure

The frontend follows a **feature-sliced architecture** with clear separation between shared code (`common/`), domain features (`features/`), and external service integrations (`services/`).

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (fonts, metadata, Providers)
│   ├── page.tsx                  # Landing page (hero, AWB tracking)
│   ├── globals.css               # Tailwind + theme CSS variables
│   ├── (auth)/                   # Auth route group
│   │   ├── layout.tsx            # Centered card layout
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── verify-otp/page.tsx
│   ├── (dashboard)/              # Protected dashboard route group
│   │   ├── layout.tsx            # Sidebar + Header + auth guard
│   │   ├── page.tsx              # Role-based dashboard router
│   │   ├── analytics/page.tsx
│   │   ├── hub/
│   │   │   ├── page.tsx          # Hub dashboard
│   │   │   ├── handover/page.tsx
│   │   │   ├── manifests/page.tsx
│   │   │   ├── manifests/[id]/page.tsx
│   │   │   ├── scan/page.tsx
│   │   │   └── sorting/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── payments/
│   │   │   ├── page.tsx          # Redirects → transactions
│   │   │   ├── cod/page.tsx
│   │   │   ├── payouts/page.tsx
│   │   │   └── transactions/page.tsx
│   │   ├── rider/
│   │   │   ├── page.tsx
│   │   │   ├── manifests/page.tsx
│   │   │   └── manifests/[id]/page.tsx
│   │   └── shipments/
│   │       ├── page.tsx          # List with filters + bulk upload
│   │       ├── [id]/page.tsx     # Shipment detail + print
│   │       └── create/page.tsx   # Multi-step form
│   ├── dashboard/                # Legacy dashboard route (same layout)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── track/                    # Public tracking (no auth)
│       ├── layout.tsx
│       └── [awb]/page.tsx        # GPS map + timeline + ETA + rider info
│
├── components/ui/                # shadcn/ui component library
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── scroll-area.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   └── textarea.tsx
│
├── lib/utils.ts                  # shadcn cn() utility
│
├── src/
│   ├── common/                   # Shared code across all features
│   │   ├── components/
│   │   │   ├── animations/       # FadeIn, SlideIn, ScaleIn, Stagger
│   │   │   ├── feedback/         # Loading, Skeleton, Empty, Error, Toast
│   │   │   ├── layout/           # Header, Sidebar, Footer
│   │   │   ├── theme/            # ThemeProvider, ThemeToggle
│   │   │   ├── providers.tsx     # Root provider composition
│   │   │   └── index.ts
│   │   ├── constants/index.ts    # API_BASE_URL, STATUS_COLORS, ROLE_LABELS, etc.
│   │   ├── hooks/useToast.tsx    # Toast notification context
│   │   ├── lib/
│   │   │   ├── apiClient.ts      # Axios with auth + CSRF interceptors
│   │   │   ├── eventBus.ts       # Pub/Sub event system
│   │   │   ├── queryClient.ts    # React Query config + query key factory
│   │   │   ├── socket.ts         # Socket.IO client service
│   │   │   ├── utils.ts          # 20+ helper functions
│   │   │   └── index.ts
│   │   ├── stores/               # (empty — reserved)
│   │   └── types/
│   │       ├── api.types.ts      # All shared TypeScript types & enums
│   │       └── index.ts
│   │
│   ├── features/                 # Feature-sliced domain modules
│   │   ├── analytics/            # Analytics & Reports
│   │   ├── auth/                 # Authentication
│   │   ├── hub/                  # Hub Operations
│   │   ├── notifications/        # Notification UI
│   │   ├── payments/             # Payment UI
│   │   ├── pickups/              # (empty — reserved)
│   │   ├── rider/                # Rider Workflow
│   │   ├── shipments/            # Shipment Management
│   │   ├── tracking/             # Real-Time Tracking
│   │   └── users/                # (empty — reserved)
│   │
│   └── services/                 # API service layer (shared across features)
│       ├── analytics/            # Analytics API + hooks
│       ├── hub/                  # Hub API + hooks
│       ├── notifications/        # Notification API + hooks
│       └── payments/             # Payment API + hooks
│
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── components.json               # shadcn/ui config
├── .env.example
└── .env.local
```

### Architectural Patterns

| Pattern | Implementation |
|---|---|
| **Feature-Sliced** | Each domain has `components/`, `hooks/`, `services/`, `stores/`, `types.ts` |
| **Barrel Exports** | Every directory has `index.ts` for clean imports |
| **Service Layer** | API calls isolated in service classes/objects |
| **Query Key Factory** | Centralized `queryKeys` object for consistent cache management |
| **Event Bus** | Loosely coupled cross-feature communication |
| **Provider Composition** | Single `<Providers>` wrapping QueryClient + Theme + Toast |
| **Protected Routes** | Client-side auth guard in dashboard layout |

---

## 3. Configuration & Environment

### Environment Variables (`.env.local`)

| Variable | Default Value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | Backend API base URL |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3001` | WebSocket server URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | — | Google Maps (optional, GPS tracking) |
| `NEXT_PUBLIC_APP_NAME` | `FastX Courier` | App display name |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Frontend URL |
| `NEXT_PUBLIC_ENABLE_NOTIFICATIONS` | `true` | Enable notification feature |
| `NEXT_PUBLIC_ENABLE_PUSH` | `true` | Enable push notifications |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `false` | Enable analytics tracking |
| `NEXT_PUBLIC_SENTRY_DSN` | — | Sentry error monitoring |
| `NEXT_PUBLIC_LOGROCKET_ID` | — | LogRocket session recording |

### TypeScript Config

- **Target:** ES2017
- **Strict mode:** enabled
- **Path alias:** `@/*` maps to root (e.g., `@/components/ui/button`)
- **Module resolution:** bundler
- **JSX:** react-jsx

### ESLint Config

- Extends `next/core-web-vitals` + `next/typescript` + `prettier`
- `@typescript-eslint/no-unused-vars`: warn (ignores `_` prefixed)
- `@typescript-eslint/no-explicit-any`: warn
- `no-console`: warn (allows `console.warn`, `console.error`)
- `prefer-const`: error
- `no-var`: error

### Prettier Config

- Semicolons, trailing commas (all), single quotes, 80 print width, 2-tab indent, arrow parens always, LF line endings

### shadcn/ui Config (`components.json`)

- Style: `new-york`
- Base color: `zinc`
- CSS variables: enabled
- Icon library: `lucide`
- RSC: enabled

---

## 4. Routing & Layouts

### Route Structure

| Route | Layout | Auth Required | Description |
|---|---|---|---|
| `/` | None | No | Landing page with hero, AWB tracking form, features |
| `/login` | `(auth)` | No | Login form |
| `/signup` | `(auth)` | No | Signup form with role selection |
| `/verify-otp` | `(auth)` | No | 6-digit OTP verification |
| `/dashboard` | `(dashboard)` | Yes | Role-based dashboard (Rider/Customer/Merchant/Default) |
| `/dashboard/shipments` | `(dashboard)` | Yes | Shipment list with filters, bulk upload, export |
| `/dashboard/shipments/create` | `(dashboard)` | Yes | Multi-step shipment creation |
| `/dashboard/shipments/[id]` | `(dashboard)` | Yes | Shipment detail with print actions |
| `/dashboard/analytics` | `(dashboard)` | Yes | Analytics tabs: Shipments, Revenue, Performance |
| `/dashboard/hub` | `(dashboard)` | Yes | Hub dashboard with manifest stats |
| `/dashboard/hub/scan` | `(dashboard)` | Yes | Inbound/outbound barcode scanning |
| `/dashboard/hub/manifests` | `(dashboard)` | Yes | Manifest list + creation tabs |
| `/dashboard/hub/manifests/[id]` | `(dashboard)` | Yes | Manifest detail with shipment list |
| `/dashboard/hub/sorting` | `(dashboard)` | Yes | Shipment sorting by destination |
| `/dashboard/hub/handover` | `(dashboard)` | Yes | Handover shipments to riders |
| `/dashboard/rider` | `(dashboard)` | Yes | Rider dashboard + location tracker |
| `/dashboard/rider/manifests` | `(dashboard)` | Yes | Rider's assigned manifests |
| `/dashboard/rider/manifests/[id]` | `(dashboard)` | Yes | Manifest detail + delivery actions |
| `/dashboard/payments` | `(dashboard)` | Yes | Redirects → `/payments/transactions` |
| `/dashboard/payments/transactions` | `(dashboard)` | Yes | Transaction history with filters |
| `/dashboard/payments/cod` | `(dashboard)` | Yes | COD dashboard (merchant-specific) |
| `/dashboard/payments/payouts` | `(dashboard)` | Yes | Payout form + payout history |
| `/dashboard/notifications` | `(dashboard)` | Yes | Notification list with stats |
| `/track/[awb]` | Track | No | Public shipment tracking (map + timeline) |

### Layout Details

**Root Layout (`app/layout.tsx`)**
- Loads Geist + Geist Mono fonts via `next/font/google`
- Wraps app in `<Providers>` (QueryClient + Theme + Toast)
- Sets metadata: "FastX Courier - Courier Management System"
- `suppressHydrationWarning` for theme hydration

**Auth Layout (`app/(auth)/layout.tsx`)**
- Centered card container (`max-w-md`)
- Branding header: "FastX Courier — Professional Courier Management System"
- Server Component (no `'use client'`)

**Dashboard Layout (`app/(dashboard)/layout.tsx`)**
- Client Component — handles auth state
- **Auth Guard:** Checks `isAuthenticated` + `user.isVerified`
  - Not authenticated → redirect `/login`
  - Not verified → redirect `/verify-otp`
  - Loading state during redirect
- **Layout structure:** Fixed Header (sticky top) + Fixed Sidebar (left 64px, hidden on mobile) + Main content area
- Sidebar toggle on mobile via `useState`

**Track Layout (`app/track/layout.tsx`)**
- Minimal: just passes through children
- Sets metadata for SEO: "Track Your Shipment - FastX Courier"

---

## 5. Common (Shared) Layer

### 5.1 Providers (`src/common/components/providers.tsx`)

Root provider composition:

```
<QueryClientProvider>
  <ThemeProvider (next-themes, attribute="class", system default)>
    <ToastProvider>
      {children}
    </ToastProvider>
  </ThemeProvider>
  <ReactQueryDevtools /> (dev only)
</QueryClientProvider>
```

### 5.2 Layout Components

**Header** (`src/common/components/layout/Header.tsx`)
- Sticky top bar with backdrop blur
- Logo: 📦 Courier Service
- Actions: Theme toggle, Notification bell, User dropdown (Profile, Settings, Logout)
- Mobile: hamburger menu button

**Sidebar** (`src/common/components/layout/Sidebar.tsx`)
- Fixed left sidebar (width: 64 = 256px)
- 10 navigation items: Dashboard, Shipments, Tracking, Rider, Hub, Users, Payments, Notifications, Analytics, Settings
- Active state: primary color highlight
- Mobile: overlay + slide-in transition
- Icons from Lucide React

**Footer** (`src/common/components/layout/Footer.tsx`)
- 4-column grid: Company info + social, Quick Links, Support, Contact
- Bottom bar: copyright

### 5.3 Animation Components

| Component | Description |
|---|---|
| `FadeIn` | Opacity animation with configurable delay/duration |
| `SlideIn` | Slide from up/down/left/right with fade |
| `ScaleIn` | Scale from 0.9 to 1 with fade |
| `Stagger` | Container that staggers children animations |
| `StaggerItem` | Individual stagger child (opacity + y transform) |

All powered by **Framer Motion**.

### 5.4 Feedback Components

| Component | Description |
|---|---|
| `Loading` | Spinner with optional text, sizes (sm/md/lg), fullScreen mode |
| `Skeleton` | Animated pulse placeholder |
| `CardSkeleton` | Card-shaped skeleton |
| `TableSkeleton` | Table row skeletons |
| `ListSkeleton` | Avatar + text list skeletons |
| `Empty` | Empty state with icon, title, description, optional action button |
| `EmptyShipments` | Pre-configured empty state for shipments |
| `EmptySearch` | Pre-configured empty state for search results |
| `EmptyData` | Generic empty data state |
| `ErrorBoundary` | React error boundary with fallback UI |
| `ErrorFallback` | Error display with retry button |
| `Error` | Simple inline error display |
| `FieldError` | Form field validation error with icon |
| `Toast` | Notification toast (default/success/error/warning) |
| `ToastContainer` | Fixed position toast stack |

### 5.5 Theme Components

| Component | Description |
|---|---|
| `ThemeProvider` | Wrapper around `next-themes` ThemeProvider |
| `ThemeToggle` | Dropdown: Light / Dark / System |
| `SimpleThemeToggle` | Single button toggle (dark ↔ light) |

### 5.6 API Client (`src/common/lib/apiClient.ts`)

Axios instance with:

- **Base URL:** `NEXT_PUBLIC_API_URL`
- **Credentials:** `withCredentials: true`
- **Request Interceptor:**
  - Injects `Authorization: Bearer <accessToken>` from localStorage
  - Fetches and injects CSRF token (`x-csrf-token` header) for non-GET requests
- **Response Interceptor:**
  - On 401: attempts token refresh via `POST /auth/refresh`
  - On refresh success: retries original request with new token
  - On refresh failure: emits `auth:logout` event, clears localStorage

### 5.7 Event Bus (`src/common/lib/eventBus.ts`)

Custom pub/sub system for cross-feature communication.

**Methods:** `on()`, `once()`, `emit()`, `off()`, `clear()`, `getEvents()`, `hasSubscribers()`

**Pre-defined Events:**

| Category | Events |
|---|---|
| Auth | `auth:login`, `auth:logout`, `auth:token_refresh`, `auth:session_expired` |
| Notification | `notification:new`, `notification:read`, `notification:clear_all` |
| Shipment | `shipment:created`, `shipment:updated`, `shipment:status_changed` |
| Tracking | `tracking:location_update`, `tracking:status_update` |

### 5.8 Query Client (`src/common/lib/queryClient.ts`)

TanStack React Query configuration:

| Setting | Value |
|---|---|
| `staleTime` | 5 minutes |
| `gcTime` | 10 minutes |
| `retry` | 3 (queries), 1 (mutations) |
| `retryDelay` | Exponential backoff (max 30s) |
| `refetchOnWindowFocus` | Production only |
| `refetchOnReconnect` | true |
| `refetchOnMount` | true |

**Query Key Factory** (`queryKeys`):
- `auth.user`, `auth.session`
- `shipments.all`, `shipments.lists()`, `shipments.list(filters)`, `shipments.detail(id)`, `shipments.byAwb(awb)`
- `tracking.detail(awb)`, `tracking.history(awb)`, `tracking.locations(awb)`, `tracking.eta(awb)`
- `rider.manifests(status?)`, `rider.manifest(id)`, `rider.shipments(status?)`, `rider.statistics()`
- `hub.manifests(filters?)`, `hub.manifest(id)`, `hub.statistics(hubLocation?)`
- `users.list(filters)`, `users.detail(id)`
- `payments.transactions(filters?)`, `payments.pendingCollections(merchantId)`, `payments.pendingBalance(merchantId)`, `payments.merchantStats(merchantId?)`, `payments.overallStats()`
- `notifications.all`, `notifications.unread()`, `notifications.count()`

### 5.9 Socket Service (`src/common/lib/socket.ts`)

Socket.IO client singleton with:

- **Connection:** `io(SOCKET_URL, { auth: { token }, transports: ['websocket'] })`
- **Reconnection:** auto, max 5 attempts, 1-5s delay
- **Tracking:** `subscribeToTracking(awb)` / `unsubscribeFromTracking(awb)`
- **Notifications:** `subscribeToNotifications(userId)` / `unsubscribeFromNotifications()`
- **Generic:** `emit()`, `on()`, `off()`, `isConnected()`

### 5.10 Utility Functions (`src/common/lib/utils.ts`)

| Function | Description |
|---|---|
| `cn(...inputs)` | Tailwind class merge (clsx + tailwind-merge) |
| `formatCurrency(amount)` | BDT formatting with Intl.NumberFormat |
| `formatDate(date, format?)` | Date formatting via date-fns |
| `formatDateTime(date, format?)` | Date + time formatting |
| `formatRelativeTime(date)` | "2 hours ago" via date-fns |
| `formatPhoneNumber(phone)` | BD phone format (+880 / 0XXXX) |
| `formatWeight(weight)` | "X.XX kg" |
| `truncate(text, length?)` | Truncate with ellipsis |
| `capitalize(text)` | Capitalize first letter |
| `getInitials(name)` | "AB" from "Alice Bob" |
| `sleep(ms)` | Async delay |
| `debounce(fn, wait)` | Debounce function calls |
| `generateId()` | Random base-36 ID |
| `isEmpty(value)` | Null/empty check (string, array, object) |
| `downloadFile(url, filename)` | Trigger browser file download |
| `copyToClipboard(text)` | Clipboard API wrapper |
| `formatFileSize(bytes)` | "5.2 MB" |
| `parseErrorMessage(error)` | Extract message from Axios/API errors |

### 5.11 Constants (`src/common/constants/index.ts`)

| Constant | Value |
|---|---|
| `API_BASE_URL` | `NEXT_PUBLIC_API_URL` or `http://localhost:3000/api` |
| `SOCKET_URL` | `NEXT_PUBLIC_SOCKET_URL` or `http://localhost:3000` |
| `APP_NAME` | `NEXT_PUBLIC_APP_NAME` or `FastX Courier` |
| `DEFAULT_PAGE_SIZE` | 20 |
| `MAX_PAGE_SIZE` | 100 |
| `MAX_FILE_SIZE` | 5MB |
| `ALLOWED_IMAGE_TYPES` | `['image/jpeg', 'image/png', 'image/jpg']` |
| `DATE_FORMAT` | `'MMM dd, yyyy'` |
| `DATETIME_FORMAT` | `'MMM dd, yyyy hh:mm a'` |
| `STATUS_COLORS` | Map of 8 shipment statuses → Tailwind colors |
| `ROLE_LABELS` | Map of 8 roles → display labels |
| `STORAGE_KEYS` | `accessToken`, `refreshToken`, `user`, `theme` |

### 5.12 Types (`src/common/types/api.types.ts`)

**Enums:**
- `UserRole` — admin, merchant, agent, hub_staff, rider, customer, finance, support
- `ShipmentStatus` — PENDING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED, RETURNED, CANCELLED
- `PaymentStatus` — PENDING, COMPLETED, FAILED, REFUNDED
- `ManifestStatus` — PENDING, ASSIGNED, IN_PROGRESS, COMPLETED
- `NotificationType` — INFO, SUCCESS, WARNING, ERROR

**Core Interfaces:**
- `User`, `Merchant` (extends User), `Rider` (extends User)
- `AuthResponse`, `LoginRequest`, `SignupRequest`, `VerifyOTPRequest`
- `Shipment`, `CreateShipmentRequest`, `BulkShipmentRequest`, `ShipmentFilters`
- `TrackingLocation`, `TrackingEvent`, `TrackingDetails`, `TrackingInfo`, `LocationUpdate`
- `Manifest`, `CreateManifestRequest`
- `Payment`, `CODCollection`, `Payout`
- `Notification`
- `PaginationMeta`, `PaginatedResponse<T>`, `ApiResponse<T>`, `ApiError`
- `DashboardStats`, `RevenueStats`, `RiderPerformance`
- `SelectOption`, `FileUpload`
- `SocketEvent<T>`, `LocationUpdateEvent`, `StatusUpdateEvent`

---

## 6. Feature Modules

Each feature follows the pattern:

```
feature-name/
├── components/     # React components
│   └── index.ts    # Barrel exports
├── containers/     # Container components (if any)
├── hooks/          # React Query hooks + custom hooks
│   └── index.ts
├── services/       # API service methods
│   └── index.ts
├── stores/         # Zustand stores (if any)
│   └── index.ts
└── types.ts        # Zod schemas + TypeScript types
```

### 6.1 Auth Feature (`src/features/auth/`)

**Components:**

| Component | Description |
|---|---|
| `LoginForm` | Email + password form with Zod validation, show/hide password toggle, back link |
| `SignupForm` | Multi-field form: role selection (Merchant/Rider/Customer), name, email, phone, password, city/area/address, merchant business name (conditional) |
| `OTPInput` | 6-digit input with auto-focus, paste support, verify + resend functionality |

**Hooks:**

| Hook | Type | API Endpoint | Behavior |
|---|---|---|---|
| `useLogin()` | Mutation | `POST /auth/login` | Stores auth → redirect to `/dashboard` or `/verify-otp` |
| `useSignup()` | Mutation | `POST /auth/signup` | Stores auth → redirect to `/verify-otp` |
| `useVerifyOTP()` | Mutation | `POST /auth/verify-otp` | Updates user.isVerified → redirect to `/dashboard` |
| `useResendOTP()` | Mutation | `POST /auth/resend-otp` | Sends new OTP to email |
| `useAuth()` | — | — | Returns `{ user, accessToken, isAuthenticated, isVerified, logout() }` |

**Service (`auth.service.ts`):**

| Method | Endpoint |
|---|---|
| `login(credentials)` | `POST /auth/login` |
| `signup(userData)` | `POST /auth/signup` |
| `verifyOTP(otpData)` | `POST /auth/verify-otp` |
| `refreshToken(token)` | `POST /auth/refresh` |
| `logout()` | `POST /auth/logout` |
| `getCurrentUser()` | `GET /auth/me` |
| `resendOTP(email)` | `POST /auth/resend-otp` |

**Store (`authStore.ts`):**
- Zustand with `persist` middleware (localStorage)
- State: `user`, `accessToken`, `refreshToken`, `isAuthenticated`
- Actions: `setAuth()`, `setUser()`, `updateTokens()`, `logout()`, `clearAuth()`
- Emits events: `auth:login`, `auth:logout`, `auth:token_refresh`
- Listens: `auth:session_expired` → auto logout

---

### 6.2 Shipments Feature (`src/features/shipments/`)

**Components:**

| Component | Description |
|---|---|
| `ShipmentForm` | 3-step wizard: Sender → Receiver → Package. Uses `useCreateShipment` |
| `AddressForm` | Reusable address form: name, phone, email, address lines, city, state, postal code, landmark |
| `PackageDetailsForm` | Weight, dimensions, description, quantity, invoice value, COD amount, special instructions |
| `ShipmentList` | Responsive grid (1/2/3 cols), card-based with smart pagination |
| `ShipmentCard` | AWB, receiver info, city, date, fees, COD, status badge, link to detail |
| `ShipmentDetails` | Comprehensive view: header, payment info, sender/receiver details, package details |
| `ShipmentFilters` | Search (AWB/name), status, payment method, service type, date range, sort by/order |
| `StatusBadge` | Maps 8 statuses to colored badges |
| `BulkUploadDialog` | Dialog: download template, CSV upload, validation, preview, bulk create |
| `CSVUploader` | Drag-and-drop CSV upload via react-dropzone |
| `ValidationPreview` | Table preview of parsed bulk upload data (max 10 rows) |
| `ErrorList` | Scrollable list of validation errors with row/field info |
| `PrintLabelButton` | Downloads/prints shipping label PDF |
| `PrintInvoiceButton` | Downloads invoice PDF |

**Hooks:**

| Hook | Type | API Endpoint |
|---|---|---|
| `useShipments(filters?)` | Query | `GET /shipments` (stale: 30s) |
| `useShipment(id)` | Query | `GET /shipments/:id` |
| `useShipmentByAwb(awb)` | Query | `GET /shipments/awb/:awb` |
| `useShipmentStatistics()` | Query | `GET /shipments/statistics` (stale: 60s, refetch: 60s) |
| `useCreateShipment()` | Mutation | `POST /shipments` → invalidates lists |
| `useUpdateShipment(id)` | Mutation | `PATCH /shipments/:id` |
| `useCancelShipment()` | Mutation | `POST /shipments/:id/cancel` |
| `useDeleteShipment()` | Mutation | `DELETE /shipments/:id` |
| `useBulkUpload()` | Mutation | `POST /shipments/bulk` → returns `{success[], failed[]}` |
| `useDownloadTemplate()` | Mutation | `GET /shipments/template` → auto-download CSV |
| `useExportShipments()` | Mutation | `GET /shipments/export` → auto-download CSV |
| `usePriceCalculator()` | Mutation | `POST /shipments/calculate-price` → breakdown |
| `useDownloadLabel(id)` | Mutation | `GET /shipments/:id/label` → PDF |
| `useDownloadLabels(ids)` | Mutation | `POST /shipments/labels` → PDF |
| `useDownloadInvoice(id)` | Mutation | `GET /shipments/:id/invoice` → PDF |
| `usePrintLabel(id)` | Mutation | Download + open print window |

**Types (Zod Schemas):**
- `addressSchema` — name, phone, email?, addressLine1, addressLine2?, city, state, postalCode, country, landmark?
- `packageDetailsSchema` — weight, length?, width?, height?, description, quantity, invoiceValue?
- `createShipmentSchema` — sender, receiver, package, pickupHubId, deliveryHubId, paymentMethod (PREPAID/COD), codAmount?, serviceType (STANDARD/EXPRESS/SAME_DAY), specialInstructions?, isFragile, requiresSignature
- `createShipmentSchemaWithRefinements` — validates COD amount when payment method is COD
- `bulkShipmentRowSchema` — flat CSV row format
- `shipmentFiltersSchema` — status, search, dateFrom, dateTo, paymentMethod, serviceType, page, limit, sortBy, sortOrder
- `updateShipmentSchema` — partial receiver, partial package, specialInstructions?, deliveryHubId?
- `priceCalculationSchema` — pickupHubId, deliveryHubId, weight, dimensions?, serviceType

---

### 6.3 Tracking Feature (`src/features/tracking/`)

**Components:**

| Component | Description |
|---|---|
| `TrackingMap` | Dynamic import wrapper for `TrackingMapInner` (SSR disabled) |
| `TrackingMapInner` | Leaflet map: rider location (blue icon), destination (red icon), route polyline, auto-center |
| `StatusTimeline` | Vertical timeline: colored status icons, event descriptions, location, hub/rider names, timestamps |
| `ETADisplay` | Shows estimated delivery time, distance, remaining stops |
| `RiderInfoCard` | Rider avatar, name, rating, vehicle details, call + WhatsApp buttons |

**Hooks:**

| Hook | Type | Cache/Refresh |
|---|---|---|
| `useTracking(awb)` | Query | Stale: 20s, Refetch: 30s |
| `useTrackingHistory(awb)` | Query | Timeline events |
| `useLocationUpdates(awb)` | Query | Stale: 10s, Refetch: 10s |
| `useETA(awb)` | Query | Stale: 60s, Refetch: 60s |
| `useTrackingSocket(awb)` | WebSocket | Live location, status, rider events |
| `useShareTracking(awb)` | Mutation | Share link via email/SMS |

**WebSocket Events (via `useTrackingSocket`):**
- `tracking:{awb}:location` — live rider location
- `tracking:{awb}:status` — shipment status change
- `tracking:{awb}:rider` — rider info update

**Public Tracking Page (`/track/[awb]`):**
- No authentication required
- Shows: header with AWB, live status badge, share button
- Layout: GPS map (left) + sidebar: status badge, shipment info, ETA, rider info, timeline
- Web Share API support for sharing tracking links
- Responsive for mobile

---

### 6.4 Rider Feature (`src/features/rider/`)

**Components:**

| Component | Description |
|---|---|
| `RiderDashboard` | Stats cards (Total/Completed/Pending/Failed), COD summary, performance metrics (success rate, on-time rate, distance, avg delivery time) |
| `ManifestList` | Filtered list (All/Pending/In Progress/Completed) with ManifestCard |
| `ManifestCard` | Manifest number, hub, type icon, status badge, progress bar, dates, action buttons (Start/View/Complete) |
| `DeliveryActionButtons` | Context-aware buttons for delivery states → opens OTP/Failed/COD dialogs |
| `OTPDialog` | Generate OTP → display → customer enters OTP → complete delivery with receiver name + remarks |
| `FailedDeliveryDialog` | Reason selection (5 options), additional details, reschedule warning |
| `CODCollectionDialog` | Expected amount, collected amount, payment method (Cash/Card/Mobile Banking), transaction ID, remarks |
| `LocationTracker` | GPS permission status, current coordinates, battery level/charging, start/stop tracking, sync feedback |

**Hooks:**

| Hook | Type | API Endpoint |
|---|---|---|
| `useManifests(status?)` | Query | `GET /rider/manifests` (stale: 2min) |
| `useManifest(id)` | Query | `GET /rider/manifests/:id` |
| `useShipments(status?)` | Query | `GET /rider/shipments` (stale: 2min) |
| `useShipment(awb)` | Query | `GET /rider/shipments/:awb` (stale: 1min) |
| `useRiderStats()` | Query | `GET /rider/statistics` (refetch: 5min) |
| `useLocationHistory(limit?)` | Query | `GET /rider/location-history` (stale: 5min) |
| `useStartManifest()` | Mutation | `POST /rider/manifests/:id/start` |
| `useCompleteManifest()` | Mutation | `POST /rider/manifests/:id/complete` |
| `useCollectCOD()` | Mutation | `POST /rider/collect-cod` |
| `useGenerateOTP(awb)` | Mutation | `POST /rider/generate-otp` |
| `useCompleteDelivery(data)` | Mutation | `POST /rider/complete-delivery` |
| `useFailDelivery(data)` | Mutation | `POST /rider/failed-delivery` |
| `useMarkRTO(data)` | Mutation | `POST /rider/mark-rto` |
| `useLocationTracking()` | — | Geolocation API + `POST /rider/update-location` |

**Location Tracking (`useLocationTracking`):**
- Browser Geolocation API (high accuracy)
- Battery Manager API (level + charging status)
- Interval-based updates (default 30s)
- Permission request handling
- Cleanup on unmount

**Types (Zod Schemas):**
- `locationUpdateSchema`, `generateOTPSchema`, `completeDeliverySchema`, `failedDeliverySchema`, `codCollectionSchema`
- Enum: `FailedDeliveryReason` (CUSTOMER_NOT_AVAILABLE, WRONG_ADDRESS, CUSTOMER_REFUSED, PAYMENT_ISSUE, OTHER)
- Interfaces: `RiderManifest`, `ManifestShipment`, `RiderDelivery`, `RiderStats`, `RiderEarnings`

---

### 6.5 Hub Feature (`src/features/hub/`)

> **Note:** Hub feature has components only — hooks and services live in `src/services/hub/`.

**Components:**

| Component | Description |
|---|---|
| `HubDashboard` | Stats cards (Total/Created/In Transit/Received/Closed manifests), quick actions, status distribution bars |
| `ManifestList` | Manifest cards with status badges, origin/destination, shipment counts, dates, pagination |
| `ManifestDetails` | Route display, shipment list, status timeline (Created → Dispatched → Received → Closed), receive button |
| `ManifestCreation` | Form: origin hub, destination hub, rider ID (optional), notes, AWB scanning |
| `Scanner` | Manual AWB entry (regex: `^[A-Z]{3}\d{10}$`), duplicate detection, scan history, status counters |
| `SortingInterface` | Destination selection, batch display, sort button, recently sorted batches |
| `HandoverList` | Rider assignment, AWB scanning, handover button, recent handover history |

---

### 6.6 Payments Feature (`src/features/payments/`)

**Components:**

| Component | Description |
|---|---|
| `CODDashboard` | Wallet balance, pending balance, COD collected, collection rate, pending collections list |
| `PayoutForm` | Payout amount, payment method, description — validates with Zod |
| `TransactionHistory` | Table with search, filters by type/status/payment method, export button |

---

### 6.7 Notifications Feature (`src/features/notifications/`)

**Components:**

| Component | Description |
|---|---|
| `NotificationBell` | Header bell icon with unread count badge, dropdown list |
| `NotificationItem` | Individual card: type icon, title, message, timestamp, mark-as-read/delete actions |
| `NotificationList` | Scrollable list with "mark all as read", loading/empty states |
| `NotificationStats` | 4 stat cards: total, email, SMS, push with success rates |

---

### 6.8 Analytics Feature (`src/features/analytics/`)

**Components:**

| Component | Description |
|---|---|
| `AnalyticsFilterBar` | Period selector (today/week/month/year), date range calculation, reset |
| `MetricCard` | Reusable card: title, value, icon, trend indicator, color variants, loading state |
| `ShipmentAnalytics` | 6 metric cards (total, pending, in-transit, delivered, cancelled, returned) + status breakdown |
| `RevenueAnalytics` | Revenue metrics (total, COD, delivery fees, avg order value, today/week/month), trend placeholder |
| `PerformanceAnalytics` | Success rate, avg delivery time, on-time rate, total deliveries, failed, customer rating, top 5 riders table |
| `ExportReport` | Report type selector (shipment/revenue/performance/COD), format (CSV/PDF/Excel), export handler |

---

### 6.9 Reserved Features

- **`pickups/`** — Empty (reserved for pickup request management)
- **`users/`** — Empty (reserved for user management admin panel)

---

## 7. Service Layer (`src/services/`)

The service layer provides API integration + React Query hooks for features that share services across modules.

### 7.1 Analytics Service (`src/services/analytics/`)

**API Methods:**

| Method | Endpoint | Description |
|---|---|---|
| `getDashboard()` | `GET /analytics/dashboard` | Dashboard overview |
| `getShipmentStatistics()` | `GET /shipments/statistics` | Shipment counts by status |
| `getRevenueStatistics()` | `GET /payments/statistics/overall` | Overall revenue |
| `getMerchantRevenue(id)` | `GET /payments/statistics/merchant/:id` | Per-merchant revenue |
| `getPerformanceMetrics()` | `GET /analytics/performance` | KPIs and delivery metrics |
| `getCODStatistics()` | `GET /payments/cod/statistics` | COD collection stats |
| `exportReport(options)` | `POST /analytics/export` | Generate report file |
| `downloadReport(url)` | `GET <url>` | Download report blob |
| `getShipmentTrends()` | `GET /analytics/trends/shipments` | Time-series data |
| `getRevenueTrends()` | `GET /analytics/trends/revenue` | Revenue time-series |
| `getTopRiders()` | `GET /analytics/top-riders` | Top performer list |
| `getHubStatistics()` | `GET /analytics/hubs` | Hub-level stats |

**React Query Hooks:**
- `useAnalyticsDashboard()`, `useShipmentStatistics()`, `useRevenueStatistics()`, `useMerchantRevenue(merchantId)`, `usePerformanceMetrics()`, `useCODStatistics()`, `useShipmentTrends()`, `useRevenueTrends()`, `useTopRiders()`
- `useExportReport()`, `useDownloadReport()` (mutations)

**Types:** `MetricPeriod`, `ReportType`, `ExportFormat`, `ShipmentStatistics`, `RevenueStatistics`, `PerformanceMetrics`, `CODStatistics`, `AnalyticsDashboard`, `TrendData`, `TopPerformer`

---

### 7.2 Hub Service (`src/services/hub/`)

**API Methods:**

| Method | Endpoint | Description |
|---|---|---|
| `inboundScan(data)` | `POST /hub/inbound-scan` | Scan arriving shipments |
| `outboundScan(data)` | `POST /hub/outbound-scan` | Scan departing shipments |
| `sortShipments(data)` | `POST /hub/sorting` | Sort by destination |
| `createManifest(data)` | `POST /hub/manifests` | Create transfer manifest |
| `getManifests(filters?)` | `GET /hub/manifests` | List manifests |
| `getManifestById(id)` | `GET /hub/manifests/:id` | Get manifest detail |
| `getManifestStatistics(hub?)` | `GET /hub/manifests/statistics` | Stats by hub |
| `receiveManifest(id, data)` | `POST /hub/manifests/:id/receive` | Receive manifest |

**React Query Hooks:**
- Queries: `useManifests(filters)`, `useManifest(id)`, `useManifestStats(hubLocation?, refetchInterval)`
- Mutations: `useInboundScan()`, `useOutboundScan()`, `useSortShipments()`, `useCreateManifest()`, `useReceiveManifest()`

**Types:** `ManifestStatus` (CREATED, IN_TRANSIT, RECEIVED, CLOSED), `HubShipment`, `HubManifest`, `ScanResult`, `SortingResult`, `ManifestStatistics`

---

### 7.3 Notifications Service (`src/services/notifications/`)

**API Methods:**

| Method | Endpoint | Role |
|---|---|---|
| `getMyNotifications(isRead?)` | `GET /notifications/my-notifications` | User |
| `getUnreadCount()` | `GET /notifications/unread-count` | User |
| `markAsRead(id)` | `PATCH /notifications/:id/read` | User |
| `markAllAsRead()` | `PATCH /notifications/mark-all-read` | User |
| `deleteNotification(id)` | `DELETE /notifications/:id` | User |
| `getUserNotifications(userId)` | `GET /notifications/user/:userId` | Admin |
| `getStatistics()` | `GET /notifications/statistics` | Admin |
| `sendNotification(data)` | `POST /notifications` | Admin/Support |
| `sendEmail(data)` | `POST /notifications/email` | Admin/Support |
| `sendSms(data)` | `POST /notifications/sms` | Admin/Support |
| `sendPush(data)` | `POST /notifications/push` | Admin/Support |

**React Query Hooks:**
- Queries: `useNotifications(isRead?)`, `useUnreadCount()` (refetch: 30s), `useUserNotifications(userId)`, `useNotificationStatistics()`
- Mutations: `useMarkAsRead()`, `useMarkAllAsRead()`, `useDeleteNotification()`, `useSendNotification()`, `useSendEmail()`, `useSendSms()`, `useSendPush()`
- WebSocket: `useNotificationSocket()` — listens for `notification:new`, `notification:read`, `notification:deleted`
- Browser: `requestNotificationPermission()`, `showBrowserNotification()`

**Types:** `NotificationType` (EMAIL, SMS, WHATSAPP, PUSH), `Notification`, `NotificationStatistics`, `UnreadCountResponse`

---

### 7.4 Payments Service (`src/services/payments/`)

**API Methods:**

| Method | Endpoint | Description |
|---|---|---|
| `recordCodCollection(shipmentId)` | `POST /payments/record-cod/:id` | Record COD collection |
| `recordDeliveryFee(shipmentId)` | `POST /payments/record-delivery-fee/:id` | Record delivery fee |
| `initiatePayout(data)` | `POST /payments/initiate-payout` | Create payout request |
| `completePayout(id, ref?)` | `PATCH /payments/payouts/:id/complete` | Complete payout |
| `failPayout(id, reason)` | `PATCH /payments/payouts/:id/fail` | Fail payout |
| `getTransactions(filters?)` | `GET /payments/transactions` | List transactions |
| `getTransaction(id)` | `GET /payments/transactions/:id` | Single transaction |
| `getPendingCollections(merchantId)` | `GET /payments/pending-collections/:id` | Pending COD collections |
| `getPendingBalance(merchantId)` | `GET /payments/pending-balance/:id` | Pending balance |
| `getMerchantStatistics(merchantId)` | `GET /payments/statistics/merchant/:id` | Merchant-level stats |
| `getOverallStatistics()` | `GET /payments/statistics/overall` | Overall payment stats |

**Payout Rule:** T+7 eligibility — collections older than 7 days

**React Query Hooks:**
- Queries: `useTransactions(filters)`, `useTransaction(id)`, `usePendingCollections(merchantId)`, `usePendingBalance(merchantId)`, `useMerchantStatistics(merchantId)`, `useOverallStatistics()`
- Mutations: `useRecordCOD()`, `useRecordDeliveryFee()`, `useInitiatePayout()`, `useCompletePayout()`, `useFailPayout()`

**Types:** `TransactionType`, `PaymentStatus`, `PaymentMethod`, `Transaction`, `PaymentStatistics`, `OverallStatistics`, `TransactionsResponse`

---

## 8. UI Component Library

Built with **shadcn/ui** (New York style, zinc base) on **Radix UI** primitives:

| Component | File | Features |
|---|---|---|
| `Badge` | `components/ui/badge.tsx` | 6 variants: default, secondary, destructive, outline, success, warning |
| `Button` | `components/ui/button.tsx` | 6 variants × 6 sizes, `asChild` prop (Slot), accessible focus states |
| `Card` | `components/ui/card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter |
| `Dialog` | `components/ui/dialog.tsx` | Full Radix Dialog: overlay, close button, header/footer, animated |
| `DropdownMenu` | `components/ui/dropdown-menu.tsx` | Menu, items, checkboxes, radio groups, submenus, separators, shortcuts |
| `Input` | `components/ui/input.tsx` | Standard input with focus/error states |
| `Label` | `components/ui/label.tsx` | Form label with peer-disabled support |
| `ScrollArea` | `components/ui/scroll-area.tsx` | Custom scrollbar via Radix |
| `Select` | `components/ui/select.tsx` | Full Radix Select: trigger, content, items, groups, separators |
| `Table` | `components/ui/table.tsx` | Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption |
| `Tabs` | `components/ui/tabs.tsx` | Radix Tabs: list, trigger, content |
| `Textarea` | `components/ui/textarea.tsx` | Multi-line input |

Also: `lib/utils.ts` provides `cn()` for Tailwind class merging.

---

## 9. State Management

### Zustand Store — Auth (`src/features/auth/stores/authStore.ts`)

**Middleware:** `persist` → localStorage (`auth-storage` key)

| State | Type | Description |
|---|---|---|
| `user` | `User \| null` | Current user object |
| `accessToken` | `string \| null` | JWT access token |
| `refreshToken` | `string \| null` | JWT refresh token |
| `isAuthenticated` | `boolean` | Auth status flag |

| Action | Description |
|---|---|
| `setAuth(user, accessToken, refreshToken)` | Set all auth state + localStorage + emit `auth:login` |
| `setUser(user)` | Update user only |
| `updateTokens(accessToken, refreshToken)` | Update tokens + localStorage + emit `auth:token_refresh` |
| `logout()` | Clear all state + localStorage + emit `auth:logout` |
| `clearAuth()` | Clear state without events |

**Auto-listeners:** `auth:session_expired` event → auto logout

### Server State — React Query

All server state (shipments, tracking, analytics, payments, notifications, hub, rider) is managed via **TanStack React Query** with the centralized `queryKeys` factory. No additional Zustand stores needed for server data.

---

## 10. Data Fetching & Caching

### Cache Strategy by Feature

| Feature | Stale Time | Refetch Interval | GC Time |
|---|---|---|---|
| Shipments List | 30s | — | 10min (default) |
| Shipment Detail | 5min (default) | — | 10min |
| Shipment Statistics | 60s | 60s | 10min |
| Tracking | 20s | 30s | 10min |
| Location Updates | 10s | 10s | 10min |
| ETA | 60s | 60s | 10min |
| Rider Manifests | 2min | — | 10min |
| Rider Statistics | — | 5min | 10min |
| Hub Manifest Stats | — | 5min | 10min |
| Unread Notifications | 10s | 30s | 10min |
| Analytics (all) | 2-5min | — | 10min |

### Query Invalidation Patterns

- **Create shipment** → invalidates `shipments.lists()`
- **Update/cancel shipment** → invalidates `shipments.detail(id)` + `shipments.lists()`
- **Complete delivery** → invalidates `rider.shipments`, `rider.manifests`, `rider.statistics`
- **Collect COD** → invalidates `rider.shipments`, `rider.statistics`
- **Hub scan/sort** → invalidates `hub.manifests`, `hub.statistics`
- **Mark notification read** → invalidates `notifications.all`, `notifications.unread`
- **Payout** → invalidates `payments.transactions`, `payments.overallStats`, `payments.merchantStats`

---

## 11. Real-Time (WebSocket)

### Connection

```typescript
socketService.connect(accessToken);
// Uses Socket.IO with WebSocket transport, auto-reconnection (max 5 attempts)
```

### Tracking Events

| Event | Data | Description |
|---|---|---|
| `tracking:{awb}:location` | `{ latitude, longitude, speed, accuracy }` | Rider GPS update |
| `tracking:{awb}:status` | `{ status, description, timestamp }` | Status change |
| `tracking:{awb}:rider` | `{ name, phone, vehicleType }` | Rider info |

### Notification Events

| Event | Data | Description |
|---|---|---|
| `notification:new` | `Notification` object | New notification |
| `notification:read` | `{ id }` | Notification marked read |
| `notification:deleted` | `{ id }` | Notification deleted |

### Hooks

- `useTrackingSocket(awb)` — subscribes to tracking events, returns `{ location, rider, isConnected }`
- `useNotificationSocket()` — subscribes to notification events, manages browser notifications

---

## 12. Authentication & Security

### Auth Flow

```
1. User signs up → POST /auth/signup → stores JWT tokens → redirect /verify-otp
2. User verifies OTP → POST /auth/verify-otp → user.isVerified = true → redirect /dashboard
3. User logs in → POST /auth/login → stores JWT tokens
   → if verified → /dashboard
   → if not verified → /verify-otp
4. Token expires → interceptor catches 401 → POST /auth/refresh → retries original request
5. Refresh fails → clears auth → redirect /login
```

### Security Measures

| Measure | Implementation |
|---|---|
| **JWT Tokens** | Access token in localStorage + Authorization header |
| **Token Refresh** | Automatic 401 retry with refresh token |
| **CSRF Protection** | Fetches CSRF token from `/csrf/token`, sends as `x-csrf-token` on mutations |
| **Credentials** | `withCredentials: true` for cookie support |
| **Route Protection** | Dashboard layout checks `isAuthenticated` + `isVerified` |
| **Session Events** | `auth:session_expired` event triggers global logout |

### Token Storage

| Key | Storage | Used For |
|---|---|---|
| `accessToken` | localStorage | API Authorization header |
| `refreshToken` | localStorage | Token refresh flow |
| `auth-storage` | localStorage | Zustand persisted auth state |

---

## 13. Form Handling & Validation

### Stack

- **React Hook Form v7** — form state, registration, submission
- **Zod v4** — schema-based validation
- **@hookform/resolvers** — Zod ↔ RHF integration

### Validation Schemas

| Schema | Feature | Fields |
|---|---|---|
| `loginSchema` | Auth | email (valid email), password (min 8) |
| `signupSchema` | Auth | name (min 2), email, phone (min 11), password (min 8), confirmPassword (must match), role, city?, area?, address?, merchantBusinessName? (required if MERCHANT) |
| `addressSchema` | Shipments | name (min 2), phone (min 10), email?, addressLine1 (min 5), addressLine2?, city (min 2), state (min 2), postalCode (min 4), country, landmark? |
| `packageDetailsSchema` | Shipments | weight (min 0.1), length?, width?, height?, description (min 3), quantity (min 1), invoiceValue? |
| `createShipmentSchema` | Shipments | sender, receiver, package, pickupHubId, deliveryHubId, paymentMethod, codAmount? (required if COD), serviceType, specialInstructions?, isFragile, requiresSignature |
| `bulkShipmentRowSchema` | Shipments | Flat CSV row with all required fields |
| `shipmentFiltersSchema` | Shipments | status?, search?, dateFrom?, dateTo?, paymentMethod?, serviceType?, page, limit, sortBy, sortOrder |
| `locationUpdateSchema` | Rider | latitude, longitude, accuracy?, speed? |
| `completeDeliverySchema` | Rider | awb, otp, receiverName, remarks? |
| `failedDeliverySchema` | Rider | awb, reason (enum), details? |
| `codCollectionSchema` | Rider | awb, amount, paymentMethod, transactionId?, remarks? |
| `initiatePayoutSchema` | Payments | amount, paymentMethod, description? |
| `analyticsFiltersSchema` | Analytics | period, startDate?, endDate? |
| `exportOptionsSchema` | Analytics | type, format, filters |

---

## 14. Theming & Styling

### CSS Architecture

- **Tailwind CSS v4** with PostCSS plugin
- **OKLch color system** — all colors defined as OKLch CSS variables
- **CSS variables** for theme tokens (background, foreground, primary, destructive, etc.)
- **Dark mode** via `.dark` class (managed by `next-themes`)

### Theme Variables (defined in `app/globals.css`)

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: /* blue */;
  --destructive: /* red */;
  --muted: /* gray */;
  --border: /* border color */;
  /* ... 30+ variables */
}
.dark {
  /* Dark mode overrides */
}
```

### Design Tokens

| Token | Usage |
|---|---|
| `--radius` | 0.625rem (10px) border radius |
| `--font-sans` | Geist Sans |
| `--font-mono` | Geist Mono |
| `bg-background` | Page background |
| `text-foreground` | Primary text |
| `bg-primary` | Primary action color |
| `text-muted-foreground` | Secondary text |
| `bg-destructive` | Error/danger |

### Fonts

- **Geist Sans** — primary font (variable: `--font-geist-sans`)
- **Geist Mono** — code/mono font (variable: `--font-geist-mono`)

---

## 15. File Inventory

### Total File Count by Category

| Category | Files |
|---|---|
| App Router Pages | ~25 |
| shadcn/ui Components | 12 |
| Common Components | 15 |
| Common Lib/Utils | 6 |
| Common Types/Constants | 3 |
| Auth Feature | 11 |
| Shipments Feature | 24 |
| Tracking Feature | 11 |
| Rider Feature | 16 |
| Hub Feature | 8 |
| Payments Feature | 4 |
| Notifications Feature | 7 |
| Analytics Feature | 9 |
| Services (analytics) | 5 |
| Services (hub) | 5 |
| Services (notifications) | 6 |
| Services (payments) | 5 |
| Config Files | 10 |
| **Total** | **~182 files** |

### Dependencies Summary

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.0.3 | React framework |
| `react` | 19.2.0 | UI library |
| `typescript` | ^5 | Type safety |
| `tailwindcss` | ^4 | Styling |
| `@tanstack/react-query` | ^5.90.10 | Server state |
| `zustand` | ^5.0.8 | Client state |
| `axios` | ^1.13.2 | HTTP client |
| `react-hook-form` | ^7.66.1 | Form handling |
| `zod` | ^4.1.12 | Validation |
| `socket.io-client` | ^4.8.1 | WebSocket |
| `leaflet` / `react-leaflet` | ^1.9.4 / ^5.0.0 | Maps |
| `framer-motion` | ^12.23.24 | Animations |
| `date-fns` | ^4.1.0 | Date utils |
| `lucide-react` | ^0.554.0 | Icons |
| `next-themes` | ^0.4.6 | Dark mode |
| `react-dropzone` | ^14.3.8 | File upload |
| `@radix-ui/*` | Various | Accessible primitives |
| `class-variance-authority` | ^0.7.1 | Component variants |
| `tailwind-merge` | ^3.4.0 | Class merging |
| `clsx` | ^2.1.1 | Conditional classes |
| `tw-animate-css` | ^1.4.0 | Animation utilities |

---

*Generated from full codebase analysis — FastX Courier Frontend v0.1.0*
