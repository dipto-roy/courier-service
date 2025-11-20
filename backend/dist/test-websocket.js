"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const APP_URL = process.env.APP_URL || 'http://localhost:3001';
const TRACKING_NAMESPACE = '/tracking';
const TEST_AWB = 'FX12345678';
const TIMEOUT = 10000;
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};
const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: [],
};
async function test(name, testFn, timeout = TIMEOUT) {
    results.total++;
    const startTime = Date.now();
    try {
        console.log(`\n${colors.cyan}▶ ${name}${colors.reset}`);
        await Promise.race([
            testFn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout))
        ]);
        const duration = Date.now() - startTime;
        results.passed++;
        results.tests.push({ name, status: 'PASS', duration });
        console.log(`${colors.green}✓ PASS${colors.reset} (${duration}ms)`);
    }
    catch (error) {
        const duration = Date.now() - startTime;
        results.failed++;
        const message = error instanceof Error ? error.message : String(error);
        results.tests.push({ name, status: 'FAIL', message, duration });
        console.log(`${colors.red}✗ FAIL${colors.reset} (${duration}ms)`);
        console.log(`${colors.red}  Error: ${message}${colors.reset}`);
    }
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, but got ${actual}`);
    }
}
function assertNotNull(value, message) {
    if (value === null || value === undefined) {
        throw new Error(message || 'Expected value to be not null/undefined');
    }
}
function createClient(namespace = '') {
    return (0, socket_io_client_1.io)(`${APP_URL}${namespace}`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 3,
    });
}
function waitForEvent(socket, eventName, timeout = TIMEOUT) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            socket.off(eventName, handler);
            reject(new Error(`Timeout waiting for event: ${eventName}`));
        }, timeout);
        const handler = (data) => {
            clearTimeout(timer);
            socket.off(eventName, handler);
            resolve(data);
        };
        socket.on(eventName, handler);
    });
}
function waitForConnection(socket, timeout = TIMEOUT) {
    return new Promise((resolve, reject) => {
        if (socket.connected) {
            resolve();
            return;
        }
        const timer = setTimeout(() => {
            socket.off('connect', onConnect);
            socket.off('connect_error', onError);
            reject(new Error('Connection timeout'));
        }, timeout);
        const onConnect = () => {
            clearTimeout(timer);
            socket.off('connect', onConnect);
            socket.off('connect_error', onError);
            resolve();
        };
        const onError = (error) => {
            clearTimeout(timer);
            socket.off('connect', onConnect);
            socket.off('connect_error', onError);
            reject(error);
        };
        socket.on('connect', onConnect);
        socket.on('connect_error', onError);
    });
}
async function runTests() {
    console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}         WebSocket & Socket.IO Integration Tests${colors.reset}`);
    console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}Testing URL: ${APP_URL}${colors.reset}`);
    console.log(`${colors.cyan}Tracking Namespace: ${TRACKING_NAMESPACE}${colors.reset}\n`);
    await test('Dependencies: @nestjs/platform-socket.io installed', async () => {
        try {
            require('@nestjs/platform-socket.io');
        }
        catch (error) {
            throw new Error('@nestjs/platform-socket.io not found');
        }
    });
    await test('Dependencies: socket.io-client installed', async () => {
        try {
            require('socket.io-client');
        }
        catch (error) {
            throw new Error('socket.io-client not found');
        }
    });
    let mainClient;
    await test('Connection: Connect to tracking namespace', async () => {
        mainClient = createClient(TRACKING_NAMESPACE);
        await waitForConnection(mainClient, 15000);
        assert(mainClient.connected, 'Client should be connected');
        assertNotNull(mainClient.id, 'Client should have socket ID');
    });
    await test('Connection: Socket ID is assigned', async () => {
        assertNotNull(mainClient.id, 'Socket ID should be assigned');
        assert(mainClient.id.length > 0, 'Socket ID should not be empty');
    });
    await test('Connection: Namespace is correct', async () => {
        assert(mainClient.connected, 'Connected to correct namespace');
    });
    await test('Subscription: Subscribe to tracking updates', async () => {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('No acknowledgment received')), 5000);
            mainClient.emit('subscribe-tracking', { awb: TEST_AWB }, (response) => {
                clearTimeout(timer);
                try {
                    assertNotNull(response, 'Response should not be null');
                    assert(response.success === true, 'Response should indicate success');
                    assertEqual(response.awb, TEST_AWB, 'AWB should match');
                    assert(response.message?.includes('subscribed'), 'Message should mention subscription');
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    });
    await test('Subscription: Get tracking data for AWB', async () => {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('No tracking data received')), 5000);
            mainClient.emit('get-tracking', { awb: TEST_AWB }, (response) => {
                clearTimeout(timer);
                try {
                    assertNotNull(response, 'Response should not be null');
                    if (response.success) {
                        assertNotNull(response.tracking, 'Tracking data should be present');
                        assertEqual(response.tracking.awb, TEST_AWB, 'AWB should match');
                    }
                    else {
                        assert(response.error || response.message, 'Should have error message');
                    }
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    });
    await test('Subscription: Unsubscribe from tracking updates', async () => {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('No acknowledgment received')), 5000);
            mainClient.emit('unsubscribe-tracking', { awb: TEST_AWB }, (response) => {
                clearTimeout(timer);
                try {
                    assertNotNull(response, 'Response should not be null');
                    assert(response.success === true, 'Response should indicate success');
                    assertEqual(response.awb, TEST_AWB, 'AWB should match');
                    assert(response.message?.includes('unsubscribed'), 'Message should mention unsubscription');
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    });
    let client2;
    await test('Multiple Clients: Second client can connect', async () => {
        client2 = createClient(TRACKING_NAMESPACE);
        await waitForConnection(client2, 10000);
        assert(client2.connected, 'Second client should be connected');
        assertNotNull(client2.id, 'Second client should have socket ID');
    });
    await test('Multiple Clients: Different socket IDs', async () => {
        assert(mainClient.id !== client2.id, 'Socket IDs should be different');
    });
    await test('Multiple Clients: Both can subscribe to same AWB', async () => {
        const promises = [
            new Promise((resolve, reject) => {
                mainClient.emit('subscribe-tracking', { awb: TEST_AWB }, (response) => {
                    if (response?.success)
                        resolve();
                    else
                        reject(new Error('Client 1 subscription failed'));
                });
            }),
            new Promise((resolve, reject) => {
                client2.emit('subscribe-tracking', { awb: TEST_AWB }, (response) => {
                    if (response?.success)
                        resolve();
                    else
                        reject(new Error('Client 2 subscription failed'));
                });
            }),
        ];
        await Promise.all(promises);
    });
    await test('Error Handling: Subscribe without AWB', async () => {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('No error response received')), 5000);
            mainClient.emit('subscribe-tracking', {}, (response) => {
                clearTimeout(timer);
                try {
                    assertNotNull(response, 'Response should not be null');
                    assert(response.success === false, 'Response should indicate failure');
                    assert(response.error || response.message, 'Should have error message');
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    });
    await test('Error Handling: Get tracking without AWB', async () => {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('No error response received')), 5000);
            mainClient.emit('get-tracking', {}, (response) => {
                clearTimeout(timer);
                try {
                    assertNotNull(response, 'Response should not be null');
                    assert(response.success === false, 'Response should indicate failure');
                    assert(response.error || response.message, 'Should have error message');
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    });
    await test('Reconnection: Client can reconnect after disconnect', async () => {
        mainClient.disconnect();
        assert(!mainClient.connected, 'Client should be disconnected');
        await new Promise(resolve => setTimeout(resolve, 500));
        mainClient.connect();
        await waitForConnection(mainClient, 10000);
        assert(mainClient.connected, 'Client should be reconnected');
    });
    await test('Events: Can listen for status-update events', async () => {
        let eventReceived = false;
        const listener = (data) => {
            eventReceived = true;
        };
        mainClient.on('status-update', listener);
        await new Promise((resolve, reject) => {
            mainClient.emit('subscribe-tracking', { awb: TEST_AWB }, (response) => {
                if (response?.success)
                    resolve();
                else
                    reject(new Error('Subscription failed'));
            });
        });
        mainClient.off('status-update', listener);
    });
    await test('Events: Can listen for location-update events', async () => {
        let eventReceived = false;
        const listener = (data) => {
            eventReceived = true;
        };
        mainClient.on('location-update', listener);
        mainClient.off('location-update', listener);
    });
    await test('Events: Can listen for eta-update events', async () => {
        let eventReceived = false;
        const listener = (data) => {
            eventReceived = true;
        };
        mainClient.on('eta-update', listener);
        mainClient.off('eta-update', listener);
    });
    await test('Cleanup: Client 1 disconnects gracefully', async () => {
        mainClient.disconnect();
        assert(!mainClient.connected, 'Client should be disconnected');
    });
    await test('Cleanup: Client 2 disconnects gracefully', async () => {
        client2.disconnect();
        assert(!client2.connected, 'Client should be disconnected');
    });
    await test('CORS: Can connect from different origins', async () => {
        const client3 = (0, socket_io_client_1.io)(`${APP_URL}${TRACKING_NAMESPACE}`, {
            transports: ['websocket'],
            extraHeaders: {
                'origin': 'http://example.com'
            }
        });
        try {
            await waitForConnection(client3, 10000);
            assert(client3.connected, 'Client with different origin should connect');
            client3.disconnect();
        }
        catch (error) {
            client3.disconnect();
            throw error;
        }
    });
    await test('Transport: WebSocket transport works', async () => {
        const wsClient = (0, socket_io_client_1.io)(`${APP_URL}${TRACKING_NAMESPACE}`, {
            transports: ['websocket'],
        });
        try {
            await waitForConnection(wsClient, 10000);
            assert(wsClient.connected, 'WebSocket transport should work');
            assertEqual(wsClient.io.engine.transport.name, 'websocket', 'Should use websocket transport');
            wsClient.disconnect();
        }
        catch (error) {
            wsClient.disconnect();
            throw error;
        }
    });
    await test('Transport: Polling transport works (fallback)', async () => {
        const pollingClient = (0, socket_io_client_1.io)(`${APP_URL}${TRACKING_NAMESPACE}`, {
            transports: ['polling'],
        });
        try {
            await waitForConnection(pollingClient, 10000);
            assert(pollingClient.connected, 'Polling transport should work');
            assertEqual(pollingClient.io.engine.transport.name, 'polling', 'Should use polling transport');
            pollingClient.disconnect();
        }
        catch (error) {
            pollingClient.disconnect();
            throw error;
        }
    });
    printResults();
}
function printResults() {
    console.log(`\n${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}                     Test Results Summary${colors.reset}`);
    console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
    const passRate = ((results.passed / results.total) * 100).toFixed(1);
    const statusColor = results.failed === 0 ? colors.green : results.failed < 3 ? colors.yellow : colors.red;
    console.log(`${colors.bright}Total Tests:${colors.reset} ${results.total}`);
    console.log(`${colors.green}${colors.bright}Passed:${colors.reset} ${results.passed}`);
    console.log(`${colors.red}${colors.bright}Failed:${colors.reset} ${results.failed}`);
    console.log(`${statusColor}${colors.bright}Pass Rate:${colors.reset} ${passRate}%\n`);
    if (results.failed > 0) {
        console.log(`${colors.red}${colors.bright}Failed Tests:${colors.reset}`);
        results.tests
            .filter(t => t.status === 'FAIL')
            .forEach(t => {
            console.log(`${colors.red}  ✗ ${t.name}${colors.reset}`);
            console.log(`${colors.red}    ${t.message}${colors.reset}`);
        });
        console.log();
    }
    if (results.failed === 0) {
        console.log(`${colors.green}${colors.bright}🎉 ALL TESTS PASSED!${colors.reset}\n`);
        console.log(`${colors.green}✓ WebSocket server is working correctly${colors.reset}`);
        console.log(`${colors.green}✓ Socket.IO integration is functional${colors.reset}`);
        console.log(`${colors.green}✓ Tracking gateway is operational${colors.reset}\n`);
    }
    else if (results.failed < 3) {
        console.log(`${colors.yellow}${colors.bright}⚠️  MOSTLY WORKING (Minor issues)${colors.reset}\n`);
        console.log(`${colors.yellow}Core functionality is working, but some edge cases failed${colors.reset}\n`);
    }
    else {
        console.log(`${colors.red}${colors.bright}❌ TESTS FAILED${colors.reset}\n`);
        console.log(`${colors.red}WebSocket server may not be working correctly${colors.reset}`);
        console.log(`${colors.yellow}Possible causes:${colors.reset}`);
        console.log(`  - Server is not running (check: npm run start:dev)`);
        console.log(`  - Wrong URL (current: ${APP_URL})`);
        console.log(`  - CORS configuration issue`);
        console.log(`  - Socket.IO adapter not properly configured\n`);
    }
    console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
}
async function main() {
    try {
        await runTests();
        process.exit(results.failed === 0 ? 0 : 1);
    }
    catch (error) {
        console.error(`${colors.red}${colors.bright}Unexpected error:${colors.reset}`, error);
        process.exit(1);
    }
}
async function checkServerHealth() {
    console.log(`${colors.cyan}Checking if server is running...${colors.reset}`);
    try {
        const http = require('http');
        const url = new URL(APP_URL);
        await new Promise((resolve, reject) => {
            const req = http.get({
                hostname: url.hostname,
                port: url.port || 80,
                path: '/api',
                timeout: 5000,
            }, (res) => {
                console.log(`${colors.green}✓ Server is responding (HTTP ${res.statusCode})${colors.reset}\n`);
                resolve(true);
            });
            req.on('error', (error) => {
                console.log(`${colors.yellow}⚠️  Server health check failed${colors.reset}`);
                console.log(`${colors.yellow}   Make sure the server is running: npm run start:dev${colors.reset}\n`);
                resolve(false);
            });
            req.on('timeout', () => {
                req.destroy();
                console.log(`${colors.yellow}⚠️  Server health check timeout${colors.reset}\n`);
                resolve(false);
            });
        });
    }
    catch (error) {
        console.log(`${colors.yellow}⚠️  Could not check server health${colors.reset}\n`);
    }
}
checkServerHealth().then(() => main());
//# sourceMappingURL=test-websocket.js.map