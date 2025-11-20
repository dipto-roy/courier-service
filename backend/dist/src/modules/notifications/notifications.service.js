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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bull_1 = require("@nestjs/bull");
const notification_entity_1 = require("../../entities/notification.entity");
const enums_1 = require("../../common/enums");
const email_service_1 = require("./email.service");
const sms_service_1 = require("./sms.service");
const push_service_1 = require("./push.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    notificationRepository;
    notificationQueue;
    emailService;
    smsService;
    pushService;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(notificationRepository, notificationQueue, emailService, smsService, pushService) {
        this.notificationRepository = notificationRepository;
        this.notificationQueue = notificationQueue;
        this.emailService = emailService;
        this.smsService = smsService;
        this.pushService = pushService;
    }
    async sendNotification(sendNotificationDto) {
        try {
            const notification = this.notificationRepository.create({
                userId: sendNotificationDto.userId,
                shipmentId: sendNotificationDto.shipmentId,
                type: sendNotificationDto.type,
                title: sendNotificationDto.title,
                message: sendNotificationDto.message,
                data: sendNotificationDto.data,
            });
            await this.notificationRepository.save(notification);
            await this.notificationQueue.add('send-notification', {
                notificationId: notification.id,
                ...sendNotificationDto,
            });
            this.logger.log(`Notification queued: ${notification.id}`);
            return notification;
        }
        catch (error) {
            this.logger.error('Failed to create notification:', error.message);
            throw error;
        }
    }
    async processNotification(notificationId, dto) {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { id: notificationId },
                relations: ['user'],
            });
            if (!notification) {
                throw new common_1.NotFoundException('Notification not found');
            }
            let success = false;
            let errorMessage = null;
            try {
                switch (dto.type) {
                    case enums_1.NotificationType.EMAIL:
                        if (notification.user.email) {
                            await this.emailService.sendEmail({
                                to: notification.user.email,
                                subject: dto.title,
                                html: dto.message,
                            });
                            success = true;
                        }
                        break;
                    case enums_1.NotificationType.SMS:
                        if (notification.user.phone) {
                            await this.smsService.sendSms({
                                to: notification.user.phone,
                                message: dto.message,
                            });
                            success = true;
                        }
                        break;
                    case enums_1.NotificationType.PUSH:
                        await this.pushService.sendPushNotification({
                            userId: dto.userId,
                            title: dto.title,
                            body: dto.message,
                            data: dto.data,
                        });
                        success = true;
                        break;
                    default:
                        errorMessage = `Unsupported notification type: ${dto.type}`;
                }
            }
            catch (error) {
                errorMessage = error.message;
                this.logger.error(`Notification delivery failed: ${error.message}`);
            }
            await this.notificationRepository.update(notification.id, {
                sentAt: success ? new Date() : undefined,
                deliveryStatus: success ? 'sent' : 'failed',
                errorMessage: errorMessage || undefined,
            });
            this.logger.log(`Notification ${notificationId} ${success ? 'sent' : 'failed'}`);
        }
        catch (error) {
            this.logger.error(`Failed to process notification ${notificationId}:`, error.message);
            throw error;
        }
    }
    async sendEmail(emailDto) {
        try {
            await this.notificationQueue.add('send-email', emailDto);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to queue email:', error.message);
            throw error;
        }
    }
    async sendSms(smsDto) {
        try {
            await this.notificationQueue.add('send-sms', smsDto);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to queue SMS:', error.message);
            throw error;
        }
    }
    async sendPushNotification(pushDto) {
        try {
            await this.notificationQueue.add('send-push', pushDto);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to queue push notification:', error.message);
            throw error;
        }
    }
    async notifyShipmentCreated(userId, shipmentId, awb, data) {
        const notification = {
            userId,
            shipmentId,
            type: enums_1.NotificationType.EMAIL,
            title: 'Shipment Created Successfully',
            message: `Your shipment ${awb} has been created.`,
            data,
        };
        await this.sendNotification(notification);
        await this.sendNotification({
            ...notification,
            type: enums_1.NotificationType.SMS,
        });
        await this.sendNotification({
            ...notification,
            type: enums_1.NotificationType.PUSH,
        });
    }
    async notifyShipmentPickedUp(userId, shipmentId, awb, data) {
        await this.sendNotification({
            userId,
            shipmentId,
            type: enums_1.NotificationType.PUSH,
            title: 'Shipment Picked Up',
            message: `Your shipment ${awb} has been picked up and is in transit.`,
            data,
        });
        await this.sendNotification({
            userId,
            shipmentId,
            type: enums_1.NotificationType.SMS,
            title: 'Shipment Picked Up',
            message: `Your shipment ${awb} has been picked up and is in transit.`,
            data,
        });
    }
    async notifyOutForDelivery(userId, shipmentId, awb, riderName, riderPhone) {
        const data = { awb, riderName, riderPhone };
        await this.sendNotification({
            userId,
            shipmentId,
            type: enums_1.NotificationType.SMS,
            title: 'Out for Delivery',
            message: `Your shipment ${awb} is out for delivery. Rider: ${riderName} ${riderPhone}`,
            data,
        });
        await this.sendNotification({
            userId,
            shipmentId,
            type: enums_1.NotificationType.PUSH,
            title: 'Out for Delivery',
            message: `Your shipment ${awb} is out for delivery with ${riderName}`,
            data,
        });
        await this.pushService.sendDeliveryAlert(userId, shipmentId, awb, riderName);
    }
    async notifyDelivered(userId, shipmentId, awb, deliveredAt) {
        const data = { awb, deliveredAt };
        await this.sendNotification({
            userId,
            shipmentId,
            type: enums_1.NotificationType.EMAIL,
            title: 'Shipment Delivered Successfully',
            message: `Your shipment ${awb} has been delivered successfully at ${deliveredAt}.`,
            data,
        });
        await this.sendNotification({
            userId,
            shipmentId,
            type: enums_1.NotificationType.SMS,
            title: 'Shipment Delivered',
            message: `Your shipment ${awb} has been delivered successfully. Thank you!`,
            data,
        });
        await this.sendNotification({
            userId,
            shipmentId,
            type: enums_1.NotificationType.PUSH,
            title: 'Delivery Complete',
            message: `Your shipment ${awb} has been delivered successfully!`,
            data,
        });
    }
    async notifyDeliveryFailed(userId, shipmentId, awb, reason) {
        const data = { awb, failureReason: reason };
        await this.sendNotification({
            userId,
            shipmentId,
            type: enums_1.NotificationType.SMS,
            title: 'Delivery Failed',
            message: `Delivery failed for ${awb}. Reason: ${reason}`,
            data,
        });
        await this.sendNotification({
            userId,
            shipmentId,
            type: enums_1.NotificationType.PUSH,
            title: 'Delivery Failed',
            message: `Delivery attempt failed for ${awb}. We'll retry soon.`,
            data,
        });
    }
    async getUserNotifications(userId, isRead) {
        const query = { userId };
        if (isRead !== undefined) {
            query.isRead = isRead;
        }
        return this.notificationRepository.find({
            where: query,
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        notification.isRead = true;
        notification.readAt = new Date();
        return this.notificationRepository.save(notification);
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.count({
            where: { userId, isRead: false },
        });
    }
    async deleteNotification(notificationId, userId) {
        const result = await this.notificationRepository.delete({
            id: notificationId,
            userId,
        });
        if (result.affected === 0) {
            throw new common_1.NotFoundException('Notification not found');
        }
    }
    async notifyPayoutInitiated(userId, amount, transactionId) {
        await this.sendNotification({
            userId,
            type: enums_1.NotificationType.EMAIL,
            title: 'Payout Initiated',
            message: `Your payout of ${amount} BDT has been initiated.`,
            data: { amount, transactionId },
        });
        await this.pushService.sendPaymentNotification(userId, amount, transactionId, 'debit');
    }
    async notifyPayoutCompleted(userId, amount, transactionId, referenceNumber) {
        await this.sendNotification({
            userId,
            type: enums_1.NotificationType.EMAIL,
            title: 'Payout Completed',
            message: `Your payout of ${amount} BDT has been completed. Reference: ${referenceNumber}`,
            data: { amount, transactionId, referenceNumber },
        });
        await this.sendNotification({
            userId,
            type: enums_1.NotificationType.SMS,
            title: 'Payout Completed',
            message: `Payout completed. ${amount} BDT credited. Ref: ${referenceNumber}`,
            data: { amount, transactionId, referenceNumber },
        });
    }
    async notifyPickupAssignment(riderId, pickupId, address, itemCount) {
        await this.pushService.sendPickupAssignment(riderId, pickupId, address, itemCount);
        await this.sendNotification({
            userId: riderId,
            type: enums_1.NotificationType.SMS,
            title: 'New Pickup Assignment',
            message: `You have a new pickup at ${address} with ${itemCount} item(s).`,
            data: { pickupId, address, itemCount },
        });
    }
    async notifyManifestAssignment(riderId, manifestId, shipmentCount) {
        await this.pushService.sendManifestAssignment(riderId, manifestId, shipmentCount);
        await this.sendNotification({
            userId: riderId,
            type: enums_1.NotificationType.PUSH,
            title: 'New Manifest Assigned',
            message: `You have ${shipmentCount} shipment(s) to deliver.`,
            data: { manifestId, shipmentCount },
        });
    }
    async getNotificationStats(userId) {
        const query = userId ? { userId } : {};
        const [total, sent, failed, unread] = await Promise.all([
            this.notificationRepository.count({ where: query }),
            this.notificationRepository.count({ where: { ...query, deliveryStatus: 'sent' } }),
            this.notificationRepository.count({ where: { ...query, deliveryStatus: 'failed' } }),
            userId ? this.notificationRepository.count({ where: { userId, isRead: false } }) : 0,
        ]);
        const byType = await this.notificationRepository
            .createQueryBuilder('notification')
            .select('notification.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .where(userId ? 'notification.userId = :userId' : '1=1', { userId })
            .groupBy('notification.type')
            .getRawMany();
        return {
            total,
            sent,
            failed,
            unread,
            byType: byType.reduce((acc, item) => {
                acc[item.type] = parseInt(item.count);
                return acc;
            }, {}),
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, bull_1.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object, email_service_1.EmailService,
        sms_service_1.SmsService,
        push_service_1.PushService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map