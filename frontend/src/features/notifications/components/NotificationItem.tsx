'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Mail, MessageSquare, Phone, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMarkAsRead, useDeleteNotification } from '@/services/notifications/hooks';
import type { Notification, NotificationType } from '@/services/notifications/types';

interface NotificationItemProps {
  notification: Notification;
  onAction?: () => void;
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  sms: <MessageSquare className="h-4 w-4" />,
  whatsapp: <Phone className="h-4 w-4" />,
  push: <Bell className="h-4 w-4" />,
};

const typeColors: Record<NotificationType, string> = {
  email: 'bg-blue-100 text-blue-600',
  sms: 'bg-green-100 text-green-600',
  whatsapp: 'bg-emerald-100 text-emerald-600',
  push: 'bg-purple-100 text-purple-600',
};

export function NotificationItem({ notification, onAction }: NotificationItemProps) {
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();

  const handleMarkAsRead = async () => {
    if (!notification.isRead) {
      await markAsRead.mutateAsync(notification.id);
      onAction?.();
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification.mutateAsync(notification.id);
    onAction?.();
  };

  return (
    <div
      className={cn(
        'group relative flex gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/50',
        !notification.isRead && 'bg-blue-50/50'
      )}
      onClick={handleMarkAsRead}
    >
      {/* Type Icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          typeColors[notification.type]
        )}
      >
        {typeIcons[notification.type]}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold leading-tight">{notification.title}</h4>
          {!notification.isRead && (
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead();
            }}
            disabled={markAsRead.isPending}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
          disabled={deleteNotification.isPending}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}
