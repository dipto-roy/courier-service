import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../../entities/shipment.entity';
import { Manifest } from '../../entities/manifest.entity';
import { RiderLocation } from '../../entities/rider-location.entity';
import { User } from '../../entities/user.entity';
import { ShipmentStatus, PaymentMethod, PaymentStatus } from '../../common/enums';
import {
  DeliveryAttemptDto,
  FailedDeliveryDto,
  UpdateLocationDto,
  RTODto,
  GenerateOTPDto,
} from './dto';

@Injectable()
export class RiderService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(Manifest)
    private manifestRepository: Repository<Manifest>,
    @InjectRepository(RiderLocation)
    private riderLocationRepository: Repository<RiderLocation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get all manifests assigned to a rider
   */
  async getAssignedManifests(riderId: string) {
    const manifests = await this.manifestRepository.find({
      where: { riderId },
      relations: ['shipments', 'originHub', 'destinationHub'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      total: manifests.length,
      manifests: manifests.map((manifest) => ({
        id: manifest.id,
        manifestNumber: manifest.manifestNumber,
        status: manifest.status,
        originHub: manifest.originHub,
        destinationHub: manifest.destinationHub,
        totalShipments: manifest.totalShipments,
        dispatchDate: manifest.dispatchDate,
        shipments: manifest.shipments.map((s) => ({
          awb: s.awb,
          status: s.status,
          receiverName: s.receiverName,
          receiverPhone: s.receiverPhone,
          receiverAddress: s.receiverAddress,
          deliveryArea: s.deliveryArea,
          codAmount: s.codAmount,
        })),
      })),
    };
  }

  /**
   * Get all shipments assigned directly to a rider (not via manifest)
   */
  async getMyShipments(riderId: string) {
    const shipments = await this.shipmentRepository.find({
      where: { 
        riderId,
        status: ShipmentStatus.OUT_FOR_DELIVERY,
      },
      relations: ['merchant'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      total: shipments.length,
      shipments: shipments.map((s) => ({
        id: s.id,
        awb: s.awb,
        status: s.status,
        merchantName: s.merchant?.name,
        receiverName: s.receiverName,
        receiverPhone: s.receiverPhone,
        receiverAddress: s.receiverAddress,
        deliveryArea: s.deliveryArea,
        codAmount: s.codAmount,
        deliveryType: s.deliveryType,
        weight: s.weight,
        deliveryAttempts: s.deliveryAttempts,
        expectedDeliveryDate: s.expectedDeliveryDate,
        specialInstructions: s.specialInstructions,
        otpCode: s.otpCode,
      })),
    };
  }

  /**
   * Generate OTP for a shipment before delivery
   */
  async generateOTP(generateOTPDto: GenerateOTPDto, rider: User) {
    const { awbNumber } = generateOTPDto;

    const shipment = await this.shipmentRepository.findOne({
      where: { awb: awbNumber },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with AWB ${awbNumber} not found`);
    }

    // Verify rider owns this shipment
    if (shipment.riderId !== rider.id) {
      throw new ForbiddenException('This shipment is not assigned to you');
    }

    // Verify shipment status
    if (shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY) {
      throw new BadRequestException(
        `Cannot generate OTP. Shipment status is ${shipment.status}`,
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update shipment with OTP
    shipment.otpCode = otp;
    await this.shipmentRepository.save(shipment);

    // TODO: Send OTP to customer via SMS/Email using Notification service

    return {
      success: true,
      message: 'OTP generated and sent to customer',
      awb: awbNumber,
      otpGenerated: true,
    };
  }

  /**
   * Complete delivery with OTP verification
   */
  async completeDelivery(deliveryAttemptDto: DeliveryAttemptDto, rider: User) {
    const {
      awbNumber,
      otpCode,
      signatureUrl,
      podPhotoUrl,
      codAmountCollected,
      deliveryNote,
      latitude,
      longitude,
    } = deliveryAttemptDto;

    const shipment = await this.shipmentRepository.findOne({
      where: { awb: awbNumber },
      relations: ['merchant'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with AWB ${awbNumber} not found`);
    }

    // Verify rider owns this shipment
    if (shipment.riderId !== rider.id) {
      throw new ForbiddenException('This shipment is not assigned to you');
    }

    // Verify shipment status
    if (shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY) {
      throw new BadRequestException(
        `Cannot deliver. Shipment status is ${shipment.status}`,
      );
    }

    // Verify OTP
    if (!shipment.otpCode) {
      throw new BadRequestException('OTP not generated for this shipment');
    }

    if (shipment.otpCode !== otpCode) {
      throw new BadRequestException('Invalid OTP code');
    }

    // Verify COD amount if applicable
    if (shipment.paymentMethod === PaymentMethod.COD && shipment.codAmount > 0) {
      if (!codAmountCollected) {
        throw new BadRequestException('COD amount must be collected');
      }
      if (codAmountCollected !== shipment.codAmount) {
        throw new BadRequestException(
          `COD amount mismatch. Expected: ${shipment.codAmount}, Collected: ${codAmountCollected}`,
        );
      }
    }

    // Update shipment
    shipment.status = ShipmentStatus.DELIVERED;
    shipment.actualDeliveryDate = new Date();
    shipment.paymentStatus = shipment.paymentMethod === PaymentMethod.COD ? PaymentStatus.COLLECTED : shipment.paymentStatus;
    
    if (signatureUrl) {
      shipment.signatureUrl = signatureUrl;
    }
    if (podPhotoUrl) {
      shipment.podPhotoUrl = podPhotoUrl;
    }
    if (deliveryNote) {
      shipment.deliveryNote = deliveryNote;
    }

    await this.shipmentRepository.save(shipment);

    // Update rider location if provided
    if (latitude && longitude) {
      await this.updateLocation(
        {
          latitude,
          longitude,
          shipmentAwb: awbNumber,
          isOnline: true,
        },
        rider,
      );
    }

    // TODO: Send delivery confirmation notification to merchant and customer

    return {
      success: true,
      message: 'Delivery completed successfully',
      awb: awbNumber,
      deliveredAt: shipment.actualDeliveryDate,
      codCollected: codAmountCollected || 0,
    };
  }

  /**
   * Record failed delivery attempt
   */
  async recordFailedDelivery(failedDeliveryDto: FailedDeliveryDto, rider: User) {
    const { awbNumber, reason, notes, photoUrl, latitude, longitude } =
      failedDeliveryDto;

    const shipment = await this.shipmentRepository.findOne({
      where: { awb: awbNumber },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with AWB ${awbNumber} not found`);
    }

    // Verify rider owns this shipment
    if (shipment.riderId !== rider.id) {
      throw new ForbiddenException('This shipment is not assigned to you');
    }

    // Verify shipment status
    if (shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY) {
      throw new BadRequestException(
        `Cannot record failed delivery. Shipment status is ${shipment.status}`,
      );
    }

    // Increment delivery attempts
    shipment.deliveryAttempts += 1;
    shipment.status = ShipmentStatus.FAILED_DELIVERY;
    shipment.failedReason = `${reason}${notes ? ': ' + notes : ''}`;

    // Auto-initiate RTO after 3 failed attempts
    const MAX_DELIVERY_ATTEMPTS = 3;
    if (shipment.deliveryAttempts >= MAX_DELIVERY_ATTEMPTS) {
      shipment.status = ShipmentStatus.RTO_INITIATED;
      shipment.isRto = true;
      shipment.rtoReason = `Maximum delivery attempts (${MAX_DELIVERY_ATTEMPTS}) exceeded`;
    }

    await this.shipmentRepository.save(shipment);

    // Update rider location if provided
    if (latitude && longitude) {
      await this.updateLocation(
        {
          latitude,
          longitude,
          shipmentAwb: awbNumber,
          isOnline: true,
        },
        rider,
      );
    }

    // TODO: Send failed delivery notification to merchant and customer

    return {
      success: true,
      message: 'Failed delivery recorded',
      awb: awbNumber,
      deliveryAttempts: shipment.deliveryAttempts,
      status: shipment.status,
      autoRTO: shipment.deliveryAttempts >= MAX_DELIVERY_ATTEMPTS,
    };
  }

  /**
   * Mark shipment for RTO (Return to Origin)
   */
  async markRTO(rtoDto: RTODto, rider: User) {
    const { awbNumber, reason, notes } = rtoDto;

    const shipment = await this.shipmentRepository.findOne({
      where: { awb: awbNumber },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with AWB ${awbNumber} not found`);
    }

    // Verify rider owns this shipment
    if (shipment.riderId !== rider.id) {
      throw new ForbiddenException('This shipment is not assigned to you');
    }

    // Update shipment for RTO
    shipment.status = ShipmentStatus.RTO_INITIATED;
    shipment.isRto = true;
    shipment.rtoReason = `${reason}${notes ? ': ' + notes : ''}`;

    await this.shipmentRepository.save(shipment);

    // TODO: Send RTO notification to merchant

    return {
      success: true,
      message: 'Shipment marked for RTO',
      awb: awbNumber,
      status: shipment.status,
      rtoReason: shipment.rtoReason,
    };
  }

  /**
   * Update rider's live location
   */
  async updateLocation(updateLocationDto: UpdateLocationDto, rider: User) {
    const {
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      batteryLevel,
      shipmentAwb,
      isOnline,
    } = updateLocationDto;

    // Get shipment ID if AWB provided
    let shipmentId: string | null = null;
    if (shipmentAwb) {
      const shipment = await this.shipmentRepository.findOne({
        where: { awb: shipmentAwb },
        select: ['id'],
      });
      if (shipment) {
        shipmentId = shipment.id;
      }
    }

    // Create location record
    const location = new RiderLocation();
    location.riderId = rider.id;
    location.latitude = latitude;
    location.longitude = longitude;
    
    if (accuracy !== undefined) {
      location.accuracy = accuracy;
    }
    if (speed !== undefined) {
      location.speed = speed;
    }
    if (heading !== undefined) {
      location.heading = heading;
    }
    if (batteryLevel !== undefined) {
      location.batteryLevel = batteryLevel;
    }
    if (shipmentId) {
      location.shipmentId = shipmentId;
    }
    if (isOnline !== undefined) {
      location.isOnline = isOnline;
    }

    await this.riderLocationRepository.save(location);

    return {
      success: true,
      message: 'Location updated successfully',
      location: {
        latitude,
        longitude,
        timestamp: location.createdAt,
      },
    };
  }

  /**
   * Get rider's location history
   */
  async getLocationHistory(riderId: string, limit: number = 50) {
    const locations = await this.riderLocationRepository.find({
      where: { riderId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return {
      success: true,
      total: locations.length,
      locations: locations.map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
        speed: loc.speed,
        heading: loc.heading,
        batteryLevel: loc.batteryLevel,
        isOnline: loc.isOnline,
        timestamp: loc.createdAt,
      })),
    };
  }

  /**
   * Get rider's current statistics
   */
  async getMyStatistics(riderId: string) {
    const qb = this.shipmentRepository.createQueryBuilder('shipment');

    const [
      totalAssigned,
      outForDelivery,
      delivered,
      failedDeliveries,
      rtoShipments,
    ] = await Promise.all([
      qb.clone().where('shipment.riderId = :riderId', { riderId }).getCount(),
      qb
        .clone()
        .where('shipment.riderId = :riderId', { riderId })
        .andWhere('shipment.status = :status', {
          status: ShipmentStatus.OUT_FOR_DELIVERY,
        })
        .getCount(),
      qb
        .clone()
        .where('shipment.riderId = :riderId', { riderId })
        .andWhere('shipment.status = :status', {
          status: ShipmentStatus.DELIVERED,
        })
        .getCount(),
      qb
        .clone()
        .where('shipment.riderId = :riderId', { riderId })
        .andWhere('shipment.status = :status', {
          status: ShipmentStatus.FAILED_DELIVERY,
        })
        .getCount(),
      qb
        .clone()
        .where('shipment.riderId = :riderId', { riderId })
        .andWhere('shipment.isRto = :isRto', { isRto: true })
        .getCount(),
    ]);

    // Calculate total COD collected
    const codResult = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select('SUM(shipment.codAmount)', 'totalCod')
      .where('shipment.riderId = :riderId', { riderId })
      .andWhere('shipment.status = :status', {
        status: ShipmentStatus.DELIVERED,
      })
      .andWhere('shipment.paymentMethod = :method', { method: PaymentMethod.COD })
      .getRawOne();

    const totalCodCollected = parseFloat(codResult?.totalCod || '0');

    // Get today's deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDeliveries = await qb
      .clone()
      .where('shipment.riderId = :riderId', { riderId })
      .andWhere('shipment.status = :status', {
        status: ShipmentStatus.DELIVERED,
      })
      .andWhere('shipment.actualDeliveryDate >= :today', { today })
      .getCount();

    return {
      success: true,
      statistics: {
        totalAssigned,
        outForDelivery,
        delivered,
        failedDeliveries,
        rtoShipments,
        todayDeliveries,
        totalCodCollected,
        deliveryRate:
          totalAssigned > 0
            ? ((delivered / totalAssigned) * 100).toFixed(2) + '%'
            : '0%',
      },
    };
  }

  /**
   * Get shipment details by AWB (rider can only view their assigned shipments)
   */
  async getShipmentDetails(awbNumber: string, rider: User) {
    const shipment = await this.shipmentRepository.findOne({
      where: { awb: awbNumber },
      relations: ['merchant', 'rider'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with AWB ${awbNumber} not found`);
    }

    // Verify rider owns this shipment
    if (shipment.riderId !== rider.id) {
      throw new ForbiddenException('This shipment is not assigned to you');
    }

    return {
      success: true,
      shipment: {
        id: shipment.id,
        awb: shipment.awb,
        status: shipment.status,
        merchantName: shipment.merchant?.name,
        merchantPhone: shipment.merchant?.phone,
        receiverName: shipment.receiverName,
        receiverPhone: shipment.receiverPhone,
        receiverAddress: shipment.receiverAddress,
        deliveryArea: shipment.deliveryArea,
        codAmount: shipment.codAmount,
        deliveryType: shipment.deliveryType,
        weight: shipment.weight,
        paymentMethod: shipment.paymentMethod,
        paymentStatus: shipment.paymentStatus,
        deliveryAttempts: shipment.deliveryAttempts,
        failedReason: shipment.failedReason,
        deliveryNote: shipment.deliveryNote,
        expectedDeliveryDate: shipment.expectedDeliveryDate,
        actualDeliveryDate: shipment.actualDeliveryDate,
        specialInstructions: shipment.specialInstructions,
        otpCode: shipment.otpCode,
        isRto: shipment.isRto,
        rtoReason: shipment.rtoReason,
      },
    };
  }
}
