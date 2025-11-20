import { HubService } from './hub.service';
import { InboundScanDto, OutboundScanDto, CreateManifestDto, ReceiveManifestDto, FilterManifestDto, SortingDto } from './dto';
import { User } from '../../entities/user.entity';
export declare class HubController {
    private readonly hubService;
    constructor(hubService: HubService);
    inboundScan(inboundScanDto: InboundScanDto, user: User): Promise<{
        success: boolean;
        scannedCount: number;
        hubLocation: string;
        scannedShipments: {
            awb: string;
            status: import("../../common/enums").ShipmentStatus;
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
            status: import("../../common/enums").ShipmentStatus;
            destination: string;
        }[];
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
    createManifest(createManifestDto: CreateManifestDto, user: User): Promise<{
        success: boolean;
        manifest: {
            id: string;
            manifestNumber: string;
            originHub: string;
            destinationHub: string;
            totalShipments: number;
            status: import("../../entities").ManifestStatus.IN_TRANSIT;
            dispatchDate: Date;
        };
        message: string;
    }>;
    findAllManifests(filterDto: FilterManifestDto, user: User): Promise<any>;
    getStatistics(hubLocation?: string): Promise<{
        total: number;
        created: number;
        inTransit: number;
        received: number;
        closed: number;
        hubLocation: string;
    }>;
    findOneManifest(id: string): Promise<import("../../entities").Manifest>;
    receiveManifest(id: string, receiveManifestDto: ReceiveManifestDto, user: User): Promise<{
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
    closeManifest(id: string, user: User): Promise<{
        success: boolean;
        manifestNumber: string;
        message: string;
    }>;
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
}
