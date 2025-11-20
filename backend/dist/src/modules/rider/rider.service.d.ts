import { Repository } from 'typeorm';
import { Shipment } from '../../entities/shipment.entity';
import { Manifest } from '../../entities/manifest.entity';
import { RiderLocation } from '../../entities/rider-location.entity';
import { User } from '../../entities/user.entity';
import { ShipmentStatus, PaymentMethod, PaymentStatus } from '../../common/enums';
import { DeliveryAttemptDto, FailedDeliveryDto, UpdateLocationDto, RTODto, GenerateOTPDto } from './dto';
export declare class RiderService {
    private shipmentRepository;
    private manifestRepository;
    private riderLocationRepository;
    private userRepository;
    constructor(shipmentRepository: Repository<Shipment>, manifestRepository: Repository<Manifest>, riderLocationRepository: Repository<RiderLocation>, userRepository: Repository<User>);
    getAssignedManifests(riderId: string): Promise<{
        success: boolean;
        total: number;
        manifests: {
            id: string;
            manifestNumber: string;
            status: import("../../entities/manifest.entity").ManifestStatus;
            originHub: string;
            destinationHub: string;
            totalShipments: number;
            dispatchDate: Date;
            shipments: {
                awb: string;
                status: ShipmentStatus;
                receiverName: string;
                receiverPhone: string;
                receiverAddress: string;
                deliveryArea: string;
                codAmount: number;
            }[];
        }[];
    }>;
    getMyShipments(riderId: string): Promise<{
        success: boolean;
        total: number;
        shipments: {
            id: string;
            awb: string;
            status: ShipmentStatus;
            merchantName: string;
            receiverName: string;
            receiverPhone: string;
            receiverAddress: string;
            deliveryArea: string;
            codAmount: number;
            deliveryType: import("../../common/enums").DeliveryType;
            weight: number;
            deliveryAttempts: number;
            expectedDeliveryDate: Date;
            specialInstructions: string;
            otpCode: string;
        }[];
    }>;
    generateOTP(generateOTPDto: GenerateOTPDto, rider: User): Promise<{
        success: boolean;
        message: string;
        awb: string;
        otpGenerated: boolean;
    }>;
    completeDelivery(deliveryAttemptDto: DeliveryAttemptDto, rider: User): Promise<{
        success: boolean;
        message: string;
        awb: string;
        deliveredAt: Date;
        codCollected: number;
    }>;
    recordFailedDelivery(failedDeliveryDto: FailedDeliveryDto, rider: User): Promise<{
        success: boolean;
        message: string;
        awb: string;
        deliveryAttempts: number;
        status: ShipmentStatus.FAILED_DELIVERY | ShipmentStatus.RTO_INITIATED;
        autoRTO: boolean;
    }>;
    markRTO(rtoDto: RTODto, rider: User): Promise<{
        success: boolean;
        message: string;
        awb: string;
        status: ShipmentStatus.RTO_INITIATED;
        rtoReason: string;
    }>;
    updateLocation(updateLocationDto: UpdateLocationDto, rider: User): Promise<{
        success: boolean;
        message: string;
        location: {
            latitude: number;
            longitude: number;
            timestamp: Date;
        };
    }>;
    getLocationHistory(riderId: string, limit?: number): Promise<{
        success: boolean;
        total: number;
        locations: {
            latitude: number;
            longitude: number;
            accuracy: number;
            speed: number;
            heading: number;
            batteryLevel: number;
            isOnline: boolean;
            timestamp: Date;
        }[];
    }>;
    getMyStatistics(riderId: string): Promise<{
        success: boolean;
        statistics: {
            totalAssigned: number;
            outForDelivery: number;
            delivered: number;
            failedDeliveries: number;
            rtoShipments: number;
            todayDeliveries: number;
            totalCodCollected: number;
            deliveryRate: string;
        };
    }>;
    getShipmentDetails(awbNumber: string, rider: User): Promise<{
        success: boolean;
        shipment: {
            id: string;
            awb: string;
            status: ShipmentStatus;
            merchantName: string;
            merchantPhone: string;
            receiverName: string;
            receiverPhone: string;
            receiverAddress: string;
            deliveryArea: string;
            codAmount: number;
            deliveryType: import("../../common/enums").DeliveryType;
            weight: number;
            paymentMethod: PaymentMethod;
            paymentStatus: PaymentStatus;
            deliveryAttempts: number;
            failedReason: string;
            deliveryNote: string;
            expectedDeliveryDate: Date;
            actualDeliveryDate: Date;
            specialInstructions: string;
            otpCode: string;
            isRto: boolean;
            rtoReason: string;
        };
    }>;
}
