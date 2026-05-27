import apiClient from '@/src/common/lib/apiClient';
import type {
  AuditLog,
  AuditLogsResponse,
  AuditStatistics,
  UserAuditStatistics,
  AuditFilters,
  CreateAuditLogInput,
} from './types';

const ENDPOINTS = {
  LOG: '/audit/log',
  LOGS: '/audit/logs',
  LOG_DETAIL: (id: string) => `/audit/logs/${id}`,
  ENTITY: (entityType: string, entityId: string) => `/audit/entity/${entityType}/${entityId}`,
  USER: (userId: string) => `/audit/user/${userId}`,
  RECENT: '/audit/recent',
  STATISTICS: '/audit/statistics',
  USER_STATISTICS: (userId: string) => `/audit/statistics/user/${userId}`,
} as const;

class AuditService {
  /**
   * Create a manual audit log entry (Admin only)
   */
  async createLog(data: CreateAuditLogInput): Promise<AuditLog> {
    const response = await apiClient.post<{ success: boolean; data: AuditLog }>(
      ENDPOINTS.LOG,
      data,
    );
    return response.data.data;
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getLogs(filters?: AuditFilters): Promise<AuditLogsResponse> {
    const response = await apiClient.get<AuditLogsResponse>(ENDPOINTS.LOGS, {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get audit log by ID
   */
  async getLogById(id: string): Promise<AuditLog> {
    const response = await apiClient.get<{ success: boolean; data: AuditLog }>(
      ENDPOINTS.LOG_DETAIL(id),
    );
    return response.data.data;
  }

  /**
   * Get entity audit trail
   */
  async getEntityAuditTrail(
    entityType: string,
    entityId: string,
  ): Promise<{ totalChanges: number; data: AuditLog[] }> {
    const response = await apiClient.get<{
      success: boolean;
      entityType: string;
      entityId: string;
      totalChanges: number;
      data: AuditLog[];
    }>(ENDPOINTS.ENTITY(entityType, entityId));
    return { totalChanges: response.data.totalChanges, data: response.data.data };
  }

  /**
   * Get user activity logs
   */
  async getUserActivity(userId: string, limit?: number): Promise<AuditLog[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: AuditLog[];
    }>(ENDPOINTS.USER(userId), { params: limit ? { limit } : undefined });
    return response.data.data;
  }

  /**
   * Get recent audit logs (Admin only)
   */
  async getRecentLogs(limit?: number): Promise<AuditLog[]> {
    const response = await apiClient.get<{ success: boolean; data: AuditLog[] }>(
      ENDPOINTS.RECENT,
      { params: limit ? { limit } : undefined },
    );
    return response.data.data;
  }

  /**
   * Get audit statistics
   */
  async getStatistics(startDate?: string, endDate?: string): Promise<AuditStatistics> {
    const response = await apiClient.get<{ success: boolean; data: AuditStatistics }>(
      ENDPOINTS.STATISTICS,
      { params: { startDate, endDate } },
    );
    return response.data.data;
  }

  /**
   * Get user audit statistics
   */
  async getUserStatistics(userId: string): Promise<UserAuditStatistics> {
    const response = await apiClient.get<{ success: boolean; data: UserAuditStatistics }>(
      ENDPOINTS.USER_STATISTICS(userId),
    );
    return response.data.data;
  }
}

export const auditService = new AuditService();
