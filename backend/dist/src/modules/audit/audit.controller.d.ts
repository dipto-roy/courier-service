import { AuditService } from './audit.service';
import { AuditFilterDto, CreateAuditLogDto } from './dto';
import type { Request } from 'express';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    createAuditLog(createAuditLogDto: CreateAuditLogDto, req: Request): Promise<{
        success: boolean;
        message: string;
        data: import("../../entities").AuditLog | null;
    }>;
    getAuditLogs(filterDto: AuditFilterDto): Promise<{
        success: boolean;
        data: import("../../entities").AuditLog[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getAuditLogById(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("../../entities").AuditLog;
        message?: undefined;
    }>;
    getEntityAuditTrail(entityType: string, entityId: string): Promise<{
        success: boolean;
        entityType: string;
        entityId: string;
        totalChanges: number;
        data: import("../../entities").AuditLog[];
    }>;
    getUserActivity(userId: string, limit?: number): Promise<{
        success: boolean;
        userId: string;
        totalActivities: number;
        data: import("../../entities").AuditLog[];
    }>;
    getRecentLogs(limit?: number): Promise<{
        success: boolean;
        data: import("../../entities").AuditLog[];
    }>;
    getStatistics(startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getUserStatistics(userId: string): Promise<{
        success: boolean;
        userId: string;
        data: any;
    }>;
    private getIpAddress;
}
