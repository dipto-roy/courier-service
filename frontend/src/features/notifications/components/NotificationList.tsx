'use client';

import { CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMarkAllAsRead } from '@/services/notifications/hooks';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '@/services/notifications/types';

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  maxHeight?: string;
  showMarkAllRead?: boolean;
}

export function NotificationList({
  notifications,
  isLoading = false,
  maxHeight = '600px',
  showMarkAllRead = true,
}: NotificationListProps) {
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
        <CheckCheck className="h-8 w-8" />
        <p className="text-sm">No notifications</p>
      </div>
    );
  }

  return (
    <div>
      {showMarkAllRead && unreadCount > 0 && (
        <div className="border-b px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <CheckCheck className="mr-1 h-3 w-3" />
            Mark all as read
          </Button>
        </div>
      )}
      <ScrollArea style={{ maxHeight }}>
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </ScrollArea>
    </div>
  );
}
