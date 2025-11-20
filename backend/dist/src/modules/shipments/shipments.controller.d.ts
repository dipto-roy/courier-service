import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto, UpdateShipmentDto, UpdateStatusDto, FilterShipmentDto } from './dto';
import { User } from '../../entities';
export declare class ShipmentsController {
    private readonly shipmentsService;
    constructor(shipmentsService: ShipmentsService);
    create(createShipmentDto: CreateShipmentDto, user: User): Promise<import("../../entities").Shipment>;
    findAll(filterDto: FilterShipmentDto, user: User): Promise<import("../../common/dto").PaginatedResponseDto<import("../../entities").Shipment>>;
    getStatistics(user: User): Promise<{
        totalShipments: number;
        pendingShipments: number;
        inTransitShipments: number;
        deliveredShipments: number;
        statusStats: any[];
    }>;
    getShipmentsByStatus(status: string, user: User): Promise<import("../../common/dto").PaginatedResponseDto<import("../../entities").Shipment>>;
    trackByAWB(awb: string): Promise<import("../../entities").Shipment>;
    findOne(id: string, user: User): Promise<import("../../entities").Shipment>;
    update(id: string, updateShipmentDto: UpdateShipmentDto, user: User): Promise<import("../../entities").Shipment>;
    updateStatus(id: string, updateStatusDto: UpdateStatusDto, user: User): Promise<import("../../entities").Shipment>;
    remove(id: string, user: User): Promise<void>;
    bulkUpload(csvData: string, user: User): Promise<import("./dto").BulkUploadResult>;
}
