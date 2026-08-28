All 8 demo users seeded. Single-shot task, no TaskCreate needed.

  Demo Accounts

  Password (all): Password@123

  ┌───────────┬────────────────────┬─────────────┐
  │   Role    │       Email        │    Phone    │
  ├───────────┼────────────────────┼─────────────┤
  │ admin     │ admin@fastx.com    │ 01710000001 │
  ├───────────┼────────────────────┼─────────────┤
  │ merchant  │ merchant@fastx.com │ 01710000002 │
  ├───────────┼────────────────────┼─────────────┤
  │ agent     │ agent@fastx.com    │ 01710000003 │
  ├───────────┼────────────────────┼─────────────┤
  │ hub_staff │ hubstaff@fastx.com │ 01710000004 │
  ├───────────┼────────────────────┼─────────────┤
  │ rider     │ rider@fastx.com    │ 01710000005 │
  ├───────────┼────────────────────┼─────────────┤
  │ customer  │ customer@fastx.com │ 01710000006 │
  ├───────────┼────────────────────┼─────────────┤
  │ finance   │ finance@fastx.com  │ 01710000007 │
  ├───────────┼────────────────────┼─────────────┤
  │ support   │ support@fastx.com  │ 01710000008 │
  └───────────┴────────────────────┴─────────────┘

  SQL file saved: backend/scripts/seed-demo-users.sql. Re-run safe (ON CONFLICT skip).

  Re-seed cmd:
  docker exec -u postgres -i ecommerce-db-dev psql -d courier_service <
  backend/scripts/seed-demo-users.sql

  cd backend && npm run migration:run   # seeds admin@fastx.com / Admin@123456

> courier-service@0.0.1 migration:run
> npm run typeorm -- migration:run -d src/data-source.ts


> courier-service@0.0.1 typeorm
> typeorm-ts-node-commonjs migration:run -d src/data-source.ts

query: SELECT version()
query: SELECT * FROM current_schema()
query: CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
query: SELECT * FROM "information_schema"."tables" WHERE "table_schema" = 'public' AND "table_name" = 'migrations_history'
query: CREATE TABLE "migrations_history" ("id" SERIAL NOT NULL, "timestamp" bigint NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_7b44a0be1fd4e4eea85ea15460f" PRIMARY KEY ("id"))
query: SELECT * FROM "migrations_history" "migrations_history" ORDER BY "id" DESC
0 migrations are already loaded in the database.
3 migrations were found in the source code.
3 migrations are new migrations must be executed.
query: START TRANSACTION
query: SELECT id FROM users WHERE email = 'admin@fastx.com' LIMIT 1
query: 
        INSERT INTO users (
          id,
          name,
          email,
          phone,
          role,
          password,
          is_active,
          is_verified,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          'System Admin',
          'admin@fastx.com',
          '01700000000',
          'admin',
          '$2b$10$oxjOhznwZNoNJUoKLy4k8eeKEiyUXEfbh1HJB0k.b9sn2sW9ofNBy',
          true,
          true,
          NOW(),
          NOW()
        )
      
✅ Admin user created: admin@fastx.com / Admin@123456
query: SELECT id FROM users WHERE email = 'merchant@fastx.com' LIMIT 1
query: 
          INSERT INTO users (
            id,
            name,
            email,
            phone,
            role,
            password,
            is_active,
            is_verified,
            wallet_balance,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            'Test Merchant',
            'merchant@fastx.com',
            '01711111111',
            'merchant',
            '$2b$10$qutfaBczdlj2KT8zrsJSIOEjHYbWSEcHLj7PDME8A3Hw3RZuyvhNK',
            true,
            true,
            5000.00,
            NOW(),
            NOW()
          )
        
✅ Test merchant created: merchant@fastx.com / Merchant@123
query: SELECT id FROM users WHERE email = 'rider@fastx.com' LIMIT 1
query: 
          INSERT INTO users (
            id,
            name,
            email,
            phone,
            role,
            password,
            is_active,
            is_verified,
            wallet_balance,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            'Test Rider',
            'rider@fastx.com',
            '01722222222',
            'rider',
            '$2b$10$a/L1zU48K41v0gkuJaPA7e81okXHanNZDg1.XemCwTsBiZWrg/AmG',
            true,
            true,
            0.00,
            NOW(),
            NOW()
          )
        
✅ Test rider created: rider@fastx.com / Rider@123
query: SELECT id FROM users WHERE email = 'hub@fastx.com' LIMIT 1
query: 
          INSERT INTO users (
            id,
            name,
            email,
            phone,
            role,
            password,
            is_active,
            is_verified,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            'Test Hub Staff',
            'hub@fastx.com',
            '01733333333',
            'hub_staff',
            '$2b$10$GgItnRPJ6smCwOO3UxjTKeQhqGnPhwQDUC5Nz5wCvikSB42PeJTdq',
            true,
            true,
            NOW(),
            NOW()
          )
        
✅ Test hub staff created: hub@fastx.com / Hub@123
query: INSERT INTO "migrations_history"("timestamp", "name") VALUES ($1, $2) -- PARAMETERS: [1761770940616,"SeedInitialData1761770940616"]
Migration SeedInitialData1761770940616 has been executed successfully.
query: CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
✅ UUID extension (uuid-ossp) enabled successfully
   Available functions: gen_random_uuid(), uuid_generate_v4(), etc.
query: INSERT INTO "migrations_history"("timestamp", "name") VALUES ($1, $2) -- PARAMETERS: [1761771966395,"EnableUuidExtension1761771966395"]
Migration EnableUuidExtension1761771966395 has been executed successfully.
query: 
      DO $$
      DECLARE
        constraint_name text;
      BEGIN
        FOR constraint_name IN
          SELECT con.conname
          FROM pg_constraint con
          JOIN pg_class rel ON rel.oid = con.conrelid
          JOIN pg_attribute att
            ON att.attrelid = rel.oid AND att.attnum = ANY (con.conkey)
          WHERE rel.relname = 'users'
            AND con.contype = 'u'
            AND array_length(con.conkey, 1) = 1
            AND att.attname IN ('email', 'phone')
        LOOP
          EXECUTE format(
            'ALTER TABLE "users" DROP CONSTRAINT %I', constraint_name
          );
        END LOOP;
      END $$;
    
query: 
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_email_active"
      ON "users" ("email") WHERE "deleted_at" IS NULL
    
query: 
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_phone_active"
      ON "users" ("phone") WHERE "deleted_at" IS NULL
    
query: INSERT INTO "migrations_history"("timestamp", "name") VALUES ($1, $2) -- PARAMETERS: [1772280000000,"ScopeUserUniquenessToLiveRows1772280000000"]
Migration ScopeUserUniquenessToLiveRows1772280000000 has been executed successfully.
query: COMMIT