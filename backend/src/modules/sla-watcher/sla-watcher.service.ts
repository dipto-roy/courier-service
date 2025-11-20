import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Shipment } from '../../entities/shipment.entity';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';
import { NotificationType } from '../../common/enums/notification-type.enum';
import { CacheService } from '../cache/cache.service';
import { NotificationsService } from '../notifications/notifications.service';

interface SLAConfig {
  pickupSLA: number; // hours
  deliverySLA: number; // hours
  inTransitSLA: number; // hours
}

@Injectable()
export class SlaWatcherService {
  private readonly logger = new Logger(SlaWatcherService.name);
  
  private readonly slaConfig: SLAConfig = {
    pickupSLA: 24, // 24 hours for pickup
    deliverySLA: 72, // 72 hours for delivery (3 days)
    inTransitSLA: 48, // 48 hours in transit without update
  };

  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectQueue('sla-watcher')
    private slaQueue: Queue,
    private cacheService: CacheService,
    private notificationsService: NotificationsService,
  ) {}

  // Run every 15 minutes
  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkSLAViolations() {
    this.logger.log('Starting SLA violation check...');

    try {
      await Promise.all([
        this.checkPickupSLA(),
        this.checkDeliverySLA(),
        this.checkInTransitSLA(),
      ]);

      this.logger.log('SLA violation check completed');
    } catch (error) {
      this.logger.error('Error in SLA violation check:', error.message);
    }
  }

  // ==================== Pickup SLA ====================

  private async checkPickupSLA() {
    const slaTime = new Date();
    slaTime.setHours(slaTime.getHours() - this.slaConfig.pickupSLA);

    const shipments = await this.shipmentRepository.find({
      where: {
        status: ShipmentStatus.PENDING,
        createdAt: LessThan(slaTime),
      },
      relations: ['merchant', 'customer'],
    });

    for (const shipment of shipments) {
      const cacheKey = `sla:pickup:${shipment.id}`;
      const alreadyNotified = await this.cacheService.exists(cacheKey);

      if (!alreadyNotified) {
        await this.handlePickupSLAViolation(shipment);
        // Cache for 24 hours to avoid duplicate notifications
        await this.cacheService.set(cacheKey, true, 86400);
      }
    }

    this.logger.log(`Checked ${shipments.length} shipments for pickup SLA violations`);
  }

  private async handlePickupSLAViolation(shipment: Shipment) {
    this.logger.warn(`Pickup SLA violated for shipment ${shipment.awb}`);

    // Add to SLA queue for processing
    await this.slaQueue.add('pickup-sla-violation', {
      shipmentId: shipment.id,
      awb: shipment.awb,
      merchantId: shipment.merchantId,
      customerId: shipment.customerId,
      violationType: 'pickup',
      createdAt: shipment.createdAt,
      slaHours: this.slaConfig.pickupSLA,
    });

    // Send notifications to merchant and support
    if (shipment.merchant) {
      await this.notificationsService.sendNotification({
        userId: shipment.merchant.id,
        type: NotificationType.EMAIL,
        title: 'Pickup SLA Violation',
        message: `Shipment ${shipment.awb} has not been picked up within ${this.slaConfig.pickupSLA}h SLA. Please take action.`,
        shipmentId: shipment.id,
      });
    }

    // Publish to Redis for real-time dashboard
    await this.cacheService.publish('sla-violations', {
      type: 'pickup',
      shipmentId: shipment.id,
      awb: shipment.awb,
      merchantId: shipment.merchantId,
      timestamp: new Date(),
    });
  }

  // ==================== Delivery SLA ====================

  private async checkDeliverySLA() {
    const slaTime = new Date();
    slaTime.setHours(slaTime.getHours() - this.slaConfig.deliverySLA);

    const shipments = await this.shipmentRepository.find({
      where: {
        status: In([
          ShipmentStatus.PICKED_UP,
          ShipmentStatus.IN_TRANSIT,
          ShipmentStatus.OUT_FOR_DELIVERY,
        ]),
        createdAt: LessThan(slaTime),
      },
      relations: ['merchant', 'customer', 'rider'],
    });

    for (const shipment of shipments) {
      const cacheKey = `sla:delivery:${shipment.id}`;
      const alreadyNotified = await this.cacheService.exists(cacheKey);

      if (!alreadyNotified) {
        await this.handleDeliverySLAViolation(shipment);
        // Cache for 12 hours, then check again
        await this.cacheService.set(cacheKey, true, 43200);
      }
    }

    this.logger.log(`Checked ${shipments.length} shipments for delivery SLA violations`);
  }

  private async handleDeliverySLAViolation(shipment: Shipment) {
    this.logger.warn(`Delivery SLA violated for shipment ${shipment.awb}`);

    // Add to SLA queue
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

    // Notify all stakeholders
    const notifications: Promise<any>[] = [];

    // Notify merchant
    if (shipment.merchant) {
      notifications.push(
        this.notificationsService.sendNotification({
          userId: shipment.merchant.id,
          type: NotificationType.EMAIL,
          title: 'Delivery SLA Violation',
          message: `Shipment ${shipment.awb} has exceeded the delivery SLA of ${this.slaConfig.deliverySLA} hours (${this.slaConfig.deliverySLA / 24} days). Current status: ${shipment.status}`,
          shipmentId: shipment.id,
        }),
      );
    }

    // Notify customer
    if (shipment.customer) {
      notifications.push(
        this.notificationsService.sendSms({
          to: shipment.customer.phone,
          message: `Your shipment ${shipment.awb} is delayed. We apologize for the inconvenience. For support, contact: 1800-FASTX`,
        }),
      );
    }

    // Notify assigned rider
    if (shipment.rider) {
      notifications.push(
        this.notificationsService.sendPushNotification({
          userId: shipment.rider.id,
          title: 'SLA Alert',
          body: `Shipment ${shipment.awb} has exceeded delivery SLA. Please prioritize.`,
        }),
      );
    }

    await Promise.all(notifications);

    // Publish to Redis
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

  // ==================== In-Transit SLA ====================

  private async checkInTransitSLA() {
    const slaTime = new Date();
    slaTime.setHours(slaTime.getHours() - this.slaConfig.inTransitSLA);

    const shipments = await this.shipmentRepository.find({
      where: {
        status: ShipmentStatus.IN_TRANSIT,
        updatedAt: LessThan(slaTime),
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

  private async handleInTransitSLAViolation(shipment: Shipment) {
    this.logger.warn(`In-transit SLA violated for shipment ${shipment.awb}`);

    // Add to SLA queue
    await this.slaQueue.add('intransit-sla-violation', {
      shipmentId: shipment.id,
      awb: shipment.awb,
      merchantId: shipment.merchantId,
      violationType: 'intransit',
      lastUpdate: shipment.updatedAt,
      slaHours: this.slaConfig.inTransitSLA,
    });

    // Internal alert only (no customer notification)
    await this.cacheService.publish('sla-violations', {
      type: 'intransit',
      shipmentId: shipment.id,
      awb: shipment.awb,
      lastUpdate: shipment.updatedAt,
      timestamp: new Date(),
    });
  }

  // ==================== Manual SLA Checks ====================

  async checkShipmentSLA(shipmentId: string): Promise<{
    isViolated: boolean;
    violations: string[];
    details: any;
  }> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const violations: string[] = [];
    const now = new Date();

    // Check pickup SLA
    if (shipment.status === ShipmentStatus.PENDING) {
      const pickupDeadline = new Date(shipment.createdAt);
      pickupDeadline.setHours(pickupDeadline.getHours() + this.slaConfig.pickupSLA);
      
      if (now > pickupDeadline) {
        violations.push('Pickup SLA exceeded');
      }
    }

    // Check delivery SLA
    if ([ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT, ShipmentStatus.OUT_FOR_DELIVERY].includes(shipment.status)) {
      const deliveryDeadline = new Date(shipment.createdAt);
      deliveryDeadline.setHours(deliveryDeadline.getHours() + this.slaConfig.deliverySLA);
      
      if (now > deliveryDeadline) {
        violations.push('Delivery SLA exceeded');
      }
    }

    // Check in-transit SLA
    if (shipment.status === ShipmentStatus.IN_TRANSIT) {
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

  async getSLAStatistics(): Promise<any> {
    const now = new Date();
    
    // Get counts for each violation type
    const pickupSlaTime = new Date();
    pickupSlaTime.setHours(pickupSlaTime.getHours() - this.slaConfig.pickupSLA);

    const deliverySlaTime = new Date();
    deliverySlaTime.setHours(deliverySlaTime.getHours() - this.slaConfig.deliverySLA);

    const [pickupViolations, deliveryViolations] = await Promise.all([
      this.shipmentRepository.count({
        where: {
          status: ShipmentStatus.PENDING,
          createdAt: LessThan(pickupSlaTime),
        },
      }),
      this.shipmentRepository.count({
        where: {
          status: In([
            ShipmentStatus.PICKED_UP,
            ShipmentStatus.IN_TRANSIT,
            ShipmentStatus.OUT_FOR_DELIVERY,
          ]),
          createdAt: LessThan(deliverySlaTime),
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

  // ==================== Queue Health ====================

  async getQueueStatus(): Promise<any> {
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
}
