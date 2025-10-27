# Database Setup Guide

## PostgreSQL Setup

### 1. Install PostgreSQL

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

### 2. Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE courier_service;

# Create user (optional)
CREATE USER courier_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE courier_service TO courier_user;

# Exit
\q
```

### 3. Configure Environment Variables

Update your `.env` file with your database credentials:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=courier_service
```

### 4. Run the Application

```bash
npm run start:dev
```

TypeORM will automatically create tables based on your entities when `synchronize` is enabled (development mode only).

## TypeORM Configuration

- **Entities**: Located in `src/entities/`
- **Auto-sync**: Enabled in development mode only
- **Logging**: Enabled in development mode

## Example Entity

See `src/entities/user.entity.ts` for an example entity implementation.

## Notes

⚠️ **Important**: `synchronize: true` is only enabled in development mode. In production, use migrations instead.
