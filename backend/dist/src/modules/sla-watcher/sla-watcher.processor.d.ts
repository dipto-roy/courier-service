import type { Job } from 'bull';
import { AuditService } from '../audit/audit.service';
export declare class SlaWatcherProcessor {
    private auditService;
    private readonly logger;
    constructor(auditService: AuditService);
    handlePickupSLAViolation(job: Job): Promise<{
        success: boolean;
        shipmentId: any;
        awb: any;
    }>;
    handleDeliverySLAViolation(job: Job): Promise<{
        success: boolean;
        shipmentId: any;
        awb: any;
    }>;
    handleInTransitSLAViolation(job: Job): Promise<{
        success: boolean;
        shipmentId: any;
        awb: any;
    }>;
    onActive(job: Job): void;
    onCompleted(job: Job, result: any): void;
    onFailed(job: Job, error: Error): void;
}
