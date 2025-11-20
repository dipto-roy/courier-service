"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PushService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pusher_1 = __importDefault(require("pusher"));
let PushService = PushService_1 = class PushService {
    configService;
    logger = new common_1.Logger(PushService_1.name);
    pusher;
    constructor(configService) {
        this.configService = configService;
        this.pusher = new pusher_1.default({
            appId: this.configService.get('PUSHER_APP_ID') || '',
            key: this.configService.get('PUSHER_KEY') || '',
            secret: this.configService.get('PUSHER_SECRET') || '',
            cluster: this.configService.get('PUSHER_CLUSTER') || 'ap2',
            useTLS: true,
        });
        this.logger.log('Push notification service initialized');
    }
    async sendPushNotification(pushDto) {
        try {
            await this.pusher.trigger(`private-user-${pushDto.userId}`, 'notification', {
                title: pushDto.title,
                body: pushDto.body,
                data: pushDto.data,
                channelId: pushDto.channelId || 'default',
                timestamp: new Date().toISOString(),
            });
            this.logger.log(`Push notification sent to user ${pushDto.userId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send push notification to user ${pushDto.userId}:`, error.message);
            throw error;
        }
    }
    async sendToMultipleUsers(userIds, title, body, data) {
        try {
            const channels = userIds.map(userId => `private-user-${userId}`);
            await this.pusher.trigger(channels, 'notification', {
                title,
                body,
                data,
                timestamp: new Date().toISOString(),
            });
            this.logger.log(`Push notification sent to ${userIds.length} users`);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to send push notification to multiple users:', error.message);
            throw error;
        }
    }
    async sendShipmentUpdate(userId, shipmentId, status, message) {
        return this.sendPushNotification({
            userId,
            title: 'Shipment Update',
            body: message,
            data: {
                type: 'shipment_update',
                shipmentId,
                status,
                action: 'VIEW_SHIPMENT',
            },
            channelId: 'shipment-updates',
        });
    }
    async sendDeliveryAlert(userId, shipmentId, awb, riderName) {
        return this.sendPushNotification({
            userId,
            title: 'Out for Delivery',
            body: `Your shipment ${awb} is out for delivery with ${riderName}`,
            data: {
                type: 'delivery_alert',
                shipmentId,
                awb,
                action: 'TRACK_SHIPMENT',
            },
            channelId: 'delivery-alerts',
        });
    }
    async sendPaymentNotification(userId, amount, transactionId, type) {
        return this.sendPushNotification({
            userId,
            title: 'Payment Update',
            body: `${type === 'credit' ? 'Received' : 'Paid'} ${amount} BDT`,
            data: {
                type: 'payment_update',
                transactionId,
                amount,
                action: 'VIEW_TRANSACTION',
            },
            channelId: 'payment-updates',
        });
    }
    async sendRiderNotification(riderId, title, message, data) {
        try {
            await this.pusher.trigger(`private-rider-${riderId}`, 'rider-notification', {
                title,
                body: message,
                data,
                timestamp: new Date().toISOString(),
            });
            this.logger.log(`Rider notification sent to rider ${riderId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send rider notification:`, error.message);
            throw error;
        }
    }
    async sendMerchantNotification(merchantId, title, message, data) {
        try {
            await this.pusher.trigger(`private-merchant-${merchantId}`, 'merchant-notification', {
                title,
                body: message,
                data,
                timestamp: new Date().toISOString(),
            });
            this.logger.log(`Merchant notification sent to merchant ${merchantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send merchant notification:`, error.message);
            throw error;
        }
    }
    async broadcastSystemNotification(title, message, data) {
        try {
            await this.pusher.trigger('system-notifications', 'broadcast', {
                title,
                body: message,
                data,
                timestamp: new Date().toISOString(),
            });
            this.logger.log('System notification broadcasted');
            return true;
        }
        catch (error) {
            this.logger.error('Failed to broadcast system notification:', error.message);
            throw error;
        }
    }
    async sendPickupAssignment(riderId, pickupId, address, itemCount) {
        return this.sendRiderNotification(riderId, 'New Pickup Assignment', `You have been assigned a pickup with ${itemCount} item(s) at ${address}`, {
            type: 'pickup_assignment',
            pickupId,
            action: 'VIEW_PICKUP',
        });
    }
    async sendManifestAssignment(riderId, manifestId, shipmentCount) {
        return this.sendRiderNotification(riderId, 'New Manifest Assigned', `You have ${shipmentCount} shipment(s) to deliver`, {
            type: 'manifest_assignment',
            manifestId,
            action: 'VIEW_MANIFEST',
        });
    }
};
exports.PushService = PushService;
exports.PushService = PushService = PushService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PushService);
//# sourceMappingURL=push.service.js.map