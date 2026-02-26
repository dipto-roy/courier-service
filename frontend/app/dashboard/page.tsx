'use client';

import { useAuthStore } from '@/src/features/auth/stores';
import { UserRole, ShipmentStatus } from '@/src/common/types';
import { RiderDashboard } from '@/src/features/rider/components';
import Link from 'next/link';
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useShipmentStatistics,
  useShipments,
} from '@/src/features/shipments/hooks';
import { StatusBadge } from '@/src/features/shipments/components/StatusBadge';
import { formatDateTime } from '@/src/common/lib/utils';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  // Role-based dashboard
  if (user?.role === UserRole.RIDER) {
    return <RiderDashboard />;
  }

  if (user?.role === UserRole.CUSTOMER) {
    return <CustomerDashboard />;
  }

  if (user?.role === UserRole.MERCHANT) {
    return <MerchantDashboard />;
  }

  // Default dashboard for other roles
  return <DefaultDashboard />;
}

function CustomerDashboard() {
  // Fetch statistics from backend
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useShipmentStatistics();

  // Fetch recent shipments (latest 5)
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({
    page: 1,
    limit: 5,
  });

  const recentShipments = shipmentsData?.data || [];

  // Extract stats with fallbacks
  const totalShipments = stats?.total || 0;
  const inTransit = stats?.byStatus?.IN_TRANSIT || 0;
  const pending = stats?.byStatus?.PENDING || 0;
  const delivered = stats?.byStatus?.DELIVERED || 0;

  return (
    <div className="w-full">
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Welcome Back!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Track your shipments and manage deliveries
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchStats()}
          disabled={statsLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">
              Total Shipments
            </h3>
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {statsLoading ? '...' : totalShipments}
          </p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">
              In Transit
            </h3>
            <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">
            {statsLoading ? '...' : inTransit}
          </p>
          <p className="text-xs text-gray-500 mt-1">Currently shipping</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">
              Pending
            </h3>
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
            {statsLoading ? '...' : pending}
          </p>
          <p className="text-xs text-gray-500 mt-1">Awaiting pickup</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">
              Delivered
            </h3>
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">
            {statsLoading ? '...' : delivered}
          </p>
          <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link href="/track">
            <Button className="w-full text-sm sm:text-base" variant="outline">
              Track Shipment
            </Button>
          </Link>
          <Link href="/shipments">
            <Button className="w-full text-sm sm:text-base" variant="outline">
              View All Shipments
            </Button>
          </Link>
          <Link href="/shipments/create">
            <Button className="w-full text-sm sm:text-base">
              Create New Shipment
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Recent Shipments
          </h2>
          <Link href="/shipments">
            <Button variant="ghost" size="sm" className="text-blue-600">
              View All
            </Button>
          </Link>
        </div>

        <RecentShipmentsContent
          isLoading={shipmentsLoading}
          shipments={recentShipments}
        />
      </div>
    </div>
  );
}

function RecentShipmentsContent({
  isLoading,
  shipments,
}: {
  isLoading: boolean;
  shipments: Array<{
    id: number;
    awb: string;
    receiverName: string;
    status: string;
    createdAt: string;
  }>;
}) {
  if (isLoading) {
    return (
      <div className="text-center py-6 sm:py-8 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p className="text-sm">Loading shipments...</p>
      </div>
    );
  }

  if (shipments.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 text-gray-500">
        <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm sm:text-base">No shipments yet</p>
        <p className="text-xs sm:text-sm mt-1">
          Create your first shipment to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase">
              AWB
            </th>
            <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
              Receiver
            </th>
            <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
              Date
            </th>
            <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 uppercase">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((shipment) => (
            <tr
              key={shipment.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-3 px-2">
                <span className="font-mono text-sm text-blue-600">
                  {shipment.awb}
                </span>
              </td>
              <td className="py-3 px-2 hidden sm:table-cell">
                <span className="text-sm text-gray-900">
                  {shipment.receiverName || '-'}
                </span>
              </td>
              <td className="py-3 px-2">
                <StatusBadge status={shipment.status as ShipmentStatus} />
              </td>
              <td className="py-3 px-2 hidden md:table-cell">
                <span className="text-sm text-gray-500">
                  {formatDateTime(shipment.createdAt)}
                </span>
              </td>
              <td className="py-3 px-2 text-right">
                <Link href={`/track/${shipment.awb}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MerchantDashboard() {
  return (
    <div className="w-full">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Merchant Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage your business and shipments
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stats Cards */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">
            Total Shipments
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">
            Active Shipments
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">
            Delivered
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
            0
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">
            Revenue
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            ₹0
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 sm:mt-8 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link href="/shipments/create">
            <Button className="w-full text-sm sm:text-base">
              Create Shipment
            </Button>
          </Link>
          <Link href="/shipments/bulk">
            <Button className="w-full text-sm sm:text-base" variant="outline">
              Bulk Upload
            </Button>
          </Link>
          <Link href="/payments">
            <Button className="w-full text-sm sm:text-base" variant="outline">
              Payments
            </Button>
          </Link>
          <Link href="/analytics">
            <Button className="w-full text-sm sm:text-base" variant="outline">
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 sm:mt-8 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Recent Activity
        </h2>
        <p className="text-sm sm:text-base text-gray-600">No recent activity</p>
      </div>
    </div>
  );
}

function DefaultDashboard() {
  return (
    <div className="w-full">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stats Cards */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">
            Total Shipments
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">
            Active Shipments
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">
            Delivered
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
            0
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">
            Revenue
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            ₹0
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 sm:mt-8 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Recent Activity
        </h2>
        <p className="text-sm sm:text-base text-gray-600">No recent activity</p>
      </div>
    </div>
  );
}
