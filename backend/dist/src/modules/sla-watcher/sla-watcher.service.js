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
var SlaWatcherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaWatcherService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bull_1 = require("@nestjs/bull");
const schedule_1 = require("@nestjs/schedule");
const shipment_entity_1 = require("../../entities/shipment.entity");
const shipment_status_enum_1 = require("../../common/enums/shipment-status.enum");
const notification_type_enum_1 = require("../../common/enums/notification-type.enum");
const cache_service_1 = require("../cache/cache.service");
const notifications_service_1 = require("../notifications/notifications.service");
let SlaWatcherService = SlaWatcherService_1 = class SlaWatcherService {
    shipmentRepository;
    slaQueue;
    cacheService;
    notificationsService;
    logger = new common_1.Logger(SlaWatcherService_1.name);
    slaConfig = {
        pickupSLA: 24,
        deliverySLA: 72,
        inTransitSLA: 48,
    };
    constructor(shipmentRepository, slaQueue, cacheService, notificationsService) {
        this.shipmentRepository = shipmentRepository;
        this.slaQueue = slaQueue;
        this.cacheService = cacheService;
        this.notificationsService = notificationsService;
    }
    async checkSLAViolations() {
        this.logger.log('Starting SLA violation check...');
        try {
            await Promise.all([
                this.checkPickupSLA(),
                this.checkDeliverySLA(),
                this.checkInTransitSLA(),
            ]);
            this.logger.log('SLA violation check completed');
        }
        catch (error) {
            this.logger.error('Error in SLA violation check:', error.message);
        }
    }
    async checkPickupSLA() {
        const slaTime = new Date();
        slaTime.setHours(slaTime.getHours() - this.slaConfig.pickupSLA);
        const shipments = await this.shipmentRepository.find({
            where: {
                status: shipment_status_enum_1.ShipmentStatus.PENDING,
                createdAt: (0, typeorm_2.LessThan)(slaTime),
            },
            relations: ['merchant', 'customer'],
        });
        for (const shipment of shipments) {
            const cacheKey = `sla:pickup:${shipment.id}`;
            const alreadyNotified = await this.cacheService.exists(cacheKey);
            if (!alreadyNotified) {
                await this.handlePickupSLAViolation(shipment);
                await this.cacheService.set(cacheKey, true, 86400);
            }
        }
        this.logger.log(`Checked ${shipments.length} shipments for pickup SLA violations`);
    }
    async handlePickupSLAViolation(shipment) {
        this.logger.warn(`Pickup SLA violated for shipment ${shipment.awb}`);
        await this.slaQueue.add('pickup-sla-violation', {
            shipmentId: shipment.id,
            awb: shipment.awb,
            merchantId: shipment.merchantId,
            customerId: shipment.customerId,
            violationType: 'pickup',
            createdAt: shipment.createdAt,
            slaHours: this.slaConfig.pickupSLA,
        });
        if (shipment.merchant) {
            await this.notificationsService.sendNotification({
                userId: shipment.merchant.id,
                type: notification_type_enum_1.NotificationType.EMAIL,
                title: 'Pickup SLA Violation',
                message: `Shipment ${shipment.awb} has not been picked up within ${this.slaConfig.pickupSLA}h SLA. Please take action.`,
                shipmentId: shipment.id,
            });
        }
        await this.cacheService.publish('sla-violations', {
            type: 'pickup',
            shipmentId: shipment.id,
            awb: shipment.awb,
            merchantId: shipment.merchantId,
            timestamp: new Date(),
        });
    }
    async checkDeliverySLA() {
        const slaTime = new Date();
        slaTime.setHours(slaTime.getHours() - this.slaConfig.deliverySLA);
        const shipments = await this.shipmentRepository.find({
            where: {
                status: (0, typeorm_2.In)([
                    shipment_status_enum_1.ShipmentStatus.PICKED_UP,
                    shipment_status_enum_1.ShipmentStatus.IN_TRANSIT,
                    shipment_status_enum_1.ShipmentStatus.OUT_FOR_DELIVERY,
                ]),
                createdAt: (0, typeorm_2.LessThan)(slaTime),
            },
            relations: ['merchant', 'customer', 'rider'],
        });
        for (const shipment of shipments) {
            const cacheKey = `sla:delivery:${shipment.id}`;
            const alreadyNotified = await this.cacheService.exists(cacheKey);
            if (!alreadyNotified) {
                await this.handleDeliverySLAViolation(shipment);
                await this.cacheService.set(cacheKey, true, 43200);
            }
        }
        this.logger.log(`Checked ${shipments.length} shipments for delivery SLA violations`);
    }
    async handleDeliverySLAViolation(shipment) {
        this.logger.warn(`Delivery SLA violated for shipment ${shipment.awb}`);
        await this.slaQueue.add('delivery-sla-violation', {
            shipmentId: shipment.id,
            awb: shipment.awb,
            merchantId: shipment.merchantId,
            customerId: shipment.customerId,
            riderId: shipment.riderId,
            status: shipment.status,
            violationType: 'delivery',
            createdAt: shipment.createdAt,
            slaHours: this.slaConfig.deliverySLA,
        });
        const notifications = [];
        if (shipment.merchant) {
            notifications.push(this.notificationsService.sendNotification({
                userId: shipment.merchant.id,
                type: notification_type_enum_1.NotificationType.EMAIL,
                title: 'Delivery SLA Violation',
                message: `Shipment ${shipment.awb} has exceeded the delivery SLA of ${this.slaConfig.deliverySLA} hours (${this.slaConfig.deliverySLA / 24} days). Current status: ${shipment.status}`,
                shipmentId: shipment.id,
            }));
        }
        if (shipment.customer) {
            notifications.push(this.notificationsService.sendSms({
                to: shipment.customer.phone,
                message: `Your shipment ${shipment.awb} is delayed. We apologize for the inconvenience. For support, contact: 1800-FASTX`,
            }));
        }
        if (shipment.rider) {
            notifications.push(this.notificationsService.sendPushNotification({
                userId: shipment.rider.id,
                title: 'SLA Alert',
                body: `Shipment ${shipment.awb} has exceeded delivery SLA. Please prioritize.`,
            }));
        }
        await Promise.all(notifications);
        await this.cacheService.publish('sla-violations', {
            type: 'delivery',
            shipmentId: shipment.id,
            awb: shipment.awb,
            merchantId: shipment.merchantId,
            riderId: shipment.riderId,
            status: shipment.status,
            timestamp: new Date(),
        });
    }
    async checkInTransitSLA() {
        const slaTime = new Date();
        slaTime.setHours(slaTime.getHours() - this.slaConfig.inTransitSLA);
        const shipments = await this.shipmentRepository.find({
            where: {
                status: shipment_status_enum_1.ShipmentStatus.IN_TRANSIT,
                updatedAt: (0, typeorm_2.LessThan)(slaTime),
            },
            relations: ['merchant'],
        });
        for (const shipment of shipments) {
            const cacheKey = `sla:intransit:${shipment.id}`;
            const alreadyNotified = await this.cacheService.exists(cacheKey);
            if (!alreadyNotified) {
                await this.handleInTransitSLAViolation(shipment);
                await this.cacheService.set(cacheKey, true, 43200);
            }
        }
        this.logger.log(`Checked ${shipments.length} shipments for in-transit SLA violations`);
    }
    async handleInTransitSLAViolation(shipment) {
        this.logger.warn(`In-transit SLA violated for shipment ${shipment.awb}`);
        await this.slaQueue.add('intransit-sla-violation', {
            shipmentId: shipment.id,
            awb: shipment.awb,
            merchantId: shipment.merchantId,
            violationType: 'intransit',
            lastUpdate: shipment.updatedAt,
            slaHours: this.slaConfig.inTransitSLA,
        });
        await this.cacheService.publish('sla-violations', {
            type: 'intransit',
            shipmentId: shipment.id,
            awb: shipment.awb,
            lastUpdate: shipment.updatedAt,
            timestamp: new Date(),
        });
    }
    async checkShipmentSLA(shipmentId) {
        const shipment = await this.shipmentRepository.findOne({
            where: { id: shipmentId },
        });
        if (!shipment) {
            throw new Error('Shipment not found');
        }
        const violations = [];
        const now = new Date();
        if (shipment.status === shipment_status_enum_1.ShipmentStatus.PENDING) {
            const pickupDeadline = new Date(shipment.createdAt);
            pickupDeadline.setHours(pickupDeadline.getHours() + this.slaConfig.pickupSLA);
            if (now > pickupDeadline) {
                violations.push('Pickup SLA exceeded');
            }
        }
        if ([shipment_status_enum_1.ShipmentStatus.PICKED_UP, shipment_status_enum_1.ShipmentStatus.IN_TRANSIT, shipment_status_enum_1.ShipmentStatus.OUT_FOR_DELIVERY].includes(shipment.status)) {
            const deliveryDeadline = new Date(shipment.createdAt);
            deliveryDeadline.setHours(deliveryDeadline.getHours() + this.slaConfig.deliverySLA);
            if (now > deliveryDeadline) {
                violations.push('Delivery SLA exceeded');
            }
        }
        if (shipment.status === shipment_status_enum_1.ShipmentStatus.IN_TRANSIT) {
            const transitDeadline = new Date(shipment.updatedAt);
            transitDeadline.setHours(transitDeadline.getHours() + this.slaConfig.inTransitSLA);
            if (now > transitDeadline) {
                violations.push('In-transit update SLA exceeded');
            }
        }
        return {
            isViolated: violations.length > 0,
            violations,
            details: {
                awb: shipment.awb,
                status: shipment.status,
                createdAt: shipment.createdAt,
                updatedAt: shipment.updatedAt,
                pickupSLA: this.slaConfig.pickupSLA,
                deliverySLA: this.slaConfig.deliverySLA,
                inTransitSLA: this.slaConfig.inTransitSLA,
            },
        };
    }
    async getSLAStatistics() {
        const now = new Date();
        const pickupSlaTime = new Date();
        pickupSlaTime.setHours(pickupSlaTime.getHours() - this.slaConfig.pickupSLA);
        const deliverySlaTime = new Date();
        deliverySlaTime.setHours(deliverySlaTime.getHours() - this.slaConfig.deliverySLA);
        const [pickupViolations, deliveryViolations] = await Promise.all([
            this.shipmentRepository.count({
                where: {
                    status: shipment_status_enum_1.ShipmentStatus.PENDING,
                    createdAt: (0, typeorm_2.LessThan)(pickupSlaTime),
                },
            }),
            this.shipmentRepository.count({
                where: {
                    status: (0, typeorm_2.In)([
                        shipment_status_enum_1.ShipmentStatus.PICKED_UP,
                        shipment_status_enum_1.ShipmentStatus.IN_TRANSIT,
                        shipment_status_enum_1.ShipmentStatus.OUT_FOR_DELIVERY,
                    ]),
                    createdAt: (0, typeorm_2.LessThan)(deliverySlaTime),
                },
            }),
        ]);
        return {
            pickupSLA: {
                violations: pickupViolations,
                threshold: this.slaConfig.pickupSLA,
            },
            deliverySLA: {
                violations: deliveryViolations,
                threshold: this.slaConfig.deliverySLA,
            },
            totalViolations: pickupViolations + deliveryViolations,
            lastChecked: now,
        };
    }
    async getQueueStatus() {
        const [waiting, active, completed, failed] = await Promise.all([
            this.slaQueue.getWaitingCount(),
            this.slaQueue.getActiveCount(),
            this.slaQueue.getCompletedCount(),
            this.slaQueue.getFailedCount(),
        ]);
        return {
            waiting,
            active,
            completed,
            failed,
            total: waiting + active + completed + failed,
        };
    }
};
exports.SlaWatcherService = SlaWatcherService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SlaWatcherService.prototype, "checkSLAViolations", null);
exports.SlaWatcherService = SlaWatcherService = SlaWatcherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shipment_entity_1.Shipment)),
    __param(1, (0, bull_1.InjectQueue)('sla-watcher')),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object, cache_service_1.CacheService,
        notifications_service_1.NotificationsService])
], SlaWatcherService);
//# sourceMappingURL=sla-watcher.service.js.map