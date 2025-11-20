import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'courier_service',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  // Disable synchronize for production safety - use migrations instead
  synchronize: process.env.NODE_ENV === 'development' && process.env.USE_MIGRATIONS !== 'true',
  migrationsRun: process.env.USE_MIGRATIONS === 'true',
  logging: process.env.NODE_ENV === 'development',
  migrationsTableName: 'migrations_history',
});
