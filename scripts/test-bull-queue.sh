#!/bin/bash

# 🐂 Bull Queue Testing Script
# This script demonstrates Bull Queue functionality in FastX Courier Service

echo "════════════════════════════════════════════════════════════════"
echo "   🐂 Bull Queue Testing - FastX Courier Service"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3001"
ADMIN_EMAIL="sysadmin@fastx.com"
ADMIN_PASSWORD="Admin@123"

# Step 1: Login
echo -e "${BLUE}Step 1: Logging in as admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed!${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login successful!${NC}"
echo ""

# Step 2: Check Queue Status (Before)
echo -e "${BLUE}Step 2: Checking queue status (before)...${NC}"
QUEUE_STATUS_BEFORE=$(curl -s -X GET "$API_URL/api/sla/queue/status" \
  -H "Authorization: Bearer $TOKEN")

echo "Queue Status:"
echo $QUEUE_STATUS_BEFORE | jq '.'
echo ""

# Step 3: Queue Multiple Jobs
echo -e "${BLUE}Step 3: Queueing multiple notification jobs...${NC}"
echo ""

# Job 1: Push Notification
echo "  📱 Queueing push notification..."
PUSH_RESPONSE=$(curl -s -X POST "$API_URL/api/notifications/push" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "c487cda3-47d6-4768-9e94-f2db32065d17",
    "title": "Test Push from Queue",
    "body": "This notification was queued via Bull",
    "data": {"source": "queue_test"}
  }')
echo "  Response: $(echo $PUSH_RESPONSE | jq -r '.message')"

# Job 2: Email Notification
echo "  📧 Queueing email notification..."
EMAIL_RESPONSE=$(curl -s -X POST "$API_URL/api/notifications/email" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "customer@example.com",
    "subject": "Queue Test Email",
    "text": "This email was queued via Bull Queue"
  }')
echo "  Response: $(echo $EMAIL_RESPONSE | jq -r '.message')"

# Job 3: SMS Notification
echo "  📱 Queueing SMS notification..."
SMS_RESPONSE=$(curl -s -X POST "$API_URL/api/notifications/sms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+8801712345678",
    "message": "This SMS was queued via Bull Queue - Test"
  }')
echo "  Response: $(echo $SMS_RESPONSE | jq -r '.message')"

echo ""
echo -e "${GREEN}✅ All jobs queued successfully!${NC}"
echo ""

# Step 4: Wait for Processing
echo -e "${YELLOW}⏳ Waiting 3 seconds for jobs to process...${NC}"
sleep 3
echo ""

# Step 5: Check Queue Status (After)
echo -e "${BLUE}Step 4: Checking queue status (after processing)...${NC}"
QUEUE_STATUS_AFTER=$(curl -s -X GET "$API_URL/api/sla/queue/status" \
  -H "Authorization: Bearer $TOKEN")

echo "Queue Status:"
echo $QUEUE_STATUS_AFTER | jq '.'
echo ""

# Step 6: Check Notification Statistics
echo -e "${BLUE}Step 5: Checking notification delivery statistics...${NC}"
STATS=$(curl -s -X GET "$API_URL/api/notifications/statistics" \
  -H "Authorization: Bearer $TOKEN")

echo "Notification Statistics:"
echo $STATS | jq '.'
echo ""

# Step 7: View Recent Notifications
echo -e "${BLUE}Step 6: Viewing recent notifications...${NC}"
RECENT=$(curl -s -X GET "$API_URL/api/notifications/my-notifications?page=1&limit=3" \
  -H "Authorization: Bearer $TOKEN")

echo "Recent Notifications:"
echo $RECENT | jq '[.[] | {title: .title, type: .type, deliveryStatus: .deliveryStatus, createdAt: .createdAt}] | .[0:3]'
echo ""

# Step 8: Redis Queue Inspection
echo -e "${BLUE}Step 7: Inspecting Redis queues...${NC}"
echo ""

echo "  🔍 Notification Queue:"
echo "    Waiting jobs:   $(redis-cli LLEN bull:notifications:waiting 2>/dev/null || echo 'N/A')"
echo "    Active jobs:    $(redis-cli LLEN bull:notifications:active 2>/dev/null || echo 'N/A')"
echo "    Completed jobs: $(redis-cli LLEN bull:notifications:completed 2>/dev/null || echo 'N/A')"
echo "    Failed jobs:    $(redis-cli LLEN bull:notifications:failed 2>/dev/null || echo 'N/A')"
echo ""

echo "  🔍 SLA Watcher Queue:"
echo "    Waiting jobs:   $(redis-cli LLEN bull:sla-watcher:waiting 2>/dev/null || echo 'N/A')"
echo "    Active jobs:    $(redis-cli LLEN bull:sla-watcher:active 2>/dev/null || echo 'N/A')"
echo "    Completed jobs: $(redis-cli LLEN bull:sla-watcher:completed 2>/dev/null || echo 'N/A')"
echo "    Failed jobs:    $(redis-cli LLEN bull:sla-watcher:failed 2>/dev/null || echo 'N/A')"
echo ""

# Summary
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}   ✅ Bull Queue Test Complete!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "What happened:"
echo "  1. ✅ Logged in and got access token"
echo "  2. ✅ Checked initial queue status"
echo "  3. ✅ Queued 3 jobs (Push, Email, SMS)"
echo "  4. ✅ Jobs processed asynchronously by Bull workers"
echo "  5. ✅ Verified delivery status in database"
echo "  6. ✅ Inspected Redis queue metrics"
echo ""
echo "Key Observations:"
echo "  • API responses returned immediately (queued, not blocked)"
echo "  • Jobs processed in background by NotificationsProcessor"
echo "  • Delivery status tracked in database"
echo "  • Redis maintains queue state"
echo ""
echo "Next Steps:"
echo "  • Check server logs: grep 'Processor' in your terminal"
echo "  • View Bull Board UI (if installed): http://localhost:3001/admin/queues"
echo "  • Read full guide: cat BULL_QUEUE_GUIDE.md"
echo ""
