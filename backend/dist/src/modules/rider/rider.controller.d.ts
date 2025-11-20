import { RiderService } from './rider.service';
import { DeliveryAttemptDto, FailedDeliveryDto, UpdateLocationDto, RTODto, GenerateOTPDto } from './dto';
export declare class RiderController {
    private readonly riderService;
    constructor(riderService: RiderService);
    getAssignedManifests(req: any): Promise<{
        success: boolean;
        total: number;
        manifests: {
            id: string;
            manifestNumber: string;
            status: import("../../entities").ManifestStatus;
            originHub: string;
            destinationHub: string;
            totalShipments: number;
            dispatchDate: Date;
            shipments: {
                awb: string;
                status: import("../../common/enums").ShipmentStatus;
                receiverName: string;
                receiverPhone: string;
                receiverAddress: string;
                deliveryArea: string;
                codAmount: number;
            }[];
        }[];
    }>;
    getMyShipments(req: any): Promise<{
        success: boolean;
        total: number;
        shipments: {
            id: string;
            awb: string;
            status: import("../../common/enums").ShipmentStatus;
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
    getShipmentDetails(awb: string, req: any): Promise<{
        success: boolean;
        shipment: {
            id: string;
            awb: string;
            status: import("../../common/enums").ShipmentStatus;
            merchantName: string;
            merchantPhone: string;
            receiverName: string;
            receiverPhone: string;
            receiverAddress: string;
            deliveryArea: string;
            codAmount: number;
            deliveryType: import("../../common/enums").DeliveryType;
            weight: number;
            paymentMethod: import("../../common/enums").PaymentMethod;
            paymentStatus: import("../../common/enums").PaymentStatus;
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
    generateOTP(generateOTPDto: GenerateOTPDto, req: any): Promise<{
        success: boolean;
        message: string;
        awb: string;
        otpGenerated: boolean;
    }>;
    completeDelivery(deliveryAttemptDto: DeliveryAttemptDto, req: any): Promise<{
        success: boolean;
        message: string;
        awb: string;
        deliveredAt: Date;
        codCollected: number;
    }>;
    recordFailedDelivery(failedDeliveryDto: FailedDeliveryDto, req: any): Promise<{
        success: boolean;
        message: string;
        awb: string;
        deliveryAttempts: number;
        status: import("../../common/enums").ShipmentStatus.FAILED_DELIVERY | import("../../common/enums").ShipmentStatus.RTO_INITIATED;
        autoRTO: boolean;
    }>;
    markRTO(rtoDto: RTODto, req: any): Promise<{
        success: boolean;
        message: string;
        awb: string;
        status: import("../../common/enums").ShipmentStatus.RTO_INITIATED;
        rtoReason: string;
    }>;
    updateLocation(updateLocationDto: UpdateLocationDto, req: any): Promise<{
        success: boolean;
        message: string;
        location: {
            latitude: number;
            longitude: number;
            timestamp: Date;
        };
    }>;
    getLocationHistory(req: any, limit?: number): Promise<{
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
    getMyStatistics(req: any): Promise<{
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
}
