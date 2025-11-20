import { ConfigService } from '@nestjs/config';
import { DeliveryType } from '../enums';
export declare class PricingService {
    private readonly configService;
    constructor(configService: ConfigService);
    calculateDeliveryFee(weight: number, distance: number, deliveryType: DeliveryType, codAmount?: number): {
        baseFee: number;
        weightFee: number;
        distanceFee: number;
        expressSurcharge: number;
        codFee: number;
        totalFee: number;
    };
    calculateCODFee(codAmount: number): number;
    calculateExpectedDelivery(deliveryType: DeliveryType, pickupDate?: Date): Date;
}
