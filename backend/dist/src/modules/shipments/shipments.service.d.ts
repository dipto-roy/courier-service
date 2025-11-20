import { Repository } from 'typeorm';
import { Shipment, User } from '../../entities';
import { CreateShipmentDto, UpdateShipmentDto, UpdateStatusDto, FilterShipmentDto, BulkUploadResult } from './dto';
import { PaginatedResponseDto } from '../../common/dto';
import { PricingService, GeoService } from '../../common/services';
export declare class ShipmentsService {
    private readonly shipmentRepository;
    private readonly userRepository;
    private readonly pricingService;
    private readonly geoService;
    constructor(shipmentRepository: Repository<Shipment>, userRepository: Repository<User>, pricingService: PricingService, geoService: GeoService);
    create(createShipmentDto: CreateShipmentDto, merchant: User): Promise<Shipment>;
    findAll(filterDto: FilterShipmentDto, user: User): Promise<PaginatedResponseDto<Shipment>>;
    findOne(id: string, user: User): Promise<Shipment>;
    findByAWB(awb: string): Promise<Shipment>;
    update(id: string, updateShipmentDto: UpdateShipmentDto, user: User): Promise<Shipment>;
    updateStatus(id: string, updateStatusDto: UpdateStatusDto, user: User): Promise<Shipment>;
    remove(id: string, user: User): Promise<void>;
    getStatistics(user: User): Promise<{
        totalShipments: number;
        pendingShipments: number;
        inTransitShipments: number;
        deliveredShipments: number;
        statusStats: any[];
    }>;
    bulkUpload(csvData: string, merchant: User): Promise<BulkUploadResult>;
}
