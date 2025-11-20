import { SlaWatcherService } from './sla-watcher.service';
export declare class SlaWatcherController {
    private readonly slaWatcherService;
    constructor(slaWatcherService: SlaWatcherService);
    getSLAStatistics(): Promise<{
        success: boolean;
        data: any;
    }>;
    checkShipmentSLA(shipmentId: string): Promise<{
        success: boolean;
        data: {
            isViolated: boolean;
            violations: string[];
            details: any;
        };
    }>;
    getQueueStatus(): Promise<{
        success: boolean;
        data: any;
    }>;
}
