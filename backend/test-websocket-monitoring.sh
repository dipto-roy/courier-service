#!/bin/bash

echo "🧪 WebSocket & Socket.IO Monitoring Test"
echo "========================================="
echo ""

# Start the WebSocket client in background
npx ts-node test-live-websocket.ts &
CLIENT_PID=$!

# Wait for connection to establish
sleep 3

echo ""
echo "📊 Monitoring Data (while client is connected):"
echo "================================================"
echo ""

echo "1️⃣ Gateway Status:"
curl -s http://localhost:3001/api/tracking/gateway-status | jq .
echo ""

echo "2️⃣ Active Subscriptions:"
curl -s http://localhost:3001/api/tracking/active-subscriptions | jq .
echo ""

echo "3️⃣ Comprehensive Monitor:"
curl -s http://localhost:3001/api/tracking/monitor | jq .
echo ""

echo "4️⃣ Sending Test Event to AWB123456789:"
curl -s http://localhost:3001/api/tracking/test-event/AWB123456789 | jq .
echo ""

# Wait a moment for test event to be received
sleep 2

# Kill the client
kill $CLIENT_PID 2>/dev/null

echo ""
echo "✅ Test Complete!"
