import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMerchantRevenue } from '@/src/services/analytics/hooks';
import { MetricCard } from './MetricCard';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  CreditCard,
  Banknote,
  ArrowUpRight,
} from 'lucide-react';
import type { AnalyticsFilters } from '@/src/services/analytics/types';

interface RevenueAnalyticsProps {
  filters?: AnalyticsFilters;
  merchantId?: string;
}

export function RevenueAnalytics({
  merchantId,
}: RevenueAnalyticsProps) {
  const { data, isLoading } = useMerchantRevenue(merchantId || '', !!merchantId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(data?.totalRevenue || 0)}
          icon={DollarSign}
          color="green"
          isLoading={isLoading}
        />
        <MetricCard
          title="COD Collected"
          value={formatCurrency(data?.totalCodCollected || 0)}
          icon={Banknote}
          color="blue"
          description={`${data?.totalCodTransactions || 0} transactions`}
          isLoading={isLoading}
        />
        <MetricCard
          title="Delivery Fees"
          value={formatCurrency(data?.totalDeliveryFees || 0)}
          icon={CreditCard}
          color="purple"
          isLoading={isLoading}
        />
        <MetricCard
          title="Avg Order Value"
          value={formatCurrency(data?.averageOrderValue || 0)}
          icon={TrendingUp}
          color="orange"
          isLoading={isLoading}
        />
      </div>

      {/* Revenue Periods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Wallet className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data?.todayRevenue || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Revenue today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data?.weekRevenue || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data?.monthRevenue || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Date Chart Placeholder */}
      {data?.revenueByDate && data.revenueByDate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              {/* Chart will be added here */}
              <p className="text-sm">
                Chart visualization (integrate Recharts or Chart.js)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
