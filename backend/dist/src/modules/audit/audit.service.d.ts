import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { AuditFilterDto, CreateAuditLogDto } from './dto';
export declare class AuditService {
    private auditLogRepository;
    private readonly logger;
    constructor(auditLogRepository: Repository<AuditLog>);
    log(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog | null>;
    logAction(userId: string, entityType: string, entityId: string, action: string, description?: string, oldValues?: any, newValues?: any, ipAddress?: string, userAgent?: string): Promise<AuditLog | null>;
    logShipmentAction(userId: string, shipmentId: string, action: string, description: string, oldValues?: any, newValues?: any, ipAddress?: string, userAgent?: string): Promise<AuditLog | null>;
    logUserAction(userId: string, targetUserId: string, action: string, description: string, oldValues?: any, newValues?: any, ipAddress?: string, userAgent?: string): Promise<AuditLog | null>;
    logPickupAction(userId: string, pickupId: string, action: string, description: string, oldValues?: any, newValues?: any, ipAddress?: string, userAgent?: string): Promise<AuditLog | null>;
    logManifestAction(userId: string, manifestId: string, action: string, description: string, oldValues?: any, newValues?: any, ipAddress?: string, userAgent?: string): Promise<AuditLog | null>;
    logTransactionAction(userId: string, transactionId: string, action: string, description: string, oldValues?: any, newValues?: any, ipAddress?: string, userAgent?: string): Promise<AuditLog | null>;
    logAuthAction(userId: string, action: string, description: string, ipAddress?: string, userAgent?: string): Promise<AuditLog | null>;
    getAuditLogs(filterDto: AuditFilterDto): Promise<{
        data: AuditLog[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getAuditLogById(id: string): Promise<AuditLog | null>;
    getEntityAuditTrail(entityType: string, entityId: string): Promise<AuditLog[]>;
    getUserActivityLogs(userId: string, limit?: number): Promise<AuditLog[]>;
    getRecentLogs(limit?: number): Promise<AuditLog[]>;
    getAuditStatistics(startDate?: string, endDate?: string): Promise<any>;
    getUserStatistics(userId: string): Promise<any>;
    deleteOldLogs(daysToKeep?: number): Promise<number>;
    compareAndLog(userId: string, entityType: string, entityId: string, action: string, oldEntity: any, newEntity: any, ipAddress?: string, userAgent?: string): Promise<AuditLog | null>;
    private extractChanges;
    private generateChangeDescription;
}
