# Courier Service - Monorepo

Complete courier/delivery management system with NestJS backend and Next.js frontend.

## Project Structure

```
courier-service/
├── backend/          # NestJS API + WebSocket server
├── frontend/         # Next.js web application
└── README.md        # This file
```

## Tech Stack

### Backend
- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL + TypeORM
- **Real-time**: Socket.IO (WebSocket)
- **Authentication**: JWT (Access + Refresh tokens)
- **Caching**: Redis (optional)

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Real-time**: Socket.IO Client

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14+ (for backend)
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/dipto-roy/courier-service.git
cd courier-service
```

2. **Set up Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run start:dev
```

3. **Set up Frontend** (in a new terminal)
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

4. **Access the application**
   - Backend API: http://localhost:3000
   - Frontend App: http://localhost:3001 (if using default Next.js port)

## Git Workflow

### Branches

- **`main`**: Production-ready code
- **`dev`**: Development branch (default for development)

### Development Workflow

```bash
# Switch to dev branch
git checkout dev

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature-name

# Merge back to dev when ready
git checkout dev
git merge feature/your-feature-name
```

## Documentation

- **Backend API**: See `backend/API_DOCUMENTATION.md` and `backend/API_ENDPOINTS.json`
- **Frontend Guide**: See `frontend/README.md`
- **GPS Tracking**: See `backend/GPS_TRACKING_GUIDE.md`
- **Pricing System**: See `backend/DYNAMIC_PRICING_SYSTEM.md`

## Features

### Implemented ✅
- User authentication (JWT-based)
- Role-based access control (Admin, Customer, Rider, Hub)
- Shipment creation and management
- Bulk shipment upload (CSV)
- Real-time GPS tracking with WebSocket
- OTP generation for delivery verification
- Manifest management for hub operations
- Pricing calculation (config-based)
- Notification system (Email, SMS, Push - stubs ready)
- Payment tracking
- Pickup scheduling
- Audit logging

### In Progress 🚧
- Frontend web application
- Advanced dynamic pricing with zones
- Complete notification delivery (Email/SMS)

## API Overview

The backend provides 100+ REST API endpoints across 12 controllers:

- **Auth**: Login, signup, OTP verification, JWT refresh
- **Shipments**: CRUD, bulk upload, tracking
- **Rider**: Delivery management, GPS updates, OTP verification
- **Hub**: Manifests, sorting, inbound/outbound scans
- **Users**: User management, KYC, wallet operations
- **Tracking**: Real-time shipment tracking with WebSocket
- **Notifications**: Email, SMS, push notifications
- **Payments**: Payment tracking, COD, payouts
- **Pickup**: Pickup request management
- **Audit**: System audit logs
- **SLA**: SLA monitoring and breach detection

## Environment Variables

### Backend (`backend/.env`)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_NAME=courier_service

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Running Tests

### Backend Tests
```bash
cd backend
npm test
npm run test:e2e
```

## Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Run migrations: `npm run migration:run`
3. Start production server: `npm run start:prod`

### Frontend Deployment
1. Build for production: `npm run build`
2. Start production server: `npm start`

Or deploy to Vercel:
```bash
vercel --prod
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Private project - All rights reserved

## Contact

- **Developer**: Dipto Roy
- **GitHub**: [@dipto-roy](https://github.com/dipto-roy)
- **Repository**: [courier-service](https://github.com/dipto-roy/courier-service)
