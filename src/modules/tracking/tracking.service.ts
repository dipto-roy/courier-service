import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Shipment } from '../../entities/shipment.entity';
import { RiderLocation } from '../../entities/rider-location.entity';
import { Pickup } from '../../entities/pickup.entity';
import { Manifest } from '../../entities/manifest.entity';
import { ShipmentStatus } from '../../common/enums';
import { CacheService } from '../cache/cache.service';
import Pusher from 'pusher';

export interface TimelineEvent {
  status: string;
  timestamp: Date;
  location?: string;
  description: string;
  actor?: string;
}

@Injectable()
export class TrackingService {
  private pusher: Pusher;

  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(RiderLocation)
    private riderLocationRepository: Repository<RiderLocation>,
    @InjectRepository(Pickup)
    private pickupRepository: Repository<Pickup>,
    @InjectRepository(Manifest)
    private manifestRepository: Repository<Manifest>,
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {
    // Initialize Pusher if config is available
    const pusherAppId = this.configService.get<string>('PUSHER_APP_ID');
    const pusherKey = this.configService.get<string>('PUSHER_KEY');
    const pusherSecret = this.configService.get<string>('PUSHER_SECRET');
    const pusherCluster = this.configService.get<string>('PUSHER_CLUSTER');

    if (pusherAppId && pusherKey && pusherSecret && pusherCluster) {
      this.pusher = new Pusher({
        appId: pusherAppId,
        key: pusherKey,
        secret: pusherSecret,
        cluster: pusherCluster,
        useTLS: true,
      });
    }
  }

