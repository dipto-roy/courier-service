import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Shipment } from '../../entities/shipment.entity';
import { RiderLocation } from '../../entities/rider-location.entity';
import { Pickup } from '../../entities/pickup.entity';
import { Manifest } from '../../entities/manifest.entity';
import { ShipmentStatus } from '../../common/enums';
import { CacheService } from '../cache/cache.service';
export interface TimelineEvent {
    status: string;
    timestamp: Date;
    location?: string;
    description: string;
    actor?: string;
}
export declare class TrackingService {
    private shipmentRepository;
    private riderLocationRepository;
    private pickupRepository;
    private manifestRepository;
    private configService;
    private cacheService;
    private pusher;
    constructor(shipmentRepository: Repository<Shipment>, riderLocationRepository: Repository<RiderLocation>, pickupRepository: Repository<Pickup>, manifestRepository: Repository<Manifest>, configService: ConfigService, cacheService: CacheService);
    trackShipment(awbNumber: string, phoneVerification?: string): Promise<{}>;
    getDetailedTracking(awbNumber: string): Promise<{
        success: boolean;
        tracking: {
            id: string;
            awb: string;
            status: ShipmentStatus;
            merchantId: string;
            merchantName: string;
            receiverName: string;
            receiverPhone: string;
            receiverAddress: string;
            deliveryArea: string;
            weight: number;
            deliveryType: import("../../common/enums").DeliveryType;
            paymentMethod: import("../../common/enums").PaymentMethod;
            codAmount: number;
            currentHub: string;
            nextHub: string;
            pickupId: string;
            manifestId: string;
            riderId: string;
            riderName: string;
            expectedDeliveryDate: Date;
            actualDeliveryDate: Date;
            createdAt: Date;
            deliveryAttempts: number;
            failedReason: string;
            deliveryNote: string;
            isRto: boolean;
            rtoReason: string;
            signatureUrl: string;
            podPhotoUrl: string;
            pickupPhotoUrl: string;
            eta: string | null;
            timeline: TimelineEvent[];
            riderLocation: {
                latitude: number;
                longitude: number;
                accuracy: number;
                speed: number;
                heading: number;
                timestamp: Date;
            }[] | null;
        };
    }>;
    private generateTimeline;
    private getRiderCurrentLocation;
    private getRiderLocationHistory;
    private calculateETA;
    emitStatusChange(shipment: Shipment, oldStatus: ShipmentStatus, newStatus: ShipmentStatus): Promise<{
        awb: string;
        oldStatus: ShipmentStatus;
        newStatus: ShipmentStatus;
        currentLocation: string;
        timestamp: string;
    }>;
    emitLocationUpdate(riderId: string, location: any, shipmentAwb?: string): Promise<{
        riderId: string;
        latitude: any;
        longitude: any;
        accuracy: any;
        timestamp: string;
    }>;
    getSubscriptionInfo(awbNumber: string): {
        success: boolean;
        subscription: {
            channel: string;
            events: string[];
            pusherKey: string | undefined;
            pusherCluster: string | undefined;
        };
    };
}
