import { User } from './user.entity';
export declare class RiderLocation {
    id: string;
    riderId: string;
    shipmentId: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number;
    heading: number;
    batteryLevel: number;
    isOnline: boolean;
    createdAt: Date;
    rider: User;
}
