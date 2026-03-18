# Courier Service - Deployment Guide

## Quick Reference

| Environment | Backend                      | Frontend               | Database         | Redis               |
| ----------- | ---------------------------- | ---------------------- | ---------------- | ------------------- |
| Development | `npm run start:dev` `@:3001` | `npm run dev` `@:5000` | Local PostgreSQL | Optional            |
| Staging     | Docker container             | Vercel                 | RDS Instance     | ElastiCache         |
| Production  | Docker + K8s                 | Pages/Vercel           | RDS Cluster      | ElastiCache Cluster |

---

## Local Development Deployment

### Prerequisites

```bash
# Check Node.js version
node --version  # Should be 18+

# Install PostgreSQL (if not installed)
# macOS: brew install postgres
# Ubuntu: sudo apt-get install postgresql
# Windows: Download from postgresql.org
```

### Step 1: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=your_db_user
# DB_PASSWORD=your_db_password
# DB_NAME=courier_service
# JWT_SECRET=generate-a-random-string-here (min 32 chars)

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
# Server runs at http://localhost:3001
```

### Step 2: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
EOF

# Start development server
npm run dev
# Server runs at http://localhost:5000
```

### Step 3: Verify Setup

```bash
# Test API
curl http://localhost:3001/api/auth/health

# Open in browser
# Frontend: http://localhost:5000
# API Docs: http://localhost:3001/api/docs
```

---

## Docker Deployment

### Backend Docker

```dockerfile
# Dockerfile (backend/Dockerfile)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "run", "start:prod"]
```

### Build and Run Docker

```bash
# Backend
cd backend
docker build -t courier-backend:latest .
docker run -p 3001:3001 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=courier_service \
  -e JWT_SECRET=your-secret \
  courier-backend:latest

# Frontend
cd ../frontend
docker build -t courier-frontend:latest .
docker run -p 5000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3001/api \
  courier-frontend:latest
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: courier_service
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  backend:
    build: ./backend
    ports:
      - '3001:3001'
    depends_on:
      - postgres
      - redis
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: postgres
      DB_NAME: courier_service
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: your-secret-key
    command: >
      sh -c "npm run migration:run && npm run start:prod"

  frontend:
    build: ./frontend
    ports:
      - '5000:3000'
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3001/api
      NEXT_PUBLIC_SOCKET_URL: http://backend:3001

volumes:
  postgres_data:
```

**Run with Docker Compose**:

```bash
docker-compose up -d
# All services start automatically
```

---

## Production Deployment

### Hosting Options

#### Backend Hosting

1. **AWS EC2 + RDS + ElastiCache**
   - Cost: $50-200/month
   - Best for: Scalable, managed services

2. **DigitalOcean App Platform**
   - Cost: $20-50/month
   - Best for: Simple, managed deployments

3. **Railway.app**
   - Cost: $15-100/month
   - Best for: Developer-friendly, auto-scaling

4. **Heroku** (legacy)
   - Deprecated but still available
   - Cost: $50+/month

#### Frontend Hosting

1. **Vercel** (Recommended)
   - Cost: Free for hobby, $20+/month for production
   - Best for: Optimized Next.js deployments

2. **Netlify**
   - Cost: Free for hobby, $19+/month for production
   - Best for: Static site hosting

3. **AWS CloudFront + S3**
   - Cost: Variable ($0.085/GB)
   - Best for: High-traffic, custom CDN

### Deploy to Vercel (Frontend)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy frontend
cd frontend
vercel --prod

# 4. Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.courier-service.com/api
# NEXT_PUBLIC_SOCKET_URL=https://api.courier-service.com
```

### Deploy to AWS (Backend)

#### Option 1: Elastic Beanstalk

```bash
# 1. Install AWS CLI and EB CLI
npm install -g aws-cli awsebcli

# 2. Initialize Elastic Beanstalk
cd backend
eb init -p node.js-18 courier-backend

# 3. Create environment
eb create production-env

# 4. Set environment variables
eb setenv DB_HOST=your-rds-endpoint \
  DB_PORT=5432 \
  DB_USERNAME=postgres \
  DB_PASSWORD=your-password \
  DB_NAME=courier_service

# 5. Deploy
eb deploy

# 6. View logs
eb logs
eb open
```

#### Option 2: Docker on ECS

```bash
# 1. Create ECR repository
aws ecr create-repository --repository-name courier-backend

# 2. Build and push Docker image
aws ecr get-login-password --region us-east-1 | docker login \
  --username AWS \
  --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

docker tag courier-backend:latest \
  YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/courier-backend:latest