  /**
   * Public tracking by AWB - returns safe subset of data
   */
  async trackShipment(awbNumber: string, phoneVerification?: string) {
    // Try cache first
    const cacheKey = `tracking:public:${awbNumber}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached && !phoneVerification) {
      return cached;
    }

    const shipment = await this.shipmentRepository.findOne({
      where: { awb: awbNumber },
      relations: ['merchant', 'rider'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with AWB ${awbNumber} not found`);
    }

    // Optional phone verification for additional security
    if (phoneVerification) {
      const lastFourDigits = shipment.receiverPhone.slice(-4);
      if (phoneVerification !== lastFourDigits) {
        throw new UnauthorizedException('Phone verification failed');
      }
    }

    // Generate timeline
    const timeline = await this.generateTimeline(shipment);

    // Get current location if rider is assigned
    let currentLocation: { latitude: number; longitude: number; accuracy: number; timestamp: Date; isOnline: boolean; } | null = null;
    if (shipment.riderId && shipment.status === ShipmentStatus.OUT_FOR_DELIVERY) {
      currentLocation = await this.getRiderCurrentLocation(shipment.riderId);
    }

    // Calculate ETA
    const eta = this.calculateETA(shipment);

    const result = {
      success: true,
      tracking: {
        awb: shipment.awb,
        status: shipment.status,
        currentLocation: shipment.currentHub || shipment.currentHub || 'In Transit',
        expectedDeliveryDate: shipment.expectedDeliveryDate,
        actualDeliveryDate: shipment.actualDeliveryDate,
        eta,
        receiverName: shipment.receiverName,
        receiverAddress: shipment.receiverAddress,
        deliveryArea: shipment.deliveryArea,
        weight: shipment.weight,
        deliveryType: shipment.deliveryType,
        deliveryAttempts: shipment.deliveryAttempts,
        isRto: shipment.isRto,
        timeline,
        riderLocation: currentLocation,
      },
    };

    // Cache for 2 minutes
    await this.cacheService.set(cacheKey, result, 120);

    return result;
  }

  /**
   * Get detailed tracking for authenticated users (merchants, admins)
   */
  async getDetailedTracking(awbNumber: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: { awb: awbNumber },
      relations: ['merchant', 'rider', 'pickup', 'manifest'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with AWB ${awbNumber} not found`);
    }

    const timeline = await this.generateTimeline(shipment);
    
    let riderLocation: Array<{ latitude: number; longitude: number; accuracy: number; speed: number; heading: number; timestamp: Date; }> | null = null;
    if (shipment.riderId) {
      riderLocation = await this.getRiderLocationHistory(shipment.riderId, 10);
    }

    const eta = this.calculateETA(shipment);

    return {
      success: true,
      tracking: {
        // Full shipment details
        id: shipment.id,
        awb: shipment.awb,
        status: shipment.status,
        
        // Merchant info
        merchantId: shipment.merchantId,
        merchantName: shipment.merchant?.name,
        
        // Customer info
        receiverName: shipment.receiverName,
        receiverPhone: shipment.receiverPhone,
        receiverAddress: shipment.receiverAddress,
        deliveryArea: shipment.deliveryArea,
        
        // Shipment details
        weight: shipment.weight,
        deliveryType: shipment.deliveryType,
        paymentMethod: shipment.paymentMethod,
        codAmount: shipment.codAmount,
        
        // Tracking details
        currentHub: shipment.currentHub,
        nextHub: shipment.nextHub,
        pickupId: shipment.pickupId,
        manifestId: shipment.manifestId,
        riderId: shipment.riderId,
        riderName: shipment.rider?.name,
        
        // Dates
        expectedDeliveryDate: shipment.expectedDeliveryDate,
        actualDeliveryDate: shipment.actualDeliveryDate,
        createdAt: shipment.createdAt,
        
        // Delivery info
        deliveryAttempts: shipment.deliveryAttempts,
        failedReason: shipment.failedReason,
        deliveryNote: shipment.deliveryNote,
        
        // RTO info
        isRto: shipment.isRto,
        rtoReason: shipment.rtoReason,
        
        // POD
        signatureUrl: shipment.signatureUrl,
        podPhotoUrl: shipment.podPhotoUrl,
        pickupPhotoUrl: shipment.pickupPhotoUrl,
        
        // Calculated
        eta,
        timeline,
        riderLocation,
      },
    };
  }

  /**
   * Generate shipment timeline from various events
   */
  private async generateTimeline(shipment: Shipment): Promise<TimelineEvent[]> {
    const timeline: TimelineEvent[] = [];

    // 1. Shipment created
    timeline.push({
      status: 'PENDING',
      timestamp: shipment.createdAt,
      description: 'Shipment created by merchant',
      actor: shipment.merchant?.name,
    });

    // 2. Pickup assigned/completed
    if (shipment.pickupId) {
      const pickup = await this.pickupRepository.findOne({
        where: { id: shipment.pickupId },
        relations: ['agent'],
      });

      if (pickup) {
        // Use status field to determine if assigned/completed
        if (pickup.status === 'assigned' || pickup.status === 'in_progress' || pickup.status === 'completed') {
          timeline.push({
            status: 'PICKUP_ASSIGNED',
            timestamp: pickup.updatedAt,
            location: pickup.pickupAddress,
            description: 'Pickup assigned to agent',
            actor: pickup.agent?.name,
          });
        }

        if (pickup.status === 'completed' && pickup.pickupDate) {
          timeline.push({
            status: 'PICKED_UP',
            timestamp: pickup.pickupDate,
            location: pickup.pickupAddress,
            description: 'Shipment picked up by agent',
            actor: pickup.agent?.name,
          });
        }
      }
    }

    // 3. Hub operations - inbound scan
    if (shipment.status === ShipmentStatus.IN_HUB || 
        shipment.status === ShipmentStatus.IN_TRANSIT ||
        shipment.status === ShipmentStatus.OUT_FOR_DELIVERY ||
        shipment.status === ShipmentStatus.DELIVERED ||
        shipment.status === ShipmentStatus.FAILED_DELIVERY) {
      // Add hub inbound event (estimated based on pickup completion + 2 hours)
      if (shipment.pickupId) {
        const pickup = await this.pickupRepository.findOne({
          where: { id: shipment.pickupId },
          select: ['pickupDate', 'status'],
        });
        
        if (pickup?.pickupDate) {
          const hubArrival = new Date(pickup.pickupDate);
          hubArrival.setHours(hubArrival.getHours() + 2);
          
          timeline.push({
            status: 'IN_HUB',
            timestamp: hubArrival,
            location: shipment.currentHub || 'Origin Hub',
            description: 'Arrived at hub for sorting',
          });
        }
      }
    }

    // 4. Manifest operations
    if (shipment.manifestId) {
      const manifest = await this.manifestRepository.findOne({
        where: { id: shipment.manifestId },
        relations: ['rider'],
      });

      if (manifest) {
        if (manifest.dispatchDate) {
          timeline.push({
            status: 'IN_TRANSIT',
            timestamp: manifest.dispatchDate,
            location: `${manifest.originHub} → ${manifest.destinationHub}`,
            description: `Dispatched to ${manifest.destinationHub}`,
            actor: manifest.rider?.name,
          });
        }

        if (manifest.receivedDate) {
          timeline.push({
            status: 'IN_HUB',
            timestamp: manifest.receivedDate,
            location: manifest.destinationHub,
            description: `Received at ${manifest.destinationHub}`,
          });
        }
      }
    }

    // 5. Out for delivery
    if (shipment.status === ShipmentStatus.OUT_FOR_DELIVERY ||
        shipment.status === ShipmentStatus.DELIVERED ||
        shipment.status === ShipmentStatus.FAILED_DELIVERY) {
      
      // Get first location update after status became OUT_FOR_DELIVERY
      if (shipment.riderId) {
        const firstLocation = await this.riderLocationRepository.findOne({
          where: { riderId: shipment.riderId, shipmentId: shipment.id },
          order: { createdAt: 'ASC' },
        });

        if (firstLocation) {
          timeline.push({
            status: 'OUT_FOR_DELIVERY',
            timestamp: firstLocation.createdAt,
            location: shipment.deliveryArea,
            description: 'Out for delivery',
            actor: shipment.rider?.name,
          });
        }
      }
    }

    // 6. Failed delivery attempts
    if (shipment.deliveryAttempts > 0 && shipment.failedReason) {
      // Estimate failed attempt times (we don't have exact timestamps)
      const attemptTime = new Date();
      attemptTime.setHours(attemptTime.getHours() - (shipment.deliveryAttempts * 2));
      
      timeline.push({
        status: 'FAILED_DELIVERY',
        timestamp: attemptTime,
        location: shipment.deliveryArea,
        description: `Delivery attempt failed: ${shipment.failedReason}`,
        actor: shipment.rider?.name,
      });
    }

    // 7. Delivered
    if (shipment.actualDeliveryDate) {
      timeline.push({
        status: 'DELIVERED',
        timestamp: shipment.actualDeliveryDate,
        location: shipment.receiverAddress,
        description: 'Shipment delivered successfully',
        actor: shipment.rider?.name,
      });
    }

    // 8. RTO
    if (shipment.isRto) {
      timeline.push({
        status: 'RTO_INITIATED',
        timestamp: new Date(), // Use current time as we don't have exact RTO timestamp
        location: shipment.currentHub,
        description: `Return to origin: ${shipment.rtoReason}`,
      });
    }

    // Sort timeline by timestamp
    timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return timeline;
  }

  /**
   * Get rider's current location
   */
  private async getRiderCurrentLocation(riderId: string) {
    const location = await this.riderLocationRepository.findOne({
      where: { riderId },
      order: { createdAt: 'DESC' },
    });

    if (!location) {
      return null;
    }

    return {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: location.createdAt,
      isOnline: location.isOnline,
    };
  }

  /**
   * Get rider's location history
   */
  private async getRiderLocationHistory(riderId: string, limit: number = 10) {
    const locations = await this.riderLocationRepository.find({
      where: { riderId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return locations.map((loc) => ({
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: loc.accuracy,
      speed: loc.speed,
      heading: loc.heading,
      timestamp: loc.createdAt,
    }));
  }

  /**
   * Calculate ETA based on shipment status and delivery type
   */
  private calculateETA(shipment: Shipment): string | null {
    if (shipment.actualDeliveryDate) {
      return null; // Already delivered
    }

    if (shipment.isRto) {
      return null; // RTO shipments don't have ETA
    }

    // If expected delivery date exists and in future, use it
    if (shipment.expectedDeliveryDate) {
      const now = new Date();
      if (shipment.expectedDeliveryDate > now) {
        const hoursRemaining = Math.ceil(
          (shipment.expectedDeliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
        );
        
        if (hoursRemaining <= 24) {
          return `${hoursRemaining} hours`;
        } else {
          const daysRemaining = Math.ceil(hoursRemaining / 24);
          return `${daysRemaining} days`;
        }
      }
    }

    // Fallback ETA calculation based on status
    switch (shipment.status) {
      case ShipmentStatus.PENDING:
      case ShipmentStatus.PICKUP_ASSIGNED:
        return '2-3 days';
      
      case ShipmentStatus.PICKED_UP:
      case ShipmentStatus.IN_HUB:
        return '1-2 days';
      
      case ShipmentStatus.IN_TRANSIT:
        return '12-24 hours';
      
      case ShipmentStatus.OUT_FOR_DELIVERY:
        return '2-4 hours';
      
      default:
        return null;
    }
  }

  /**
   * Emit status change event via Pusher and Redis pub/sub
   */
  async emitStatusChange(shipment: Shipment, oldStatus: ShipmentStatus, newStatus: ShipmentStatus) {
    const trackingData = {
      awb: shipment.awb,
      oldStatus,
      newStatus,
      currentLocation: shipment.currentHub || 'In Transit',
      timestamp: new Date().toISOString(),
    };

    // Emit to Redis pub/sub for internal services
    await this.cacheService.publish(`tracking:${shipment.awb}`, trackingData);
    await this.cacheService.publish('tracking:all', trackingData);

    // Invalidate cache
    await this.cacheService.del(`tracking:public:${shipment.awb}`);
    await this.cacheService.del(`tracking:detailed:${shipment.awb}`);

    // Emit to Pusher channel (shipment-specific)
    try {
      await this.pusher.trigger(
        `shipment-${shipment.awb}`,
        'status-changed',
        trackingData
      );

      // Also emit to merchant channel
      if (shipment.merchantId) {
        await this.pusher.trigger(
          `merchant-${shipment.merchantId}`,
          'shipment-updated',
          trackingData
        );
      }
    } catch (error) {
      console.error('Pusher emit error:', error);
      // Don't throw - status update should succeed even if Pusher fails
    }

    return trackingData;
  }

  /**
   * Emit location update via Pusher and Redis pub/sub
   */
  async emitLocationUpdate(riderId: string, location: any, shipmentAwb?: string) {
    const locationData = {
      riderId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: new Date().toISOString(),
    };

    // Emit to Redis pub/sub
    await this.cacheService.publish(`rider:location:${riderId}`, locationData);
    if (shipmentAwb) {
      await this.cacheService.publish(`tracking:${shipmentAwb}:location`, locationData);
    }

    // Store latest location in cache (5 minute TTL)
    await this.cacheService.set(`rider:location:latest:${riderId}`, locationData, 300);

    try {
      // Emit to rider channel
      await this.pusher.trigger(
        `rider-${riderId}`,
        'location-updated',
        locationData
      );

      // If shipment AWB provided, emit to shipment channel too
      if (shipmentAwb) {
        await this.pusher.trigger(
          `shipment-${shipmentAwb}`,
          'rider-location-updated',
          locationData
        );
      }
    } catch (error) {
      console.error('Pusher location emit error:', error);
    }

    return locationData;
  }

  /**
   * Subscribe to shipment updates (returns channel info for client)
   */
  getSubscriptionInfo(awbNumber: string) {
    return {
      success: true,
      subscription: {
        channel: `shipment-${awbNumber}`,
        events: ['status-changed', 'rider-location-updated'],
        pusherKey: this.configService.get<string>('PUSHER_KEY'),
        pusherCluster: this.configService.get<string>('PUSHER_CLUSTER'),
      },
    };
  }
}
