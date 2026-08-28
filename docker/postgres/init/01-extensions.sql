-- Runs once, on first initialization of the postgres data volume.
-- TypeORM's @PrimaryGeneratedColumn('uuid') emits uuid_generate_v4() as the
-- column default, which requires uuid-ossp to already exist. Creating the
-- extension here guarantees it is present before the backend ever connects.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
