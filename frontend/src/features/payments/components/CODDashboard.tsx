'use client';

import { useMerchantStatistics, usePendingCollections, usePendingBalance } from '@/src/services/payments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/src/common/utils';

interface CODDashboardProps {
  merchantId: string;
}

export function CODDashboard({ merchantId }: CODDashboardProps) {
  const { data: stats, isLoading: statsLoading } = useMerchantStatistics(merchantId);
  const { data: pendingCollections, isLoading: collectionsLoading } =
    usePendingCollections(merchantId);
  const { data: pendingBalance } = usePendingBalance(merchantId);

  const collectionRate =
    stats && stats.totalCodTransactions > 0
      ? ((stats.totalCodCollected / (stats.totalCodCollected + stats.totalDeliveryFees)) *
          100
        ).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Wallet Balance
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatCurrency(stats?.walletBalance || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Available for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Balance (T+7)
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatCurrency(pendingBalance?.pendingBalance || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting settlement period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total COD Collected
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatCurrency(stats?.totalCodCollected || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.totalCodTransactions || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Collection Rate
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">This month: {formatCurrency(stats?.thisMonthCollections || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Collections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pending COD Collections (T+7)</span>
            <Badge variant="outline">
              {pendingCollections?.length || 0} pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {collectionsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : pendingCollections && pendingCollections.length > 0 ? (
            <div className="space-y-3">
              {pendingCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-mono text-sm font-medium">
                      {collection.transactionId}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Collected {formatDate(collection.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(collection.netAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Fee: {formatCurrency(collection.amount - collection.netAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No pending collections</p>
              <p className="text-sm text-gray-400 mt-1">
                COD collections will appear here after 7 days
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {formatCurrency(stats?.totalPayouts || 0)}
              </span>
              <span className="text-sm text-gray-500">
                ({stats?.totalPayoutTransactions || 0} payouts)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {formatCurrency(stats?.totalDeliveryFees || 0)}
              </span>
              <ArrowUpRight className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
