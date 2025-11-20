import { User } from './user.entity';
import { Shipment } from './shipment.entity';
export declare enum PickupStatus {
    PENDING = "pending",
    ASSIGNED = "assigned",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Pickup {
    id: string;
    merchantId: string;
    agentId: string;
    status: PickupStatus;
    pickupAddress: string;
    pickupCity: string;
    pickupArea: string;
    pickupDate: Date;
    scheduledDate: Date;
    contactPerson: string;
    contactPhone: string;
    totalShipments: number;
    notes: string;
    signatureUrl: string;
    photoUrl: string;
    latitude: string;
    longitude: string;
    createdAt: Date;
    updatedAt: Date;
    agent: User;
    merchant: User;
    shipments: Shipment[];
}
