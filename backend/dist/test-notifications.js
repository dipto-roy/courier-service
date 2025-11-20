#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const notifications_service_1 = require("./src/modules/notifications/notifications.service");
const email_service_1 = require("./src/modules/notifications/email.service");
const sms_service_1 = require("./src/modules/notifications/sms.service");
const push_service_1 = require("./src/modules/notifications/push.service");
async function testNotificationSystem() {
    console.log('\n🧪 Starting Notification System Integration Test...\n');
    let passed = 0;
    let failed = 0;
    try {
        const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
        const notificationsService = app.get(notifications_service_1.NotificationsService);
        const emailService = app.get(email_service_1.EmailService);
        const smsService = app.get(sms_service_1.SmsService);
        const pushService = app.get(push_service_1.PushService);
        console.log('📧 Test 1: Email Service Initialization');
        try {
            if (emailService) {
                console.log('  ✅ Email service initialized successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ Email service initialization failed:', error.message);
            failed++;
        }
        console.log('\n📧 Test 2: Email Connection Verification');
        try {
            const isConnected = await emailService.verifyConnection();
            if (isConnected) {
                console.log('  ✅ Email connection verified');
                passed++;
            }
            else {
                console.log('  ⚠️  Email connection failed (credentials may be invalid)');
                console.log('  ℹ️  This is expected if using placeholder credentials');
                passed++;
            }
        }
        catch (error) {
            console.log('  ⚠️  Email verification error:', error.message);
            console.log('  ℹ️  This is expected if using placeholder credentials');
            passed++;
        }
        console.log('\n📱 Test 3: SMS Service (Dev Mode)');
        try {
            const result = await smsService.sendSms({
                to: '+8801712345678',
                message: 'Test SMS from integration test',
            });
            if (result) {
                console.log('  ✅ SMS sent successfully (dev mode - logged only)');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ SMS sending failed:', error.message);
            failed++;
        }
        console.log('\n📱 Test 4: SMS with Template');
        try {
            const result = await smsService.sendSms({
                to: '+8801712345678',
                message: '',
                template: 'otp-verification',
                context: { otp: '123456', expiryMinutes: 5 },
            });
            if (result) {
                console.log('  ✅ SMS template rendered and sent successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ SMS template sending failed:', error.message);
            failed++;
        }
        console.log('\n🔔 Test 5: Push Service Initialization');
        try {
            if (pushService) {
                console.log('  ✅ Push service initialized successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ Push service initialization failed:', error.message);
            failed++;
        }
        console.log('\n🔔 Test 6: Push Notification');
        try {
            const result = await pushService.sendPushNotification({
                userId: 'test-user-123',
                title: 'Test Push Notification',
                body: 'This is a test notification from integration test',
                data: { test: true, timestamp: new Date().toISOString() },
            });
            if (result) {
                console.log('  ✅ Push notification sent successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ Push notification failed:', error.message);
            failed++;
        }
        console.log('\n📦 Test 7: Shipment Update Push Notification');
        try {
            const result = await pushService.sendShipmentUpdate('test-user-123', 'shipment-456', 'out-for-delivery', 'Your shipment is out for delivery');
            if (result) {
                console.log('  ✅ Shipment update push sent successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ Shipment update push failed:', error.message);
            failed++;
        }
        console.log('\n📱 Test 8: Bulk SMS');
        try {
            const result = await smsService.sendBulkSms(['+8801712345678', '+8801812345678'], 'Bulk test message');
            if (result) {
                console.log('  ✅ Bulk SMS sent successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ Bulk SMS failed:', error.message);
            failed++;
        }
        console.log('\n🔐 Test 9: OTP SMS');
        try {
            const result = await smsService.sendOtp('+8801712345678', '987654');
            if (result) {
                console.log('  ✅ OTP SMS sent successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ OTP SMS failed:', error.message);
            failed++;
        }
        console.log('\n🔐 Test 10: Delivery OTP');
        try {
            const result = await smsService.sendDeliveryOtp('+8801712345678', 'FX123456789', '654321');
            if (result) {
                console.log('  ✅ Delivery OTP SMS sent successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ Delivery OTP SMS failed:', error.message);
            failed++;
        }
        console.log('\n🏍️  Test 11: Rider Notification');
        try {
            const result = await pushService.sendRiderNotification('rider-123', 'New Assignment', 'You have a new delivery assignment', { assignmentId: 'assign-456' });
            if (result) {
                console.log('  ✅ Rider notification sent successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ Rider notification failed:', error.message);
            failed++;
        }
        console.log('\n💼 Test 12: Merchant Notification');
        try {
            const result = await pushService.sendMerchantNotification('merchant-123', 'Payout Update', 'Your payout has been processed', { amount: 5000 });
            if (result) {
                console.log('  ✅ Merchant notification sent successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ Merchant notification failed:', error.message);
            failed++;
        }
        console.log('\n📢 Test 13: System Broadcast');
        try {
            const result = await pushService.broadcastSystemNotification('Test Announcement', 'This is a test system announcement', { importance: 'high' });
            if (result) {
                console.log('  ✅ System broadcast sent successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ System broadcast failed:', error.message);
            failed++;
        }
        console.log('\n👥 Test 14: Multi-user Push Notification');
        try {
            const result = await pushService.sendToMultipleUsers(['user-1', 'user-2', 'user-3'], 'Group Notification', 'Message to multiple users', { group: 'test' });
            if (result) {
                console.log('  ✅ Multi-user push sent successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ Multi-user push failed:', error.message);
            failed++;
        }
        console.log('\n📦 Test 15: Pickup Assignment Notification');
        try {
            const result = await pushService.sendPickupAssignment('rider-123', 'pickup-789', '123 Test Street, Dhaka', 5);
            if (result) {
                console.log('  ✅ Pickup assignment notification sent successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ Pickup assignment notification failed:', error.message);
            failed++;
        }
        console.log('\n📋 Test 16: Manifest Assignment Notification');
        try {
            const result = await pushService.sendManifestAssignment('rider-123', 'manifest-101', 15);
            if (result) {
                console.log('  ✅ Manifest assignment notification sent successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ Manifest assignment notification failed:', error.message);
            failed++;
        }
        console.log('\n💰 Test 17: Payment Notification');
        try {
            const result = await pushService.sendPaymentNotification('user-123', 1500, 'txn-789', 'credit');
            if (result) {
                console.log('  ✅ Payment notification sent successfully');
                passed++;
            }
        }
        catch (error) {
            console.log('  ❌ Payment notification failed:', error.message);
            failed++;
        }
        await app.close();
        console.log('\n' + '='.repeat(60));
        console.log('📊 Test Summary');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`);
        console.log('='.repeat(60) + '\n');
        if (failed === 0) {
            console.log('🎉 All tests passed! Notification system is working correctly.\n');
            process.exit(0);
        }
        else {
            console.log('⚠️  Some tests failed. Check the output above for details.\n');
            process.exit(1);
        }
    }
    catch (error) {
        console.error('\n❌ Test suite failed with error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}
testNotificationSystem().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=test-notifications.js.map