-- Quick SQL queries to check OTP verification status

-- 1. Check OTP for specific user
SELECT 
  email, 
  name,
  phone,
  "otpCode", 
  "otpExpiry", 
  "isVerified",
  "isActive",
  "createdAt"
FROM users 
WHERE email = 'testuser@example.com';

-- 2. Check all unverified users with OTP
SELECT 
  email, 
  name,
  "otpCode", 
  "otpExpiry", 
  "isVerified",
  CASE 
    WHEN "otpExpiry" > NOW() THEN 'Valid'
    ELSE 'Expired'
  END as otp_status
FROM users 
WHERE "isVerified" = false 
  AND "otpCode" IS NOT NULL;

-- 3. Check if OTP is expired
SELECT 
  email,
  "otpCode",
  "otpExpiry",
  NOW() as current_time,
  CASE 
    WHEN "otpExpiry" > NOW() THEN 'Valid (can use)'
    ELSE 'Expired (need new OTP)'
  END as status,
  EXTRACT(EPOCH FROM ("otpExpiry" - NOW())) as seconds_until_expiry
FROM users 
WHERE email = 'testuser@example.com';

-- 4. Clear test user (for re-testing)
-- DELETE FROM users WHERE email = 'testuser@example.com';

-- 5. View all users and their verification status
SELECT 
  email, 
  name,
  "isVerified",
  "isActive",
  role,
  "createdAt"
FROM users 
ORDER BY "createdAt" DESC 
LIMIT 10;
