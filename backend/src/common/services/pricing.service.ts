import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeliveryType } from '../enums';

@Injectable()
export class PricingService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Calculate delivery fee based on weight, distance, and delivery type
   */
  calculateDeliveryFee(
    weight: number,
    distance: number,
    deliveryType: DeliveryType,
    codAmount: number = 0,
  ): {
    baseFee: number;
    weightFee: number;
    distanceFee: number;
    expressSurcharge: number;
    codFee: number;
    totalFee: number;
  } {
    // Get pricing configuration from environment
    const baseFee = parseFloat(
      this.configService.get<string>('BASE_DELIVERY_FEE', '50'),
    );
    const perKgFee = parseFloat(
      this.configService.get<string>('PER_KG_FEE', '20'),
    );
    const distanceFeePerKm = parseFloat(
      this.configService.get<string>('DISTANCE_FEE_PER_KM', '5'),
    );
    const expressSurcharge =
      deliveryType === DeliveryType.EXPRESS
        ? parseFloat(this.configService.get<string>('EXPRESS_SURCHARGE', '50'))
        : 0;

    // Calculate weight fee (rounded up to next kg)
    const weightFee = Math.ceil(weight) * perKgFee;

    // Calculate distance fee (rounded to nearest km)
    const distanceFee = Math.round(distance) * distanceFeePerKm;

    // Calculate COD fee
    const codFee = this.calculateCODFee(codAmount);

    // Total fee
    const totalFee = baseFee + weightFee + distanceFee + expressSurcharge + codFee;

    return {
      baseFee,
      weightFee,
      distanceFee,
      expressSurcharge,
      codFee,
      totalFee: Math.round(totalFee * 100) / 100, // Round to 2 decimal places
    };
  }

  /**
   * Calculate COD fee (percentage based)
   */
  calculateCODFee(codAmount: number): number {
    if (codAmount <= 0) return 0;

    const codFeePercentage = parseFloat(
      this.configService.get<string>('COD_FEE_PERCENTAGE', '2'),
    );

    return Math.round((codAmount * codFeePercentage) / 100);
  }

  /**
   * Calculate expected delivery date based on delivery type
   */
  calculateExpectedDelivery(deliveryType: DeliveryType, pickupDate: Date = new Date()): Date {
    const expressSlaHours = parseInt(
      this.configService.get<string>('EXPRESS_SLA_HOURS', '24'),
    );
    const normalSlaHours = parseInt(
      this.configService.get<string>('NORMAL_SLA_HOURS', '72'),
    );

    const slaHours =
      deliveryType === DeliveryType.EXPRESS ? expressSlaHours : normalSlaHours;

    const expectedDate = new Date(pickupDate);
    expectedDate.setHours(expectedDate.getHours() + slaHours);

    return expectedDate;
  }
}
