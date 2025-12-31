import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePerformanceMetrics } from '@/src/services/analytics/hooks';
import { MetricCard } from './MetricCard';
import {
  Target,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Star,
} from 'lucide-react';
import type { AnalyticsFilters } from '@/src/services/analytics/types';

interface PerformanceAnalyticsProps {
  filters?: AnalyticsFilters;
}

export function PerformanceAnalytics({ filters }: PerformanceAnalyticsProps) {
  const { data, isLoading } = usePerformanceMetrics(filters);

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} mins`;
    }
    return `${hours.toFixed(1)} hrs`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Success Rate"
          value={formatPercentage(data?.deliverySuccessRate || 0)}
          icon={Target}
          color="green"
          description={`${data?.successfulDeliveries || 0} of ${data?.totalDeliveries || 0} deliveries`}
          isLoading={isLoading}
        />
        <MetricCard
          title="Avg Delivery Time"
          value={formatTime(data?.averageDeliveryTime || 0)}
          icon={Clock}
          color="blue"
          isLoading={isLoading}
        />
        <MetricCard
          title="On-Time Delivery"
          value={formatPercentage(data?.onTimeDeliveryRate || 0)}
          icon={CheckCircle2}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deliveries
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalDeliveries || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Completed deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data?.failedDeliveries || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data?.totalDeliveries
                ? `${((data.failedDeliveries / data.totalDeliveries) * 100).toFixed(1)}% failure rate`
                : '0% failure rate'}
            </p>
          </CardContent>
        </Card>

        {data?.averageRating !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Customer Rating
              </CardTitle>
              <Star className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.averageRating.toFixed(1)} / 5.0
              </div>
              <div className="flex items-center mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(data.averageRating!)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance by Rider */}
      {data?.performanceByRider && data.performanceByRider.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Riders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.performanceByRider.slice(0, 5).map((rider, index) => (
                <div
                  key={rider.riderId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{rider.riderName}</p>
                      <p className="text-sm text-gray-500">
                        {rider.deliveries} deliveries
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {rider.successRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(rider.avgDeliveryTime)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
