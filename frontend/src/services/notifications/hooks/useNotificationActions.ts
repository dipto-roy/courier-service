import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../notification.service';
import type {
  SendNotificationInput,
  SendEmailInput,
  SendSmsInput,
  SendPushInput,
} from '../types';

/**
 * Mark a notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Send a notification (Admin/Support only)
 */
export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendNotificationInput) => notificationService.sendNotification(data),
    onSuccess: () => {
      // Invalidate notifications and statistics queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Send an email notification (Admin/Support only)
 */
export function useSendEmail() {
  return useMutation({
    mutationFn: (data: SendEmailInput) => notificationService.sendEmail(data),
  });
}

/**
 * Send an SMS notification (Admin/Support only)
 */
export function useSendSms() {
  return useMutation({
    mutationFn: (data: SendSmsInput) => notificationService.sendSms(data),
  });
}

/**
 * Send a push notification (Admin/Support only)
 */
export function useSendPush() {
  return useMutation({
    mutationFn: (data: SendPushInput) => notificationService.sendPush(data),
  });
}
