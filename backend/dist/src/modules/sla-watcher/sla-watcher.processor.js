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
var SlaWatcherProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaWatcherProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../audit/audit.service");
let SlaWatcherProcessor = SlaWatcherProcessor_1 = class SlaWatcherProcessor {
    auditService;
    logger = new common_1.Logger(SlaWatcherProcessor_1.name);
    constructor(auditService) {
        this.auditService = auditService;
    }
    async handlePickupSLAViolation(job) {
        const { shipmentId, awb, merchantId, violationType, slaHours } = job.data;
        this.logger.warn(`Processing pickup SLA violation for shipment ${awb}`);
        try {
            await this.auditService.logShipmentAction('system', shipmentId, 'sla_violation', `Pickup SLA of ${slaHours} hours exceeded for shipment ${awb}`, null, { violationType, slaHours }, 'system', 'SLA Watcher');
            return { success: true, shipmentId, awb };
        }
        catch (error) {
            this.logger.error(`Error processing pickup SLA violation for ${awb}:`, error.message);
            throw error;
        }
    }
    async handleDeliverySLAViolation(job) {
        const { shipmentId, awb, merchantId, riderId, status, violationType, slaHours } = job.data;
        this.logger.warn(`Processing delivery SLA violation for shipment ${awb}`);
        try {
            await this.auditService.logShipmentAction('system', shipmentId, 'sla_violation', `Delivery SLA of ${slaHours} hours exceeded for shipment ${awb}. Current status: ${status}`, null, { violationType, slaHours, status, riderId }, 'system', 'SLA Watcher');
            return { success: true, shipmentId, awb };
        }
        catch (error) {
            this.logger.error(`Error processing delivery SLA violation for ${awb}:`, error.message);
            throw error;
        }
    }
    async handleInTransitSLAViolation(job) {
        const { shipmentId, awb, merchantId, violationType, lastUpdate, slaHours } = job.data;
        this.logger.warn(`Processing in-transit SLA violation for shipment ${awb}`);
        try {
            await this.auditService.logShipmentAction('system', shipmentId, 'sla_violation', `In-transit update SLA of ${slaHours} hours exceeded for shipment ${awb}. Last update: ${lastUpdate}`, null, { violationType, slaHours, lastUpdate }, 'system', 'SLA Watcher');
            return { success: true, shipmentId, awb };
        }
        catch (error) {
            this.logger.error(`Error processing in-transit SLA violation for ${awb}:`, error.message);
            throw error;
        }
    }
    onActive(job) {
        this.logger.log(`Processing job ${job.id} of type ${job.name}`);
    }
    onCompleted(job, result) {
        this.logger.log(`Completed job ${job.id} of type ${job.name}`);
    }
    onFailed(job, error) {
        this.logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`);
    }
};
exports.SlaWatcherProcessor = SlaWatcherProcessor;
__decorate([
    (0, bull_1.Process)('pickup-sla-violation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SlaWatcherProcessor.prototype, "handlePickupSLAViolation", null);
__decorate([
    (0, bull_1.Process)('delivery-sla-violation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SlaWatcherProcessor.prototype, "handleDeliverySLAViolation", null);
__decorate([
    (0, bull_1.Process)('intransit-sla-violation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SlaWatcherProcessor.prototype, "handleInTransitSLAViolation", null);
__decorate([
    (0, bull_1.OnQueueActive)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SlaWatcherProcessor.prototype, "onActive", null);
__decorate([
    (0, bull_1.OnQueueCompleted)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SlaWatcherProcessor.prototype, "onCompleted", null);
__decorate([
    (0, bull_1.OnQueueFailed)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Error]),
    __metadata("design:returntype", void 0)
], SlaWatcherProcessor.prototype, "onFailed", null);
exports.SlaWatcherProcessor = SlaWatcherProcessor = SlaWatcherProcessor_1 = __decorate([
    (0, bull_1.Processor)('sla-watcher'),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], SlaWatcherProcessor);
//# sourceMappingURL=sla-watcher.processor.js.map