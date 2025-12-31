'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Mail, MessageSquare, Phone, TrendingUp } from 'lucide-react';
import { useNotificationStatistics } from '@/services/notifications/hooks';

export function NotificationStats() {
  const { data: stats, isLoading } = useNotificationStatistics();

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Notifications',
      value: stats.total.toLocaleString(),
      icon: Bell,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Email Sent',
      value: stats.byType.email.toLocaleString(),
      icon: Mail,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'SMS Sent',
      value: stats.byType.sms.toLocaleString(),
      icon: MessageSquare,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Push Sent',
      value: stats.byType.push.toLocaleString(),
      icon: Phone,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`rounded-full p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {stats.sent > 0 && (
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="mr-1 inline h-3 w-3" />
                {((stats.sent / stats.total) * 100).toFixed(1)}% success rate
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
