'use client';

import { useState } from 'react';
import { Bell, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/src/services/notifications/hooks';
import { NotificationList, NotificationStats } from '@/src/features/notifications';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const isRead = filter === 'all' ? undefined : filter === 'read';
  const { data: notifications = [], isLoading } = useNotifications(isRead);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          View and manage your notifications in one place
        </p>
      </div>

      {/* Statistics */}
      <NotificationStats />

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              All Notifications
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter: {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Read'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Unread Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('read')}>
                  Read Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <NotificationList
            notifications={notifications}
            isLoading={isLoading}
            maxHeight="calc(100vh - 400px)"
            showMarkAllRead={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
