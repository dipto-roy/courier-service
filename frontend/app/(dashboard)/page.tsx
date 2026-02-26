'use client';

import { useState } from 'react';
import { useAuthStore } from '@/src/features/auth/stores';
import { UserRole } from '@/src/common/types';
import { RiderDashboard } from '@/src/features/rider/components';
import { useShipmentStatistics, useShipments } from '@/src/features/shipments/hooks/useShipments';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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

// Status Badge Component with dark mode
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string }> = {
    DELIVERED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
    IN_TRANSIT: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' },
    OUT_FOR_DELIVERY: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300' },
    PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
    PICKED_UP: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-300' },
    FAILED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
    RETURNED: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300' },
    CANCELLED: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300' },
  };

  const config = statusConfig[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300' };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function CustomerDashboard() {
  const [trackingInput, setTrackingInput] = useState('');
  const { data: shipmentsData, isLoading: shipmentsLoading, refetch } = useShipments({ limit: 10 });

  // Calculate stats from shipments
  const allShipments = shipmentsData?.data || [];
  const stats = {
    total: shipmentsData?.meta?.total || allShipments.length || 0,
    inTransit: allShipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY').length,
    pending: allShipments.filter(s => s.status === 'PENDING' || s.status === 'PICKED_UP').length,
    delivered: allShipments.filter(s => s.status === 'DELIVERED').length,
  };

  const handleTrackShipment = () => {
    if (trackingInput.trim()) {
      window.location.href = `/track/${trackingInput.trim()}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome Back!</h1>
          <p className="text-muted-foreground mt-1">Track your shipments and manage deliveries</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Track Section */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-primary/20">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground mb-1">Quick Track</h2>
            <p className="text-sm text-muted-foreground">Enter your AWB number to track your shipment</p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <Input
              placeholder="Enter AWB number..."
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrackShipment()}
              className="flex-1 sm:w-64 bg-background"
            />
            <Button onClick={handleTrackShipment}>
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Track</span>
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="p-4 sm:p-6 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Shipments</h3>
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {shipmentsLoading ? '...' : stats.total}
          </p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">In Transit</h3>
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
            {shipmentsLoading ? '...' : stats.inTransit}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Currently shipping</p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</h3>
            <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {shipmentsLoading ? '...' : stats.pending}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Awaiting pickup</p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Delivered</h3>
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
            {shipmentsLoading ? '...' : stats.delivered}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link href="/track">
            <Button className="w-full justify-start" variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Track Shipment
            </Button>
          </Link>
          <Link href="/shipments">
            <Button className="w-full justify-start" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              View All Shipments
            </Button>
          </Link>
          <Link href="/shipments/create">
            <Button className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Create New Shipment
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Shipments */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Shipments</h2>
          <Link href="/shipments">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {shipmentsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-muted border-t-primary rounded-full mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading shipments...</p>
          </div>
        ) : allShipments.length > 0 ? (
          <div className="space-y-3">
            {allShipments.slice(0, 5).map((shipment) => (
              <Link
                key={shipment.id}
                href={`/track/${shipment.awb}`}
                className="block p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{shipment.awb}</p>
                      <StatusBadge status={shipment.status} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {shipment.receiverName} • {shipment.receiverCity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 hidden sm:block" />
                    <span>{new Date(shipment.createdAt).toLocaleDateString()}</span>
                    <Eye className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No shipments yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first shipment to get started</p>
            <Link href="/shipments/create">
              <Button className="mt-4">Create Shipment</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

function MerchantDashboard() {
  const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useShipmentStatistics();
  const { data: shipmentsData, isLoading: shipmentsLoading, refetch: refetchShipments } = useShipments({ limit: 5 });

  // Extract stats from backend response
  const byStatus = statsData?.byStatus || {};
  const stats = {
    total: statsData?.total || 0,
    active: (byStatus['PENDING'] || 0) + (byStatus['PICKED_UP'] || 0) + 
            (byStatus['IN_TRANSIT'] || 0) + (byStatus['OUT_FOR_DELIVERY'] || 0),
    delivered: byStatus['DELIVERED'] || 0,
    revenue: statsData?.totalRevenue || 0,
    cod: statsData?.totalCOD || 0,
  };

  const isLoading = statsLoading || shipmentsLoading;

  const handleRefresh = () => {
    refetchStats();
    refetchShipments();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Merchant Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your business and shipments</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {statsError && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">Unable to load statistics. Showing available data.</p>
          </div>
        </Card>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="p-4 sm:p-6 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Shipments</h3>
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {isLoading ? '...' : stats.total}
          </p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Active Shipments</h3>
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
            {isLoading ? '...' : stats.active}
          </p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Delivered</h3>
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
            {isLoading ? '...' : stats.delivered}
          </p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Revenue</h3>
            <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            ৳{isLoading ? '...' : stats.revenue.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* COD Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Total COD Collection</h3>
            <p className="text-2xl font-bold text-foreground mt-1">
              ৳{isLoading ? '...' : stats.cod.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link href="/shipments/create">
            <Button className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              Create Shipment
            </Button>
          </Link>
          <Link href="/shipments/bulk">
            <Button className="w-full" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
          </Link>
          <Link href="/payments">
            <Button className="w-full" variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Payments
            </Button>
          </Link>
          <Link href="/analytics">
            <Button className="w-full" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Shipments */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Shipments</h2>
          <Link href="/shipments">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {shipmentsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-muted border-t-primary rounded-full mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading shipments...</p>
          </div>
        ) : shipmentsData?.data && shipmentsData.data.length > 0 ? (
          <div className="space-y-3">
            {shipmentsData.data.slice(0, 5).map((shipment) => (
              <Link
                key={shipment.id}
                href={`/track/${shipment.awb}`}
                className="block p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{shipment.awb}</p>
                      <StatusBadge status={shipment.status} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {shipment.receiverName} • {shipment.receiverCity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {shipment.codAmount > 0 && (
                      <span className="text-primary font-medium">৳{shipment.codAmount}</span>
                    )}
                    <Eye className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No shipments yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first shipment to get started</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function DefaultDashboard() {
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useShipmentStatistics();
  const { data: shipmentsData, isLoading: shipmentsLoading, refetch: refetchShipments } = useShipments({ limit: 5 });

  const byStatus = statsData?.byStatus || {};
  const stats = {
    total: statsData?.total || 0,
    active: (byStatus['PENDING'] || 0) + (byStatus['PICKED_UP'] || 0) + 
            (byStatus['IN_TRANSIT'] || 0) + (byStatus['OUT_FOR_DELIVERY'] || 0),
    delivered: byStatus['DELIVERED'] || 0,
    revenue: statsData?.totalRevenue || 0,
  };

  const isLoading = statsLoading || shipmentsLoading;

  const handleRefresh = () => {
    refetchStats();
    refetchShipments();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="p-4 sm:p-6 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Shipments</h3>
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {isLoading ? '...' : stats.total}
          </p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Active Shipments</h3>
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
            {isLoading ? '...' : stats.active}
          </p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Delivered</h3>
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
            {isLoading ? '...' : stats.delivered}
          </p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Revenue</h3>
            <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            ৳{isLoading ? '...' : stats.revenue.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Recent Shipments */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Shipments</h2>
          <Link href="/shipments">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {shipmentsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-muted border-t-primary rounded-full mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        ) : shipmentsData?.data && shipmentsData.data.length > 0 ? (
          <div className="space-y-3">
            {shipmentsData.data.slice(0, 5).map((shipment) => (
              <Link
                key={shipment.id}
                href={`/track/${shipment.awb}`}
                className="block p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{shipment.awb}</p>
                      <StatusBadge status={shipment.status} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {shipment.receiverName}
                    </p>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No recent activity</p>
        )}
      </Card>
    </div>
  );
}
