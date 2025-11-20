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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async sendNotification(sendNotificationDto) {
        return this.notificationsService.sendNotification(sendNotificationDto);
    }
    async sendEmail(sendEmailDto) {
        await this.notificationsService.sendEmail(sendEmailDto);
        return { success: true, message: 'Email queued for delivery' };
    }
    async sendSms(sendSmsDto) {
        await this.notificationsService.sendSms(sendSmsDto);
        return { success: true, message: 'SMS queued for delivery' };
    }
    async sendPushNotification(sendPushDto) {
        await this.notificationsService.sendPushNotification(sendPushDto);
        return { success: true, message: 'Push notification queued for delivery' };
    }
    async getMyNotifications(req, isRead) {
        const isReadBoolean = isRead !== undefined ? isRead === 'true' : undefined;
        return this.notificationsService.getUserNotifications(req.user.userId, isReadBoolean);
    }
    async getUnreadCount(req) {
        const count = await this.notificationsService.getUnreadCount(req.user.userId);
        return { count };
    }
    async markAsRead(id, req) {
        return this.notificationsService.markAsRead(id, req.user.userId);
    }
    async markAllAsRead(req) {
        await this.notificationsService.markAllAsRead(req.user.userId);
        return { success: true, message: 'All notifications marked as read' };
    }
    async deleteNotification(id, req) {
        await this.notificationsService.deleteNotification(id, req.user.userId);
        return { success: true, message: 'Notification deleted' };
    }
    async getUserNotifications(userId) {
        return this.notificationsService.getUserNotifications(userId);
    }
    async getStatistics() {
        return this.notificationsService.getNotificationStats();
    }
    async getUserStatistics(userId) {
        return this.notificationsService.getNotificationStats(userId);
    }
    async notifyShipmentCreated(body) {
        await this.notificationsService.notifyShipmentCreated(body.userId, body.shipmentId, body.awb, body.data);
        return { success: true };
    }
    async notifyShipmentPickedUp(body) {
        await this.notificationsService.notifyShipmentPickedUp(body.userId, body.shipmentId, body.awb, body.data);
        return { success: true };
    }
    async notifyOutForDelivery(body) {
        await this.notificationsService.notifyOutForDelivery(body.userId, body.shipmentId, body.awb, body.riderName, body.riderPhone);
        return { success: true };
    }
    async notifyDelivered(body) {
        await this.notificationsService.notifyDelivered(body.userId, body.shipmentId, body.awb, body.deliveredAt);
        return { success: true };
    }
    async notifyDeliveryFailed(body) {
        await this.notificationsService.notifyDeliveryFailed(body.userId, body.shipmentId, body.awb, body.reason);
        return { success: true };
    }
    async notifyPickupAssignment(body) {
        await this.notificationsService.notifyPickupAssignment(body.riderId, body.pickupId, body.address, body.itemCount);
        return { success: true };
    }
    async notifyManifestAssignment(body) {
        await this.notificationsService.notifyManifestAssignment(body.riderId, body.manifestId, body.shipmentCount);
        return { success: true };
    }
    async notifyPayoutInitiated(body) {
        await this.notificationsService.notifyPayoutInitiated(body.userId, body.amount, body.transactionId);
        return { success: true };
    }
    async notifyPayoutCompleted(body) {
        await this.notificationsService.notifyPayoutCompleted(body.userId, body.amount, body.transactionId, body.referenceNumber);
        return { success: true };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Send a notification' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Notification sent successfully',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                userId: '123e4567-e89b-12d3-a456-426614174001',
                type: 'email',
                title: 'Shipment Update',
                message: 'Your shipment has been delivered',
                isRead: false,
                createdAt: '2025-10-28T10:00:00Z',
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SendNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Post)('email'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Send an email notification' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Email queued successfully',
        schema: { example: { success: true, message: 'Email queued for delivery' } },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SendEmailDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('sms'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Send an SMS notification' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'SMS queued successfully',
        schema: { example: { success: true, message: 'SMS queued for delivery' } },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SendSmsDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendSms", null);
__decorate([
    (0, common_1.Post)('push'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Send a push notification' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Push notification queued successfully',
        schema: { example: { success: true, message: 'Push notification queued for delivery' } },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SendPushNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendPushNotification", null);
__decorate([
    (0, common_1.Get)('my-notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user notifications' }),
    (0, swagger_1.ApiQuery)({ name: 'isRead', required: false, type: Boolean, description: 'Filter by read status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User notifications retrieved',
        schema: {
            example: [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    type: 'push',
                    title: 'Shipment Update',
                    message: 'Your shipment is out for delivery',
                    isRead: false,
                    createdAt: '2025-10-28T10:00:00Z',
                },
            ],
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('isRead')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getMyNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread notification count' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Unread count retrieved',
        schema: { example: { count: 5 } },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Notification ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notification marked as read',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                isRead: true,
                readAt: '2025-10-28T10:30:00Z',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('mark-all-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all notifications as read' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'All notifications marked as read',
        schema: { example: { success: true, message: 'All notifications marked as read' } },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a notification' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Notification ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notification deleted',
        schema: { example: { success: true, message: 'Notification deleted' } },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Get)('users/:userId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Get notifications for a specific user (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User notifications retrieved',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUserNotifications", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification statistics (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notification statistics',
        schema: {
            example: {
                total: 1000,
                sent: 950,
                failed: 50,
                unread: 0,
                byType: {
                    email: 400,
                    sms: 350,
                    push: 250,
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/user/:userId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification statistics for a user (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User notification statistics',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUserStatistics", null);
__decorate([
    (0, common_1.Post)('shipment/created'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MERCHANT, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger shipment created notifications' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Notifications sent',
        schema: { example: { success: true } },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "notifyShipmentCreated", null);
__decorate([
    (0, common_1.Post)('shipment/picked-up'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger shipment picked up notifications' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Notifications sent',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "notifyShipmentPickedUp", null);
__decorate([
    (0, common_1.Post)('shipment/out-for-delivery'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.RIDER, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger out for delivery notifications' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Notifications sent',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "notifyOutForDelivery", null);
__decorate([
    (0, common_1.Post)('shipment/delivered'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.RIDER, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger shipment delivered notifications' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Notifications sent',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "notifyDelivered", null);
__decorate([
    (0, common_1.Post)('shipment/failed'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.RIDER, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger delivery failed notifications' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Notifications sent',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "notifyDeliveryFailed", null);
__decorate([
    (0, common_1.Post)('rider/pickup-assignment'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Notify rider of pickup assignment' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Notification sent',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "notifyPickupAssignment", null);
__decorate([
    (0, common_1.Post)('rider/manifest-assignment'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Notify rider of manifest assignment' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Notification sent',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "notifyManifestAssignment", null);
__decorate([
    (0, common_1.Post)('payment/payout-initiated'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Notify payout initiated' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Notification sent',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "notifyPayoutInitiated", null);
__decorate([
    (0, common_1.Post)('payment/payout-completed'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Notify payout completed' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Notification sent',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "notifyPayoutCompleted", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map