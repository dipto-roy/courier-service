#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const TEST_AWB = 'AWB123456789';
const socket = (0, socket_io_client_1.io)('http://localhost:3001/tracking', {
    transports: ['websocket'],
});
socket.on('connect', () => {
    console.log('✅ Connected! Socket ID:', socket.id);
    socket.emit('subscribe', { awb: TEST_AWB }, (response) => {
        console.log('📥 Subscribe Response:', response);
        setTimeout(() => {
            console.log('✅ Test completed successfully!');
            socket.disconnect();
            process.exit(0);
        }, 1000);
    });
});
socket.on('test-event', (data) => {
    console.log('🧪 Received test event:', data);
});
socket.on('error', (error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});
setTimeout(() => {
    console.log('⏱️  Timeout - exiting');
    process.exit(1);
}, 5000);
//# sourceMappingURL=quick-websocket-test.js.map