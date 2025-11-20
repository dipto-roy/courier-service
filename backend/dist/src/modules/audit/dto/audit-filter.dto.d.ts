export declare class AuditFilterDto {
    userId?: string;
    entityType?: string;
    entityId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    ipAddress?: string;
    page?: number;
    limit?: number;
}
export declare class CreateAuditLogDto {
    userId: string;
    entityType: string;
    entityId: string;
    action: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    description?: string;
}
