# 📦 Installation Guide

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Update .env.local with your backend URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

# 🚀 Quick Start Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Build
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run type-check       # TypeScript check

# Testing
npm run test             # Run unit tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests with Playwright
```

# 📁 Project Structure

See `FRONTEND_ROADMAP.md` for detailed architecture.

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   ├── features/         # Feature modules
│   ├── common/           # Shared code
│   └── styles/           # Global styles
├── public/               # Static assets
└── __tests__/            # Tests
```

# 🔑 Key Features

- ✅ Next.js 15 with App Router
- ✅ TypeScript (Strict Mode)
- ✅ Tailwind CSS + shadcn/ui
- ✅ React Query for server state
- ✅ Zustand for client state
- ✅ Socket.IO for real-time updates
- ✅ Zod for validation
- ✅ React Hook Form
- ✅ Framer Motion animations

# 📚 Documentation

- [Frontend Roadmap](FRONTEND_ROADMAP.md) - Complete implementation plan
- [Backend API](../backend/API_ENDPOINTS.json) - API reference
- [Integration Guide](../backend/FRONTEND_INTEGRATION_GUIDE.md) - API integration

# 🎯 Development Workflow

1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Make changes**: Follow roadmap phases
3. **Test**: `npm run test` and `npm run lint`
4. **Commit**: Use conventional commits
5. **Push**: `git push origin feature/your-feature`
6. **Create PR**: Against `dev` branch

# 🐛 Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
npx kill-port 3000
```

### Node modules issues

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

```bash
npm run type-check
```

# 🤝 Contributing

1. Follow the roadmap phases
2. Use TypeScript strictly
3. Write tests for new features
4. Update documentation
5. Follow commit conventions

# 📞 Support

- GitHub Issues: For bugs and features
- Backend Team: For API questions
- Design Team: For UI/UX questions