docker push \
  YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/courier-backend:latest

# 3. Create ECS task definition and service via AWS Console
```

#### Option 3: Railway.app (Easiest)

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. In project directory
cd backend

# 4. Create project
railway init

# 5. Add services
railway add postgres
railway add redis

# 6. Set environment variables
railway variables set JWT_SECRET=your-secret
railway variables set DB_NAME=courier_service

# 7. Deploy
railway up

# 8. Get URL
railway env
```

---

## Database Setup (Production)

### AWS RDS PostgreSQL

```bash
# 1. Create RDS instance via AWS Console
# Engine: PostgreSQL 14+
# Instance type: db.t3.micro (for development)
# Storage: 20GB

# 2. Create database and user
psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -c \
  "CREATE DATABASE courier_service;"

psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -c \
  "CREATE USER courier_user WITH PASSWORD 'your-password';"

psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -c \
  "GRANT ALL PRIVILEGES ON DATABASE courier_service TO courier_user;"

# 3. Run migrations
npm run migration:run \
  -- -d "postgresql://courier_user:password@endpoint:5432/courier_service"
```

### Backup Strategy

```bash
# Daily backup
0 2 * * * pg_dump courier_service | gzip > /backups/courier_service_$(date +\%Y\%m\%d).sql.gz

# Keep 30 days of backups
find /backups -name "*.sql.gz" -mtime +30 -delete
```

---

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx

```bash
# 1. Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. Get certificate
sudo certbot certonly --nginx -d api.courier-service.com

# 3. Configure Nginx
server {
  listen 443 ssl http2;
  server_name api.courier-service.com;

  ssl_certificate /etc/letsencrypt/live/api.courier-service.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.courier-service.com/privkey.pem;

  location /api {
    proxy_pass http://localhost:3001;
  }
}

# 4. Enable auto-renewal
sudo systemctl enable certbot.timer
```

---

## Setting Up CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Backend Tests
        run: |
          cd backend
          npm ci
          npm test

      - name: Frontend Tests
        run: |
          cd frontend
          npm ci
          npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: success()
    steps:
      - uses: actions/checkout@v3

      - name: Deploy Backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm i -g @railway/cli
          railway up

      - name: Deploy Frontend
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          cd frontend
          npm i -g vercel
          vercel --prod --token $VERCEL_TOKEN
```

---

## Monitoring & Logging

### Setup Logging

```typescript
// backend/src/main.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const app = await NestFactory.create(AppModule, {
  logger: WinstonModule.createLogger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/app.log' }),
    ],
  }),
});
```

### Setup Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/node @sentry/tracing

# In backend/src/main.ts
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})

app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.errorHandler())
```

### Health Check Endpoint

```typescript
// backend/src/health.controller.ts
@Get('/health')
health() {
  return {
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  }
}
```

Monitor with:

```bash
watch -n 5 'curl http://api.courier-service.com/health'
```

---

## Performance Optimization

### Backend Optimization

1. Enable gzip compression
2. Use connection pooling (TypeORM default)
3. Implement caching with Redis
4. Use CDN for static files
5. Set up database indexes

### Frontend Optimization

1. Enable Next.js image optimization
2. Use dynamic imports for large components
3. Leverage Vercel's automatic optimizations
4. Set up analytics to monitor performance

---

## Rollback Procedure

### If deployment fails:

```bash
# Backend on Railway
railway rollback

# Frontend on Vercel
# Via Vercel dashboard: click "Deployments" → "Rollback"

# Database migration rollback
npm run migration:revert
```

---

## Maintenance Tasks

### Weekly

- Monitor error logs
- Check database disk space
- Verify backups are running

### Monthly

- Review application performance metrics
- Update dependencies (carefully)
- Clean up old logs

### Quarterly

- Security audit
- Performance optimization review
- Database maintenance (VACUUM, ANALYZE)

---

## Common Issues

### Issue: 502 Bad Gateway

**Solutions**:

1. Check backend service is running
2. Verify environment variables
3. Check database connectivity
4. Review backend logs

### Issue: Database Connection Timeout

**Solutions**:

1. Verify RDS security groups allow inbound traffic
2. Check database credentials
3. Verify network connectivity
4. Check connection pool size

### Issue: High Memory Usage

**Solutions**:

1. Enable NodeJS garbage collection monitoring
2. Check for memory leaks in profiler
3. Increase container memory limits
4. Optimize database queries

---

## Contact & Support

- **Issues**: GitHub Issues
- **Documentation**: See `docs/` folder
- **Slack/Email**: Contact team lead
