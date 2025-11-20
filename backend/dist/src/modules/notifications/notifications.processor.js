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
var NotificationsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const email_service_1 = require("./email.service");
const sms_service_1 = require("./sms.service");
const push_service_1 = require("./push.service");
let NotificationsProcessor = NotificationsProcessor_1 = class NotificationsProcessor {
    notificationsService;
    emailService;
    smsService;
    pushService;
    logger = new common_1.Logger(NotificationsProcessor_1.name);
    constructor(notificationsService, emailService, smsService, pushService) {
        this.notificationsService = notificationsService;
        this.emailService = emailService;
        this.smsService = smsService;
        this.pushService = pushService;
    }
    async handleSendNotification(job) {
        this.logger.log(`Processing notification job ${job.id}`);
        try {
            await this.notificationsService.processNotification(job.data.notificationId, job.data);
            this.logger.log(`Notification job ${job.id} completed`);
        }
        catch (error) {
            this.logger.error(`Notification job ${job.id} failed:`, error.message);
            throw error;
        }
    }
    async handleSendEmail(job) {
        this.logger.log(`Processing email job ${job.id}`);
        try {
            await this.emailService.sendEmail(job.data);
            this.logger.log(`Email job ${job.id} completed`);
        }
        catch (error) {
            this.logger.error(`Email job ${job.id} failed:`, error.message);
            throw error;
        }
    }
    async handleSendSms(job) {
        this.logger.log(`Processing SMS job ${job.id}`);
        try {
            await this.smsService.sendSms(job.data);
            this.logger.log(`SMS job ${job.id} completed`);
        }
        catch (error) {
            this.logger.error(`SMS job ${job.id} failed:`, error.message);
            throw error;
        }
    }
    async handleSendPush(job) {
        this.logger.log(`Processing push notification job ${job.id}`);
        try {
            await this.pushService.sendPushNotification(job.data);
            this.logger.log(`Push notification job ${job.id} completed`);
        }
        catch (error) {
            this.logger.error(`Push notification job ${job.id} failed:`, error.message);
            throw error;
        }
    }
};
exports.NotificationsProcessor = NotificationsProcessor;
__decorate([
    (0, bull_1.Process)('send-notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsProcessor.prototype, "handleSendNotification", null);
__decorate([
    (0, bull_1.Process)('send-email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsProcessor.prototype, "handleSendEmail", null);
__decorate([
    (0, bull_1.Process)('send-sms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsProcessor.prototype, "handleSendSms", null);
__decorate([
    (0, bull_1.Process)('send-push'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsProcessor.prototype, "handleSendPush", null);
exports.NotificationsProcessor = NotificationsProcessor = NotificationsProcessor_1 = __decorate([
    (0, bull_1.Processor)('notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        email_service_1.EmailService,
        sms_service_1.SmsService,
        push_service_1.PushService])
], NotificationsProcessor);
//# sourceMappingURL=notifications.processor.js.map