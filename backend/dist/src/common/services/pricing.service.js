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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const enums_1 = require("../enums");
let PricingService = class PricingService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    calculateDeliveryFee(weight, distance, deliveryType, codAmount = 0) {
        const baseFee = parseFloat(this.configService.get('BASE_DELIVERY_FEE', '50'));
        const perKgFee = parseFloat(this.configService.get('PER_KG_FEE', '20'));
        const distanceFeePerKm = parseFloat(this.configService.get('DISTANCE_FEE_PER_KM', '5'));
        const expressSurcharge = deliveryType === enums_1.DeliveryType.EXPRESS
            ? parseFloat(this.configService.get('EXPRESS_SURCHARGE', '50'))
            : 0;
        const weightFee = Math.ceil(weight) * perKgFee;
        const distanceFee = Math.round(distance) * distanceFeePerKm;
        const codFee = this.calculateCODFee(codAmount);
        const totalFee = baseFee + weightFee + distanceFee + expressSurcharge + codFee;
        return {
            baseFee,
            weightFee,
            distanceFee,
            expressSurcharge,
            codFee,
            totalFee: Math.round(totalFee * 100) / 100,
        };
    }
    calculateCODFee(codAmount) {
        if (codAmount <= 0)
            return 0;
        const codFeePercentage = parseFloat(this.configService.get('COD_FEE_PERCENTAGE', '2'));
        return Math.round((codAmount * codFeePercentage) / 100);
    }
    calculateExpectedDelivery(deliveryType, pickupDate = new Date()) {
        const expressSlaHours = parseInt(this.configService.get('EXPRESS_SLA_HOURS', '24'));
        const normalSlaHours = parseInt(this.configService.get('NORMAL_SLA_HOURS', '72'));
        const slaHours = deliveryType === enums_1.DeliveryType.EXPRESS ? expressSlaHours : normalSlaHours;
        const expectedDate = new Date(pickupDate);
        expectedDate.setHours(expectedDate.getHours() + slaHours);
        return expectedDate;
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map