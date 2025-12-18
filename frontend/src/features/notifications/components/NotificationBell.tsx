'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications, useUnreadCount } from '@/services/notifications/hooks';
import { NotificationList } from './NotificationList';

export function NotificationBell() {
  const { data: unreadCount = 0, isLoading: countLoading } = useUnreadCount();
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications(false); // Get unread notifications

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {!countLoading && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          )}
        </div>
        <NotificationList
          notifications={notifications}
          isLoading={notificationsLoading}
          maxHeight="400px"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
