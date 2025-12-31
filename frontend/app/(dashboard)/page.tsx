'use client';

import { useAuthStore } from '@/src/features/auth/stores';
import { UserRole } from '@/src/common/types';
import { RiderDashboard } from '@/src/features/rider/components';
import { useShipmentStatistics, useShipments } from '@/src/features/shipments/hooks/useShipments';
import Link from 'next/link';
import { Package, Truck, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({ limit: 5 });

  // Calculate stats from shipments
  const stats = {
    total: shipmentsData?.meta?.total || shipmentsData?.data?.length || 0,
    inTransit: shipmentsData?.data?.filter(s => s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY').length || 0,
    pending: shipmentsData?.data?.filter(s => s.status === 'PENDING').length || 0,
    delivered: shipmentsData?.data?.filter(s => s.status === 'DELIVERED').length || 0,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="text-gray-600">Track your shipments and manage deliveries</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Shipments</h3>
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {shipmentsLoading ? '...' : stats.total}
          </p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">In Transit</h3>
            <Truck className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {shipmentsLoading ? '...' : stats.inTransit}
          </p>
          <p className="text-xs text-gray-500 mt-1">Currently shipping</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Pending</h3>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {shipmentsLoading ? '...' : stats.pending}
          </p>
          <p className="text-xs text-gray-500 mt-1">Awaiting pickup</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Delivered</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {shipmentsLoading ? '...' : stats.delivered}
          </p>
          <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/track">
            <Button className="w-full" variant="outline">
              Track Shipment
            </Button>
          </Link>
          <Link href="/shipments">
            <Button className="w-full" variant="outline">
              View All Shipments
            </Button>
          </Link>
          <Link href="/shipments/create">
            <Button className="w-full">
              Create New Shipment
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Shipments
        </h2>
        {shipmentsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading shipments...</p>
          </div>
        ) : shipmentsData?.data && shipmentsData.data.length > 0 ? (
          <div className="space-y-3">
            {shipmentsData.data.slice(0, 5).map((shipment) => (
              <Link
                key={shipment.id}
                href={`/track/${shipment.awb}`}
                className="block p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{shipment.awb}</p>
                    <p className="text-sm text-gray-600">{shipment.receiverName}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    shipment.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                    shipment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {shipment.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No shipments yet</p>
            <p className="text-sm mt-1">Create your first shipment to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MerchantDashboard() {
  const { data: statsData, isLoading: statsLoading, error: statsError } = useShipmentStatistics();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({ limit: 5 });

  // Extract stats from backend response
  const byStatus = statsData?.byStatus || {};
  const stats = {
    total: statsData?.total || 0,
    active: (byStatus['PENDING'] || 0) + (byStatus['PICKED_UP'] || 0) + 
            (byStatus['IN_TRANSIT'] || 0) + (byStatus['OUT_FOR_DELIVERY'] || 0),
    delivered: byStatus['DELIVERED'] || 0,
    revenue: statsData?.totalRevenue || 0,
  };

  const isLoading = statsLoading || shipmentsLoading;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Merchant Dashboard</h1>
        <p className="text-gray-600">Manage your business and shipments</p>
      </div>

      {statsError && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-yellow-800 text-sm">Unable to load statistics. Showing available data.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Total Shipments</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? '...' : stats.total}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Active Shipments</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {isLoading ? '...' : stats.active}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Delivered</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {isLoading ? '...' : stats.delivered}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ₹{isLoading ? '...' : stats.revenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/shipments/create">
            <Button className="w-full">Create Shipment</Button>
          </Link>
          <Link href="/shipments/bulk">
            <Button className="w-full" variant="outline">Bulk Upload</Button>
          </Link>
          <Link href="/payments">
            <Button className="w-full" variant="outline">Payments</Button>
          </Link>
          <Link href="/analytics">
            <Button className="w-full" variant="outline">Analytics</Button>
          </Link>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Shipments
        </h2>
        {shipmentsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading shipments...</p>
          </div>
        ) : shipmentsData?.data && shipmentsData.data.length > 0 ? (
          <div className="space-y-3">
            {shipmentsData.data.slice(0, 5).map((shipment) => (
              <Link
                key={shipment.id}
                href={`/track/${shipment.awb}`}
                className="block p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{shipment.awb}</p>
                    <p className="text-sm text-gray-600">{shipment.receiverName} - {shipment.receiverCity}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    shipment.status === 'IN_TRANSIT' || shipment.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-100 text-blue-800' :
                    shipment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    shipment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {shipment.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </Link>
            ))}
            <Link href="/shipments" className="block text-center pt-4">
              <Button variant="outline" className="w-full">View All Shipments</Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No shipments yet</p>
            <p className="text-sm mt-1">Create your first shipment to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DefaultDashboard() {
  const { data: statsData, isLoading: statsLoading } = useShipmentStatistics();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({ limit: 5 });

  const byStatus = statsData?.byStatus || {};
  const stats = {
    total: statsData?.total || 0,
    active: (byStatus['PENDING'] || 0) + (byStatus['PICKED_UP'] || 0) + 
            (byStatus['IN_TRANSIT'] || 0) + (byStatus['OUT_FOR_DELIVERY'] || 0),
    delivered: byStatus['DELIVERED'] || 0,
    revenue: statsData?.totalRevenue || 0,
  };

  const isLoading = statsLoading || shipmentsLoading;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Total Shipments</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? '...' : stats.total}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Active Shipments</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {isLoading ? '...' : stats.active}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Delivered</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {isLoading ? '...' : stats.delivered}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ₹{isLoading ? '...' : stats.revenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Shipments
        </h2>
        {shipmentsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        ) : shipmentsData?.data && shipmentsData.data.length > 0 ? (
          <div className="space-y-3">
            {shipmentsData.data.slice(0, 5).map((shipment) => (
              <Link
                key={shipment.id}
                href={`/track/${shipment.awb}`}
                className="block p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{shipment.awb}</p>
                    <p className="text-sm text-gray-600">{shipment.receiverName}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    shipment.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                    shipment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {shipment.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recent activity</p>
        )}
      </div>
    </div>
  );
}
