import { User } from './user.entity';
import { Shipment } from './shipment.entity';
export declare enum ManifestStatus {
    CREATED = "created",
    IN_TRANSIT = "in_transit",
    RECEIVED = "received",
    CLOSED = "closed"
}
export declare class Manifest {
    id: string;
    manifestNumber: string;
    originHub: string;
    destinationHub: string;
    riderId: string;
    status: ManifestStatus;
    totalShipments: number;
    dispatchDate: Date;
    receivedDate: Date;
    createdById: string;
    receivedById: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: User;
    receivedBy: User;
    rider: User;
    shipments: Shipment[];
}
