'use client';

import { Card } from '@/components/ui/card';
import { useRiderStats } from '../hooks';
import { formatCurrency } from '@/src/common/lib/utils';

export function RiderDashboard() {
  const { data: stats, isLoading } = useRiderStats();

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

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Deliveries',
      value: stats.totalDeliveries,
      icon: '📦',
      color: 'bg-blue-500',
    },
    {
      title: 'Completed',
      value: stats.completedDeliveries,
      icon: '✅',
      color: 'bg-green-500',
    },
    {
      title: 'Pending',
      value: stats.pendingDeliveries,
      icon: '⏱️',
      color: 'bg-yellow-500',
    },
    {
      title: 'Failed',
      value: stats.failedDeliveries,
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
                {formatCurrency(stats.totalCOD)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Collected</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(stats.collectedCOD)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="text-xl font-bold text-yellow-600">
                {formatCurrency(stats.pendingCOD)}
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
                  {stats.successRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.successRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">On-Time Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.onTimeRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.onTimeRate}%` }}
                />
              </div>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Distance</span>
                <span className="font-semibold text-gray-900">
                  {stats.totalDistance.toFixed(1)} km
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Avg. Delivery Time</span>
                <span className="font-semibold text-gray-900">
                  {stats.averageDeliveryTime} min
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
