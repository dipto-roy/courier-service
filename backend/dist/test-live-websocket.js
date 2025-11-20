#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const TEST_AWB = 'AWB123456789';
const SERVER_URL = 'http://localhost:3001';
console.log('🚀 Starting WebSocket Live Test...\n');
const socket = (0, socket_io_client_1.io)(`${SERVER_URL}/tracking`, {
    transports: ['websocket', 'polling'],
    reconnection: true,
});
socket.on('connect', () => {
    console.log('✅ Connected to tracking namespace');
    console.log(`📍 Socket ID: ${socket.id}\n`);
    console.log(`📡 Subscribing to AWB: ${TEST_AWB}...`);
    socket.emit('subscribe', { awb: TEST_AWB }, (response) => {
        console.log('📥 Subscribe Response:', JSON.stringify(response, null, 2));
    });
});
socket.on('status-update', (data) => {
    console.log('📦 Status Update:', JSON.stringify(data, null, 2));
});
socket.on('location-update', (data) => {
    console.log('📍 Location Update:', JSON.stringify(data, null, 2));
});
socket.on('eta-update', (data) => {
    console.log('⏱️  ETA Update:', JSON.stringify(data, null, 2));
});
socket.on('test-event', (data) => {
    console.log('🧪 Test Event:', JSON.stringify(data, null, 2));
});
socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
});
socket.on('error', (error) => {
    console.error('⚠️  Error:', error);
});
console.log('👂 Listening for events...');
console.log('   - status-update');
console.log('   - location-update');
console.log('   - eta-update');
console.log('   - test-event\n');
console.log('💡 Keep this running and test the monitoring endpoints in another terminal:\n');
console.log('   curl http://localhost:3001/api/tracking/gateway-status');
console.log('   curl http://localhost:3001/api/tracking/active-subscriptions');
console.log('   curl http://localhost:3001/api/tracking/test-event/AWB123456789');
console.log('\n📌 Press Ctrl+C to exit\n');
process.on('SIGINT', () => {
    console.log('\n\n👋 Closing connection...');
    socket.disconnect();
    process.exit(0);
});
//# sourceMappingURL=test-live-websocket.js.map