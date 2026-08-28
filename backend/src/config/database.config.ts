import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

const DEFAULT_DATABASE_PORT = 5432;
const DEVELOPMENT = 'development';

const toPort = (value: string | undefined): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isInteger(parsed) ? parsed : DEFAULT_DATABASE_PORT;
};

const toBoolean = (value: string | undefined): boolean =>
  value?.trim().toLowerCase() === 'true';

/**
 * Schema sync is opt-in via DB_SYNCHRONIZE so it no longer depends on
 * NODE_ENV alone. Containers run with NODE_ENV=production but still need a
 * schema on a fresh volume; NODE_ENV=development keeps the old default.
 */
const resolveSynchronize = (
  synchronizeFlag: string | undefined,
  nodeEnv: string,
): boolean =>
  synchronizeFlag === undefined
    ? nodeEnv === DEVELOPMENT
    : toBoolean(synchronizeFlag);

export const getDatabaseConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = config.get<string>('NODE_ENV') ?? DEVELOPMENT;
  const synchronize = resolveSynchronize(
    config.get<string>('DB_SYNCHRONIZE'),
    nodeEnv,
  );

  return {
    type: 'postgres',
    host: config.get<string>('DATABASE_HOST') ?? 'localhost',
    port: toPort(config.get<string>('DATABASE_PORT')),
    username: config.get<string>('DATABASE_USER') ?? 'postgres',
    password: config.get<string>('DATABASE_PASSWORD') ?? 'postgres',
    database: config.get<string>('DATABASE_NAME') ?? 'courier_service',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations_history',
    synchronize,
    // TypeORM's DataSource.initialize() runs migrations BEFORE synchronize().
    // The migrations in src/migrations only seed data, so running them while
    // synchronize still has to create the schema fails with
    // `relation "users" does not exist`. Boot-time migrations are therefore
    // only honoured when synchronize is off; otherwise seed out of band with
    // `npm run migration:run` once the schema exists.
    migrationsRun:
      !synchronize && toBoolean(config.get<string>('USE_MIGRATIONS')),
    logging: nodeEnv === DEVELOPMENT,
  };
};
