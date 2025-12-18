'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShipmentAnalytics,
  RevenueAnalytics,
  PerformanceAnalytics,
  ExportReport,
  AnalyticsFilterBar,
} from '@/src/features/analytics';
import type { AnalyticsFilters, MetricPeriod } from '@/src/features/analytics/types';
import { BarChart3, DollarSign, TrendingUp, Package } from 'lucide-react';

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      period: 'month' as MetricPeriod,
      startDate: thirtyDaysAgo.toISOString(),
      endDate: now.toISOString(),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Analytics & Reports
        </h1>
        <p className="text-gray-600 mt-1">
          Comprehensive analytics and performance metrics
        </p>
      </div>

      {/* Filters & Export */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <AnalyticsFilterBar
            onFilterChange={setFilters}
            defaultFilters={filters}
          />
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <Tabs defaultValue="shipments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="shipments" className="gap-2">
                <Package className="h-4 w-4" />
                Shipments
              </TabsTrigger>
              <TabsTrigger value="revenue" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="performance" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shipments" className="space-y-4 mt-6">
              <ShipmentAnalytics filters={filters} />
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4 mt-6">
              <RevenueAnalytics filters={filters} />
            </TabsContent>

            <TabsContent value="performance" className="space-y-4 mt-6">
              <PerformanceAnalytics filters={filters} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Export Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ExportReport filters={filters} />
        </div>
        <div className="lg:col-span-3">
          {/* Additional charts or insights can go here */}
        </div>
      </div>
    </div>
  );
}
