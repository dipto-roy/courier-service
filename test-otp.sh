#!/bin/bash

# FastX Courier - OTP Verification Test Script
# Quick curl commands for testing OTP flow

echo "======================================"
echo "FastX Courier - OTP Verification Test"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_BASE_URL="http://localhost:3001/api"

# Step 1: Signup
echo -e "${BLUE}Step 1: Creating new user...${NC}"
echo "Request: POST $API_BASE_URL/auth/signup"
echo ""

SIGNUP_RESPONSE=$(curl -s -X POST "$API_BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "phone": "+8801712345678",
    "password": "SecurePass123!",
    "role": "customer",
    "city": "Dhaka",
    "area": "Gulshan",
    "address": "House 10, Road 5, Gulshan-1"
  }')

echo "Response:"
echo "$SIGNUP_RESPONSE" | jq '.'
echo ""

# Check if signup was successful
if echo "$SIGNUP_RESPONSE" | grep -q "User created successfully"; then
  echo -e "${GREEN}✅ Signup successful!${NC}"
  echo ""
  echo -e "${BLUE}📝 Now check your server logs for the OTP code!${NC}"
  echo "Look for a line like:"
  echo "[SmsService] [DEV MODE] SMS would be sent to +8801712345678: Your FastX verification code is 123456"
  echo ""
  read -p "Enter the OTP code from server logs: " OTP_CODE
  echo ""
  
  # Step 2: Verify OTP
  echo -e "${BLUE}Step 2: Verifying OTP...${NC}"
  echo "Request: POST $API_BASE_URL/auth/verify-otp"
  echo ""
  
  VERIFY_RESPONSE=$(curl -s -X POST "$API_BASE_URL/auth/verify-otp" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"testuser@example.com\",
      \"otpCode\": \"$OTP_CODE\"
    }")
  
  echo "Response:"
  echo "$VERIFY_RESPONSE" | jq '.'
  echo ""
  
  # Check if verification was successful
  if echo "$VERIFY_RESPONSE" | grep -q "Account verified successfully"; then
    echo -e "${GREEN}✅ OTP Verification successful!${NC}"
    echo ""
    
    # Extract access token
    ACCESS_TOKEN=$(echo "$VERIFY_RESPONSE" | jq -r '.accessToken')
    
    echo "Access Token: $ACCESS_TOKEN"
    echo ""
    
    # Step 3: Login
    echo -e "${BLUE}Step 3: Testing login with verified account...${NC}"
    echo "Request: POST $API_BASE_URL/auth/login"
    echo ""
    
    LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "testuser@example.com",
        "password": "SecurePass123!"
      }')
    
    echo "Response:"
    echo "$LOGIN_RESPONSE" | jq '.'
    echo ""
    
    if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
      echo -e "${GREEN}✅ Login successful!${NC}"
      echo ""
      
      # Step 4: Get Profile
      echo -e "${BLUE}Step 4: Getting user profile...${NC}"
      echo "Request: GET $API_BASE_URL/auth/me"
      echo ""
      
      NEW_ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
      
      PROFILE_RESPONSE=$(curl -s -X GET "$API_BASE_URL/auth/me" \
        -H "Authorization: Bearer $NEW_ACCESS_TOKEN")
      
      echo "Response:"
      echo "$PROFILE_RESPONSE" | jq '.'
      echo ""
      
      if echo "$PROFILE_RESPONSE" | grep -q "email"; then
        echo -e "${GREEN}✅ Profile retrieved successfully!${NC}"
        echo ""
        echo -e "${GREEN}🎉 All tests passed! OTP verification is working correctly.${NC}"
      else
        echo -e "${RED}❌ Failed to get profile${NC}"
      fi
    else
      echo -e "${RED}❌ Login failed${NC}"
    fi
  else
    echo -e "${RED}❌ OTP Verification failed!${NC}"
    echo "Please check:"
    echo "1. OTP code is correct (6 digits)"
    echo "2. OTP has not expired (valid for 5 minutes)"
    echo "3. Account is not already verified"
  fi
else
  echo -e "${RED}❌ Signup failed!${NC}"
  echo "Error: $SIGNUP_RESPONSE"
  
  # Check if user already exists
  if echo "$SIGNUP_RESPONSE" | grep -q "already exists"; then
    echo ""
    echo "User already exists. To re-test, delete the user from database:"
    echo "DELETE FROM users WHERE email = 'testuser@example.com';"
  fi
fi

echo ""
echo "======================================"
echo "Test Complete"
echo "======================================"
