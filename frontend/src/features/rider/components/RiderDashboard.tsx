'use client';

import { Card } from '@/components/ui/card';
import { useRiderStats } from '../hooks';
import { formatCurrency } from '@/src/common/lib/utils';

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
  const { data: rawStats, isLoading, error } = useRiderStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading statistics</p>
        <p className="text-gray-500 text-sm mt-2">Please try again later</p>
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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div
                className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* COD & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COD Collection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            COD Collection
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Total COD</span>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(normalizedStats.totalCOD)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Collected</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(normalizedStats.collectedCOD)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="text-xl font-bold text-yellow-600">
                {formatCurrency(normalizedStats.pendingCOD)}
              </span>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {normalizedStats.successRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(normalizedStats.successRate, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">On-Time Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {normalizedStats.onTimeRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(normalizedStats.onTimeRate, 100)}%` }}
                />
              </div>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Distance</span>
                <span className="font-semibold text-gray-900">
                  {normalizedStats.totalDistance.toFixed(1)} km
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Avg. Delivery Time</span>
                <span className="font-semibold text-gray-900">
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
