import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { auditService } from '../audit.service';
import type { AuditFilters, CreateAuditLogInput } from '../types';

const auditKeys = {
  all: ['audit'] as const,
  logs: (filters?: AuditFilters) => [...auditKeys.all, 'logs', filters] as const,
  log: (id: string) => [...auditKeys.all, 'log', id] as const,
  entity: (entityType: string, entityId: string) =>
    [...auditKeys.all, 'entity', entityType, entityId] as const,
  userActivity: (userId: string) => [...auditKeys.all, 'user', userId] as const,
  recent: (limit?: number) => [...auditKeys.all, 'recent', { limit }] as const,
  statistics: (startDate?: string, endDate?: string) =>
    [...auditKeys.all, 'statistics', { startDate, endDate }] as const,
  userStatistics: (userId: string) =>
    [...auditKeys.all, 'user-statistics', userId] as const,
};

// ==================== Query Hooks ====================

export function useAuditLogs(filters?: AuditFilters) {
  return useQuery({
    queryKey: auditKeys.logs(filters),
    queryFn: () => auditService.getLogs(filters),
    staleTime: 30000,
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: auditKeys.log(id),
    queryFn: () => auditService.getLogById(id),
    enabled: !!id,
  });
}

export function useEntityAuditTrail(entityType: string, entityId: string) {
  return useQuery({
    queryKey: auditKeys.entity(entityType, entityId),
    queryFn: () => auditService.getEntityAuditTrail(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useUserActivity(userId: string, limit?: number) {
  return useQuery({
    queryKey: auditKeys.userActivity(userId),
    queryFn: () => auditService.getUserActivity(userId, limit),
    enabled: !!userId,
  });
}

export function useRecentAuditLogs(limit?: number) {
  return useQuery({
    queryKey: auditKeys.recent(limit),
    queryFn: () => auditService.getRecentLogs(limit),
    staleTime: 30000,
  });
}

export function useAuditStatistics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: auditKeys.statistics(startDate, endDate),
    queryFn: () => auditService.getStatistics(startDate, endDate),
    staleTime: 60000,
  });
}

export function useUserAuditStatistics(userId: string) {
  return useQuery({
    queryKey: auditKeys.userStatistics(userId),
    queryFn: () => auditService.getUserStatistics(userId),
    enabled: !!userId,
  });
}

// ==================== Mutation Hooks ====================

export function useCreateAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAuditLogInput) => auditService.createLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    },
  });
}
