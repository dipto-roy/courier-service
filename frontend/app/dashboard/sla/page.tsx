'use client';

import { useSLAStatistics, useSLAQueueStatus } from '@/src/services/sla/hooks/useSLA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, TrendingDown, RefreshCw } from 'lucide-react';

export default function SLAMonitorPage() {
  const { data: stats, isLoading: statsLoading, refetch } = useSLAStatistics();
  const { data: queueStatus } = useSLAQueueStatus();

  const totalViolations = stats?.totalViolations ?? 0;
  const pickupViolations = stats?.pickupSLA?.violations ?? 0;
  const deliveryViolations = stats?.deliverySLA?.violations ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SLA Monitor</h1>
          <p className="text-sm text-gray-500">Service level agreement tracking</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={statsLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${totalViolations > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {statsLoading ? '…' : totalViolations}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pickup SLA Violations</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${pickupViolations > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
              {statsLoading ? '…' : pickupViolations}
            </p>
            {stats && (
              <p className="text-xs text-gray-500 mt-1">
                Threshold: {stats.pickupSLA?.threshold ?? 0}h
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Delivery SLA Violations</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${deliveryViolations > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
              {statsLoading ? '…' : deliveryViolations}
            </p>
            {stats && (
              <p className="text-xs text-gray-500 mt-1">
                Threshold: {stats.deliverySLA?.threshold ?? 0}h
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Queue status */}
      {queueStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Watcher Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-gray-500">Active:</span>{' '}
                <span className="font-medium">{queueStatus.active}</span>
              </div>
              <div>
                <span className="text-gray-500">Waiting:</span>{' '}
                <span className="font-medium">{queueStatus.waiting}</span>
              </div>
              <div>
                <span className="text-gray-500">Completed:</span>{' '}
                <span className="font-medium text-green-600">{queueStatus.completed}</span>
              </div>
              <div>
                <span className="text-gray-500">Failed:</span>{' '}
                <span className="font-medium text-red-600">{queueStatus.failed}</span>
              </div>
              <div>
                <span className="text-gray-500">Total:</span>{' '}
                <span className="font-medium">{queueStatus.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last checked */}
      {stats?.lastChecked && (
        <p className="text-xs text-gray-400">
          Last checked: {new Date(stats.lastChecked).toLocaleString()}
        </p>
      )}

      {/* All clear */}
      {!statsLoading && totalViolations === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-400 mb-3" />
            <p className="text-gray-600 font-medium">All shipments within SLA thresholds</p>
            <p className="text-sm text-gray-400 mt-1">No violations detected</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
