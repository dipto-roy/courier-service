#!/usr/bin/env ts-node
import { io, Socket } from 'socket.io-client';

const TEST_AWB = 'AWB123456789';
const SERVER_URL = 'http://localhost:3001';

console.log('🚀 Starting WebSocket Live Test...\n');

const socket: Socket = io(`${SERVER_URL}/tracking`, {
  transports: ['websocket', 'polling'],
  reconnection: true,
});

socket.on('connect', () => {
  console.log('✅ Connected to tracking namespace');
  console.log(`📍 Socket ID: ${socket.id}\n`);

  // Subscribe to tracking updates
  console.log(`📡 Subscribing to AWB: ${TEST_AWB}...`);
  socket.emit('subscribe', { awb: TEST_AWB }, (response: any) => {
    console.log('📥 Subscribe Response:', JSON.stringify(response, null, 2));
  });
});

socket.on('status-update', (data: any) => {
  console.log('📦 Status Update:', JSON.stringify(data, null, 2));
});

socket.on('location-update', (data: any) => {
  console.log('📍 Location Update:', JSON.stringify(data, null, 2));
});

socket.on('eta-update', (data: any) => {
  console.log('⏱️  ETA Update:', JSON.stringify(data, null, 2));
});

socket.on('test-event', (data: any) => {
  console.log('🧪 Test Event:', JSON.stringify(data, null, 2));
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

socket.on('error', (error: any) => {
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

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n\n👋 Closing connection...');
  socket.disconnect();
  process.exit(0);
});
