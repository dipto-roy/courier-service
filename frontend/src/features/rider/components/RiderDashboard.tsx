'use client';

import { Card } from '@/components/ui/card';
import { useRiderStats } from '../hooks';
import { formatCurrency } from '@/src/common/lib/utils';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Type for the stats data from the hook
interface RiderStatsData {
  totalDeliveries?: number;
  completedDeliveries?: number;
  pendingDeliveries?: number;
  failedDeliveries?: number;
  totalCOD?: number;
  collectedCOD?: number;
  pendingCOD?: number;
  successRate?: number;
  onTimeRate?: number;
  totalDistance?: number;
  averageDeliveryTime?: number;
  // Backend fields
  totalAssigned?: number;
  delivered?: number;
  outForDelivery?: number;
  rtoShipments?: number;
  todayDeliveries?: number;
  totalCodCollected?: number;
  deliveryRate?: string | number;
}

export function RiderDashboard() {
  const { data: rawStats, isLoading, error, refetch } = useRiderStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 sm:p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-8 bg-muted rounded w-16" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">Error loading statistics</p>
        <p className="text-muted-foreground text-sm mt-2">Please try again later</p>
      </div>
    );
  }

  // Normalize stats data to handle both frontend and backend formats
  const stats: RiderStatsData = rawStats || {};
  
  const normalizedStats = {
    totalDeliveries: stats.totalDeliveries ?? stats.totalAssigned ?? 0,
    completedDeliveries: stats.completedDeliveries ?? stats.delivered ?? 0,
    pendingDeliveries: stats.pendingDeliveries ?? stats.outForDelivery ?? 0,
    failedDeliveries: stats.failedDeliveries ?? 0,
    totalCOD: stats.totalCOD ?? stats.totalCodCollected ?? 0,
    collectedCOD: stats.collectedCOD ?? stats.totalCodCollected ?? 0,
    pendingCOD: stats.pendingCOD ?? 0,
    successRate: typeof stats.successRate === 'number' 
      ? stats.successRate 
      : (typeof stats.deliveryRate === 'string' ? parseFloat(stats.deliveryRate) : (stats.deliveryRate ?? 0)),
    onTimeRate: stats.onTimeRate ?? (typeof stats.deliveryRate === 'string' ? parseFloat(stats.deliveryRate) : (stats.deliveryRate ?? 0)),
    totalDistance: stats.totalDistance ?? 0,
    averageDeliveryTime: stats.averageDeliveryTime ?? 0,
  };

  const statCards = [
    {
      title: 'Total Deliveries',
      value: normalizedStats.totalDeliveries,
      icon: '📦',
      color: 'bg-blue-500',
    },
    {
      title: 'Completed',
      value: normalizedStats.completedDeliveries,
      icon: '✅',
      color: 'bg-green-500',
    },
    {
      title: 'Pending',
      value: normalizedStats.pendingDeliveries,
      icon: '⏱️',
      color: 'bg-yellow-500',
    },
    {
      title: 'Failed',
      value: normalizedStats.failedDeliveries,
      icon: '❌',
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Rider Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your deliveries and track performance</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-full flex items-center justify-center text-xl sm:text-2xl`}
              >
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* COD & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* COD Collection */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            COD Collection
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-muted-foreground">Total COD</span>
              <span className="text-xl font-bold text-foreground">
                {formatCurrency(normalizedStats.totalCOD)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-muted-foreground">Collected</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(normalizedStats.collectedCOD)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending</span>
              <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatCurrency(normalizedStats.pendingCOD)}
              </span>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Performance
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="text-sm font-semibold text-foreground">
                  {normalizedStats.successRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(normalizedStats.successRate, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">On-Time Rate</span>
                <span className="text-sm font-semibold text-foreground">
                  {normalizedStats.onTimeRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(normalizedStats.onTimeRate, 100)}%` }}
                />
              </div>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Distance</span>
                <span className="font-semibold text-foreground">
                  {normalizedStats.totalDistance.toFixed(1)} km
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-muted-foreground">Avg. Delivery Time</span>
                <span className="font-semibold text-foreground">
                  {normalizedStats.averageDeliveryTime} min
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
