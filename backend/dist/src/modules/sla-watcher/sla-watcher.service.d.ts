import { Repository } from 'typeorm';
import type { Queue } from 'bull';
import { Shipment } from '../../entities/shipment.entity';
import { CacheService } from '../cache/cache.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class SlaWatcherService {
    private shipmentRepository;
    private slaQueue;
    private cacheService;
    private notificationsService;
    private readonly logger;
    private readonly slaConfig;
    constructor(shipmentRepository: Repository<Shipment>, slaQueue: Queue, cacheService: CacheService, notificationsService: NotificationsService);
    checkSLAViolations(): Promise<void>;
    private checkPickupSLA;
    private handlePickupSLAViolation;
    private checkDeliverySLA;
    private handleDeliverySLAViolation;
    private checkInTransitSLA;
    private handleInTransitSLAViolation;
    checkShipmentSLA(shipmentId: string): Promise<{
        isViolated: boolean;
        violations: string[];
        details: any;
    }>;
    getSLAStatistics(): Promise<any>;
    getQueueStatus(): Promise<any>;
}
