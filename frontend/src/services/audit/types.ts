import { z } from 'zod';

// ==================== Interfaces ====================

export interface AuditLog {
  id: string;
  userId: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
  createdAt: string;
}

export interface AuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditStatistics {
  total: number;
  byEntityType: Record<string, number>;
  byAction: Record<string, number>;
  topUsers: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    activityCount: number;
  }>;
  activityByDate: Array<{
    date: string;
    count: number;
  }>;
}

export interface UserAuditStatistics {
  total: number;
  byEntityType: Record<string, number>;
  byAction: Record<string, number>;
  recentActivity: Array<{
    id: string;
    entityType: string;
    action: string;
    createdAt: string;
  }>;
}

// ==================== Filter Types ====================

export interface AuditFilters {
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

// ==================== Zod Schemas ====================

export const createAuditLogSchema = z.object({
  userId: z.string().uuid(),
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  action: z.string().min(1, 'Action is required'),
  oldValues: z.record(z.string(), z.unknown()).optional(),
  newValues: z.record(z.string(), z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  description: z.string().optional(),
});

export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
