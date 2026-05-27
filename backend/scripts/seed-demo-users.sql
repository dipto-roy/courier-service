-- Demo accounts for all 8 user roles
-- Password for ALL accounts: Password@123
-- bcrypt hash (10 rounds): $2b$10$yjMIgIu86WDrtpRLtT6cK.agMUiGhXkMl80YTF0dRtrciBA622GJe

INSERT INTO users (
  id, name, email, phone, role, password,
  is_active, is_verified, is_kyc_verified,
  wallet_balance, created_at, updated_at
) VALUES
  (gen_random_uuid(), 'Demo Admin',     'admin@fastx.com',    '01710000001', 'admin',     '$2b$10$yjMIgIu86WDrtpRLtT6cK.agMUiGhXkMl80YTF0dRtrciBA622GJe', true, true, true,  0.00,    NOW(), NOW()),
  (gen_random_uuid(), 'Demo Merchant',  'merchant@fastx.com', '01710000002', 'merchant',  '$2b$10$yjMIgIu86WDrtpRLtT6cK.agMUiGhXkMl80YTF0dRtrciBA622GJe', true, true, true,  5000.00, NOW(), NOW()),
  (gen_random_uuid(), 'Demo Agent',     'agent@fastx.com',    '01710000003', 'agent',     '$2b$10$yjMIgIu86WDrtpRLtT6cK.agMUiGhXkMl80YTF0dRtrciBA622GJe', true, true, true,  0.00,    NOW(), NOW()),
  (gen_random_uuid(), 'Demo Hub Staff', 'hubstaff@fastx.com', '01710000004', 'hub_staff', '$2b$10$yjMIgIu86WDrtpRLtT6cK.agMUiGhXkMl80YTF0dRtrciBA622GJe', true, true, true,  0.00,    NOW(), NOW()),
  (gen_random_uuid(), 'Demo Rider',     'rider@fastx.com',    '01710000005', 'rider',     '$2b$10$yjMIgIu86WDrtpRLtT6cK.agMUiGhXkMl80YTF0dRtrciBA622GJe', true, true, true,  0.00,    NOW(), NOW()),
  (gen_random_uuid(), 'Demo Customer',  'customer@fastx.com', '01710000006', 'customer',  '$2b$10$yjMIgIu86WDrtpRLtT6cK.agMUiGhXkMl80YTF0dRtrciBA622GJe', true, true, false, 0.00,    NOW(), NOW()),
  (gen_random_uuid(), 'Demo Finance',   'finance@fastx.com',  '01710000007', 'finance',   '$2b$10$yjMIgIu86WDrtpRLtT6cK.agMUiGhXkMl80YTF0dRtrciBA622GJe', true, true, true,  0.00,    NOW(), NOW()),
  (gen_random_uuid(), 'Demo Support',   'support@fastx.com',  '01710000008', 'support',   '$2b$10$yjMIgIu86WDrtpRLtT6cK.agMUiGhXkMl80YTF0dRtrciBA622GJe', true, true, true,  0.00,    NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Verify
SELECT email, role, is_active, is_verified FROM users ORDER BY role;
