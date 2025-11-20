import { User } from './user.entity';
export declare class AuditLog {
    id: string;
    userId: string;
    entityType: string;
    entityId: string;
    action: string;
    oldValues: any;
    newValues: any;
    ipAddress: string;
    userAgent: string;
    description: string;
    createdAt: Date;
    user: User;
}
