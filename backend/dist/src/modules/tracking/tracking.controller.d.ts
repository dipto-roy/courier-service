import { TrackingService, TimelineEvent } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';
export declare class TrackingController {
    private readonly trackingService;
    private readonly trackingGateway;
    constructor(trackingService: TrackingService, trackingGateway: TrackingGateway);
    trackPublic(awb: string, phone?: string): Promise<{}>;
    getDetailedTracking(awb: string): Promise<{
        success: boolean;
        tracking: {
            id: string;
            awb: string;
            status: import("../../common/enums").ShipmentStatus;
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
    getSubscriptionInfo(awb: string): {
        success: boolean;
        subscription: {
            channel: string;
            events: string[];
            pusherKey: string | undefined;
            pusherCluster: string | undefined;
        };
    };
    getGatewayStatus(): {
        status: string;
        namespace: string;
        activeConnections: number;
        activeSubscriptions: number;
        subscriptions: {
            awb: string;
            connections: number;
        }[];
        serverRunning: boolean;
    };
    getActiveSubscriptions(): {
        subscriptions: {
            awb: string;
            connections: number;
        }[];
        timestamp: string;
    };
    sendTestEvent(awb: string): {
        success: boolean;
        message: string;
        subscriberCount: number;
        hasSubscribers: boolean;
    };
    getMonitoringData(): Promise<{
        gateway: {
            status: string;
            namespace: string;
            activeConnections: number;
            activeSubscriptions: number;
            subscriptions: {
                awb: string;
                connections: number;
            }[];
            serverRunning: boolean;
        };
        recentActivity: {
            activeTracking: number;
            totalSubscribers: number;
        };
        health: {
            websocket: string;
            namespace: string;
            timestamp: string;
        };
        activeShipments: {
            awb: string;
            connections: number;
        }[];
    }>;
}
