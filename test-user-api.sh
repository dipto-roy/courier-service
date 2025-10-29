#!/bin/bash

# FastX Courier - User Management API - curl Examples
# Complete curl commands for all user endpoints

# Set these variables
BASE_URL="http://localhost:3001/api"
ACCESS_TOKEN="your_access_token_here"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "FastX Courier - User Management API"
echo "======================================"
echo ""

# ============================================
# 1. CREATE USER (Admin Only)
# ============================================
echo -e "${BLUE}1. Create User${NC}"
curl -X POST "$BASE_URL/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "01712345678",
    "password": "Password@123",
    "role": "merchant",
    "city": "Dhaka",
    "area": "Gulshan",
    "address": "House 12, Road 5",
    "companyName": "ABC Company Ltd.",
    "businessWebsite": "www.abccompany.com"
  }' | jq '.'
echo ""
echo "----------------------------------------"

# ============================================
# 2. GET ALL USERS
# ============================================
echo -e "${BLUE}2. Get All Users (Page 1, Limit 10)${NC}"
curl -X GET "$BASE_URL/users?page=1&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""
echo "----------------------------------------"

# ============================================
# 3. GET USERS - MERCHANTS ONLY
# ============================================
echo -e "${BLUE}3. Get Merchants Only${NC}"
curl -X GET "$BASE_URL/users?role=merchant&isActive=true" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""
echo "----------------------------------------"

# ============================================
# 4. GET USERS - SEARCH BY NAME
# ============================================
echo -e "${BLUE}4. Search Users by Name${NC}"
curl -X GET "$BASE_URL/users?search=john" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""
echo "----------------------------------------"

# ============================================
# 5. GET USER STATISTICS
# ============================================
echo -e "${BLUE}5. Get User Statistics${NC}"
curl -X GET "$BASE_URL/users/statistics" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""
echo "----------------------------------------"

# ============================================
# 6. GET USER BY ID
# ============================================
echo -e "${BLUE}6. Get User by ID${NC}"
echo -e "${YELLOW}Replace USER_ID with actual user ID${NC}"
USER_ID="550e8400-e29b-41d4-a716-446655440000"
curl -X GET "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""
echo "----------------------------------------"

# ============================================
# 7. UPDATE USER
# ============================================
echo -e "${BLUE}7. Update User${NC}"
curl -X PATCH "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Michael Doe",
    "city": "Chittagong",
    "area": "Agrabad",
    "isActive": true
  }' | jq '.'
echo ""
echo "----------------------------------------"

# ============================================
# 8. UPDATE USER - NAME ONLY
# ============================================
echo -e "${BLUE}8. Update User - Name Only${NC}"
curl -X PATCH "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith Updated"
  }' | jq '.'
echo ""
echo "----------------------------------------"

# ============================================
# 9. UPDATE KYC - APPROVE
# ============================================
echo -e "${BLUE}9. Update KYC Status - Approve${NC}"
curl -X PATCH "$BASE_URL/users/$USER_ID/kyc" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isKYCVerified": true,
    "kycRemarks": "KYC documents verified successfully"
  }' | jq '.'
echo ""
echo "----------------------------------------"

# ============================================
# 10. UPDATE KYC - REJECT
# ============================================
echo -e "${BLUE}10. Update KYC Status - Reject${NC}"
curl -X PATCH "$BASE_URL/users/$USER_ID/kyc" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isKYCVerified": false,
    "kycRemarks": "Invalid documents. Please resubmit."
  }' | jq '.'
echo ""
echo "----------------------------------------"

# ============================================
# 11. UPDATE WALLET - CREDIT
# ============================================
echo -e "${BLUE}11. Update Wallet - Credit${NC}"
curl -X PATCH "$BASE_URL/users/$USER_ID/wallet" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "credit",
    "amount": 5000,
    "remarks": "Monthly delivery payment"
  }' | jq '.'
echo ""
echo "----------------------------------------"

# ============================================
# 12. UPDATE WALLET - DEBIT
# ============================================
echo -e "${BLUE}12. Update Wallet - Debit${NC}"
curl -X PATCH "$BASE_URL/users/$USER_ID/wallet" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "debit",
    "amount": 500,
    "remarks": "Service charge deduction"
  }' | jq '.'
echo ""
echo "----------------------------------------"

# ============================================
# 13. DELETE USER (Soft Delete)
# ============================================
echo -e "${BLUE}13. Delete User (Soft Delete)${NC}"
curl -X DELETE "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -w "\nHTTP Status: %{http_code}\n"
echo ""
echo "----------------------------------------"

# ============================================
# 14. RESTORE USER
# ============================================
echo -e "${BLUE}14. Restore Deleted User${NC}"
curl -X POST "$BASE_URL/users/$USER_ID/restore" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""
echo "----------------------------------------"

echo ""
echo -e "${GREEN}✅ All curl commands executed!${NC}"
echo ""
echo "======================================"
echo "Notes:"
echo "1. Replace ACCESS_TOKEN with your actual JWT token"
echo "2. Replace USER_ID with actual user UUID"
echo "3. Install jq for formatted JSON output: sudo apt install jq"
echo "======================================"
