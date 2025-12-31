'use client';

import { Card } from '@/components/ui/card';
import { useManifestStats } from '@/src/services/hub';
import { ManifestStatus } from '@/src/services/hub/types';
import {
  Package,
  PackageCheck,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';

interface HubDashboardProps {
  hubLocation?: string;
}

/**
 * HubDashboard Component
 * Displays manifest statistics, inbound/outbound counts, and status breakdown
 * Auto-refreshes every 5 minutes
 */
export function HubDashboard({ hubLocation }: HubDashboardProps) {
  const { data: stats, isLoading, error } = useManifestStats(hubLocation);

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center text-red-600">
          <XCircle className="h-5 w-5 mr-2" />
          <p>Failed to load hub statistics</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-gray-200 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Manifests',
      value: stats?.total || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Created',
      value: stats?.created || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      status: ManifestStatus.CREATED,
    },
    {
      label: 'In Transit',
      value: stats?.inTransit || 0,
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      status: ManifestStatus.IN_TRANSIT,
    },
    {
      label: 'Received',
      value: stats?.received || 0,
      icon: ArrowDown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      status: ManifestStatus.RECEIVED,
    },
    {
      label: 'Closed',
      value: stats?.closed || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      status: ManifestStatus.CLOSED,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hub Dashboard</h2>
          {hubLocation && (
            <p className="text-sm text-gray-600 mt-1">{hubLocation}</p>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Auto-refresh: 5 min</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <ArrowDown className="h-5 w-5 mr-2 text-blue-600" />
            <span className="font-medium">Inbound Scan</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <ArrowUp className="h-5 w-5 mr-2 text-orange-600" />
            <span className="font-medium">Outbound Scan</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <PackageCheck className="h-5 w-5 mr-2 text-green-600" />
            <span className="font-medium">Create Manifest</span>
          </button>
        </div>
      </Card>

      {/* Status Overview */}
      {stats && stats.total > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created</span>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all"
                    style={{
                      width: `${((stats.created / stats.total) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium w-16 text-right">
                {((stats.created / stats.total) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Transit</span>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{
                      width: `${((stats.inTransit / stats.total) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium w-16 text-right">
                {((stats.inTransit / stats.total) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Received</span>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{
                      width: `${((stats.received / stats.total) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium w-16 text-right">
                {((stats.received / stats.total) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Closed</span>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${((stats.closed / stats.total) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium w-16 text-right">
                {((stats.closed / stats.total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
