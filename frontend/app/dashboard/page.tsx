'use client';

import { useAuthStore } from '@/src/features/auth/stores';
import { UserRole } from '@/src/common/types';
import { RiderDashboard } from '@/src/features/rider/components';
import Link from 'next/link';
import { Package, Truck, Clock, CheckCircle } from 'lucide-react';
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
  return (
    <div className="w-full">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="text-sm sm:text-base text-gray-600">Track your shipments and manage deliveries</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Shipments</h3>
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">In Transit</h3>
            <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">0</p>
          <p className="text-xs text-gray-500 mt-1">Currently shipping</p>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Pending</h3>
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600">0</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting pickup</p>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Delivered</h3>
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">0</p>
          <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
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
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Recent Shipments
        </h2>
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm sm:text-base">No shipments yet</p>
          <p className="text-xs sm:text-sm mt-1">Create your first shipment to get started</p>
        </div>
      </div>
    </div>
  );
}

function MerchantDashboard() {
  return (
    <div className="w-full">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Merchant Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your business and shipments</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stats Cards */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Shipments</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">Active Shipments</h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">Delivered</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">Revenue</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">₹0</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 sm:mt-8 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link href="/shipments/create">
            <Button className="w-full text-sm sm:text-base">Create Shipment</Button>
          </Link>
          <Link href="/shipments/bulk">
            <Button className="w-full text-sm sm:text-base" variant="outline">Bulk Upload</Button>
          </Link>
          <Link href="/payments">
            <Button className="w-full text-sm sm:text-base" variant="outline">Payments</Button>
          </Link>
          <Link href="/analytics">
            <Button className="w-full text-sm sm:text-base" variant="outline">Analytics</Button>
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
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stats Cards */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Shipments</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">Active Shipments</h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">Delivered</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">Revenue</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">₹0</p>
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
