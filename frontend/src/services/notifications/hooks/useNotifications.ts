import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../notification.service';

/**
 * Get current user's notifications
 */
export function useNotifications(isRead?: boolean) {
  return useQuery({
    queryKey: ['notifications', { isRead }],
    queryFn: () => notificationService.getMyNotifications(isRead),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get unread notification count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

/**
 * Get notifications for a specific user (Admin only)
 */
export function useUserNotifications(userId: string, enabled = true) {
  return useQuery({
    queryKey: ['notifications', 'user', userId],
    queryFn: () => notificationService.getUserNotifications(userId),
    enabled,
  });
}

/**
 * Get notification statistics (Admin only)
 */
export function useNotificationStatistics() {
  return useQuery({
    queryKey: ['notifications', 'statistics'],
    queryFn: () => notificationService.getStatistics(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Get notification statistics for a user (Admin only)
 */
export function useUserNotificationStatistics(userId: string, enabled = true) {
  return useQuery({
    queryKey: ['notifications', 'statistics', 'user', userId],
    queryFn: () => notificationService.getUserStatistics(userId),
    enabled,
    staleTime: 60000, // 1 minute
  });
}
