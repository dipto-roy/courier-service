import { apiClient } from '@/src/common/lib/apiClient';
import type {
  Notification,
  NotificationStatistics,
  UnreadCountResponse,
  SendNotificationInput,
  SendEmailInput,
  SendSmsInput,
  SendPushInput,
} from './types';

const ENDPOINTS = {
  BASE: '/notifications',
  MY_NOTIFICATIONS: '/notifications/my-notifications',
  UNREAD_COUNT: '/notifications/unread-count',
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/mark-all-read',
  DELETE: (id: string) => `/notifications/${id}`,
  USER_NOTIFICATIONS: (userId: string) => `/notifications/users/${userId}`,
  STATISTICS: '/notifications/statistics',
  USER_STATISTICS: (userId: string) => `/notifications/statistics/user/${userId}`,
  SEND: '/notifications',
  SEND_EMAIL: '/notifications/email',
  SEND_SMS: '/notifications/sms',
  SEND_PUSH: '/notifications/push',
} as const;

class NotificationService {
  // ==================== User Notification Methods ====================

  /**
   * Get current user's notifications
   */
  async getMyNotifications(isRead?: boolean): Promise<Notification[]> {
    const params = isRead !== undefined ? { isRead: isRead.toString() } : undefined;
    const response = await apiClient.get<Notification[]>(ENDPOINTS.MY_NOTIFICATIONS, { params });
    return response.data;
  }

  /**
   * Get unread notification count for current user
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<UnreadCountResponse>(ENDPOINTS.UNREAD_COUNT);
    return response.data.count;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiClient.patch<Notification>(ENDPOINTS.MARK_READ(notificationId));
    return response.data;
  }

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch(ENDPOINTS.MARK_ALL_READ);
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.DELETE(notificationId));
  }

  // ==================== Admin Methods ====================

  /**
   * Get notifications for a specific user (Admin only)
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>(ENDPOINTS.USER_NOTIFICATIONS(userId));
    return response.data;
  }

  /**
   * Get notification statistics (Admin only)
   */
  async getStatistics(): Promise<NotificationStatistics> {
    const response = await apiClient.get<NotificationStatistics>(ENDPOINTS.STATISTICS);
    return response.data;
  }

  /**
   * Get notification statistics for a user (Admin only)
   */
  async getUserStatistics(userId: string): Promise<NotificationStatistics> {
    const response = await apiClient.get<NotificationStatistics>(ENDPOINTS.USER_STATISTICS(userId));
    return response.data;
  }

  // ==================== Send Notification Methods ====================

  /**
   * Send a notification (Admin/Support only)
   */
  async sendNotification(data: SendNotificationInput): Promise<Notification> {
    const response = await apiClient.post<Notification>(ENDPOINTS.SEND, data);
    return response.data;
  }

  /**
   * Send an email notification (Admin/Support only)
   */
  async sendEmail(data: SendEmailInput): Promise<void> {
    await apiClient.post(ENDPOINTS.SEND_EMAIL, data);
  }

  /**
   * Send an SMS notification (Admin/Support only)
   */
  async sendSms(data: SendSmsInput): Promise<void> {
    await apiClient.post(ENDPOINTS.SEND_SMS, data);
  }

  /**
   * Send a push notification (Admin/Support only)
   */
  async sendPush(data: SendPushInput): Promise<void> {
    await apiClient.post(ENDPOINTS.SEND_PUSH, data);
  }
}

export const notificationService = new NotificationService();
