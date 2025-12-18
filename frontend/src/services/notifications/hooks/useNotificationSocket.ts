import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '@/src/common/lib/socket';
import type { Notification } from '../types';

interface NotificationEventData {
  notification: Notification;
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
    // Connect socket
    socket.connect();

    // Subscribe to notification events
    socket.on('notification:new', handleNewNotification);
    socket.on('notification:read', handleNotificationRead);
    socket.on('notification:deleted', handleNotificationDeleted);

    // Cleanup
    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:read', handleNotificationRead);
      socket.off('notification:deleted', handleNotificationDeleted);
    };
  }, [handleNewNotification, handleNotificationRead, handleNotificationDeleted]);

  return {
    connected: socket.connected,
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
