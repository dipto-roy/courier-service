import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/src/common/lib/socket';
import type { Notification as AppNotification } from '../types';

interface NotificationEventData {
  notification: AppNotification;
  userId: string;
}

/**
 * Hook to handle real-time notification updates via Socket.IO
 */
export function useNotificationSocket() {
  const queryClient = useQueryClient();

  const handleNewNotification = useCallback(
    (data: NotificationEventData) => {
      console.log('📬 New notification received:', data);

      // Invalidate notification queries to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.notification.title, {
          body: data.notification.message,
          icon: '/icon.png',
          badge: '/badge.png',
          tag: data.notification.id,
          data: data.notification.data,
        });
      }
    },
    [queryClient]
  );

  const handleNotificationRead = useCallback(
    (data: { notificationId: string }) => {
      console.log('✅ Notification marked as read:', data);

      // Invalidate notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    [queryClient]
  );

  const handleNotificationDeleted = useCallback(
    (data: { notificationId: string }) => {
      console.log('🗑️ Notification deleted:', data);

      // Invalidate notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    [queryClient]
  );

  useEffect(() => {
    // Subscribe to notification events (assumes socket is already connected by auth provider)
    socketService.on('notification:new', handleNewNotification);
    socketService.on('notification:read', handleNotificationRead);
    socketService.on('notification:deleted', handleNotificationDeleted);

    // Cleanup
    return () => {
      socketService.off('notification:new', handleNewNotification);
      socketService.off('notification:read', handleNotificationRead);
      socketService.off('notification:deleted', handleNotificationDeleted);
    };
  }, [handleNewNotification, handleNotificationRead, handleNotificationDeleted]);

  return {
    connected: socketService.isConnected(),
  };
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Show a browser notification
 */
export function showBrowserNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return null;
  }

  if (Notification.permission === 'granted') {
    return new Notification(title, options);
  }

  return null;
}
