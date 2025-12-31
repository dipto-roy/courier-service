'use client';

import { RiderDashboard, LocationTracker } from '@/src/features/rider/components';

export default function RiderPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rider Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your deliveries and performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RiderDashboard />
        </div>
        <div>
          <LocationTracker />
        </div>
      </div>
    </div>
  );
}
