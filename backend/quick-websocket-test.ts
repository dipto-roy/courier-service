#!/usr/bin/env ts-node
import { io } from 'socket.io-client';

const TEST_AWB = 'AWB123456789';
const socket = io('http://localhost:3001/tracking', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('✅ Connected! Socket ID:', socket.id);
  
  socket.emit('subscribe', { awb: TEST_AWB }, (response: any) => {
    console.log('📥 Subscribe Response:', response);
    
    // Give time for subscription to register
    setTimeout(() => {
      console.log('✅ Test completed successfully!');
      socket.disconnect();
      process.exit(0);
    }, 1000);
  });
});

socket.on('test-event', (data: any) => {
  console.log('🧪 Received test event:', data);
});

socket.on('error', (error: any) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

setTimeout(() => {
  console.log('⏱️  Timeout - exiting');
  process.exit(1);
}, 5000);
