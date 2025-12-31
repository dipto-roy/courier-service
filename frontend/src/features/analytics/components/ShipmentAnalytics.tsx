import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useShipmentStatistics } from '@/src/services/analytics/hooks';
import { MetricCard } from './MetricCard';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import type { AnalyticsFilters } from '@/src/services/analytics/types';

interface ShipmentAnalyticsProps {
  filters?: AnalyticsFilters;
}

export function ShipmentAnalytics({ filters }: ShipmentAnalyticsProps) {
  const { data, isLoading } = useShipmentStatistics(filters);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Shipments"
          value={data?.totalShipments || 0}
          icon={Package}
          color="blue"
          isLoading={isLoading}
        />
        <MetricCard
          title="Pending"
          value={data?.pendingShipments || 0}
          icon={Clock}
          color="orange"
          isLoading={isLoading}
        />
        <MetricCard
          title="In Transit"
          value={data?.inTransitShipments || 0}
          icon={Truck}
          color="purple"
          isLoading={isLoading}
        />
        <MetricCard
          title="Delivered"
          value={data?.deliveredShipments || 0}
          icon={CheckCircle}
          color="green"
          isLoading={isLoading}
        />
        <MetricCard
          title="Cancelled"
          value={data?.cancelledShipments || 0}
          icon={XCircle}
          color="red"
          isLoading={isLoading}
        />
        <MetricCard
          title="Returned"
          value={data?.returnedShipments || 0}
          icon={RotateCcw}
          color="orange"
          isLoading={isLoading}
        />
      </div>

      {/* Status Breakdown */}
      {data?.statusStats && data.statusStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.statusStats.map((stat) => {
                const percentage =
                  data.totalShipments > 0
                    ? (Number(stat.count) / data.totalShipments) * 100
                    : 0;

                return (
                  <div key={stat.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">
                        {stat.status.replace(/_/g, ' ').toLowerCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {stat.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
