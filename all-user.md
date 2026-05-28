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