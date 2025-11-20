import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrackingService } from './tracking.service';
export declare class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly trackingService;
    server: Server;
    private logger;
    private activeConnections;
    constructor(trackingService: TrackingService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribe(data: {
        awb: string;
    }, client: Socket): Promise<{
        success: boolean;
        error: string;
    } | {
        success: boolean;
        awb: string;
        message: string;
    }>;
    handleUnsubscribe(data: {
        awb: string;
    }, client: Socket): Promise<{
        success: boolean;
        error: string;
    } | {
        success: boolean;
        awb: string;
        message: string;
    }>;
    handleGetTracking(data: {
        awb: string;
    }, client: Socket): Promise<{}>;
    emitStatusUpdate(awb: string, statusUpdate: {
        status: string;
        description?: string;
    }): void;
    emitLocationUpdate(awb: string, location: {
        latitude: number;
        longitude: number;
    }): void;
    emitEtaUpdate(awb: string, eta: string): void;
    getActiveSubscriptions(): {
        awb: string;
        connections: number;
    }[];
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
    emitTestEvent(awb: string): {
        success: boolean;
        message: string;
        subscriberCount: number;
        hasSubscribers: boolean;
    };
    getActiveRooms(): string[];
}
