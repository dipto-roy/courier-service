import { Repository } from 'typeorm';
import { Manifest, ManifestStatus } from '../../entities/manifest.entity';
import { Shipment } from '../../entities/shipment.entity';
import { User } from '../../entities/user.entity';
import { ShipmentStatus } from '../../common/enums';
import { InboundScanDto, OutboundScanDto, CreateManifestDto, ReceiveManifestDto, FilterManifestDto, SortingDto } from './dto';
interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
export declare class HubService {
    private manifestRepository;
    private shipmentRepository;
    private userRepository;
    constructor(manifestRepository: Repository<Manifest>, shipmentRepository: Repository<Shipment>, userRepository: Repository<User>);
    private generateManifestNumber;
    inboundScan(inboundScanDto: InboundScanDto, user: User): Promise<{
        success: boolean;
        scannedCount: number;
        hubLocation: string;
        scannedShipments: {
            awb: string;
            status: ShipmentStatus;
            currentHub: string;
        }[];
        message: string;
    }>;
    outboundScan(outboundScanDto: OutboundScanDto, user: User): Promise<{
        success: boolean;
        scannedCount: number;
        originHub: string;
        destinationHub: string | null;
        scannedShipments: {
            awb: string;
            status: ShipmentStatus;
            destination: string;
        }[];
        message: string;
    }>;
    createManifest(createManifestDto: CreateManifestDto, user: User): Promise<{
        success: boolean;
        manifest: {
            id: string;
            manifestNumber: string;
            originHub: string;
            destinationHub: string;
            totalShipments: number;
            status: ManifestStatus.IN_TRANSIT;
            dispatchDate: Date;
        };
        message: string;
    }>;
    receiveManifest(manifestId: string, receiveManifestDto: ReceiveManifestDto, user: User): Promise<{
        success: boolean;
        manifestNumber: string;
        receivedCount: number;
        expectedCount: number;
        discrepancies: {
            notInManifest: string[];
            notReceived: string[];
        };
        message: string;
    }>;
    closeManifest(manifestId: string, user: User): Promise<{
        success: boolean;
        manifestNumber: string;
        message: string;
    }>;
    sortShipments(sortingDto: SortingDto, user: User): Promise<{
        success: boolean;
        sortedCount: number;
        hubLocation: string;
        destinationHub: string;
        sortedShipments: {
            awb: string;
            nextHub: string;
        }[];
        message: string;
    }>;
    findAll(filterDto: FilterManifestDto, user: User): Promise<PaginatedResponse<Manifest>>;
    findOne(manifestId: string): Promise<Manifest>;
    getHubInventory(hubLocation: string): Promise<{
        hubLocation: string;
        statistics: {
            totalShipments: number;
            byDestination: Record<string, number>;
            byType: {
                express: number;
                normal: number;
            };
            codShipments: number;
            totalCodAmount: number;
        };
        shipments: {
            awb: string;
            merchantName: string;
            deliveryArea: string;
            nextHub: string;
            weight: number;
            codAmount: number;
            deliveryType: import("../../common/enums").DeliveryType;
            createdAt: Date;
        }[];
    }>;
    getStatistics(hubLocation?: string): Promise<{
        total: number;
        created: number;
        inTransit: number;
        received: number;
        closed: number;
        hubLocation: string;
    }>;
}
export {};
