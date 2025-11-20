# Courier Service - Frontend

Modern Next.js frontend for the Courier Service platform.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: Backend NestJS API

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Project Structure

```
frontend/
├── app/                  # App router pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── ...
├── components/          # Reusable components (to be created)
├── lib/                 # Utility functions (to be created)
├── public/              # Static assets
└── types/               # TypeScript types (to be created)
```

## Planned Features

### User Roles
- **Customer**: Create shipments, track orders, manage pickups
- **Rider**: View assigned deliveries, update GPS location, complete deliveries
- **Hub Admin**: Manage manifests, sorting, inbound/outbound scans
- **Admin**: User management, system configuration

### Core Pages (To Be Implemented)
- [ ] Authentication (Login/Signup)
- [ ] Dashboard (role-based)
- [ ] Shipment creation & tracking
- [ ] Real-time GPS tracking map
- [ ] Rider delivery management
- [ ] Hub operations interface
- [ ] Reports & analytics

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
