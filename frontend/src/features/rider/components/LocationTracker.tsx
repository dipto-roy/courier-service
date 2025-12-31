'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocationTracking } from '../hooks';

interface LocationTrackerProps {
  enabled?: boolean;
  interval?: number;
}

export function LocationTracker({
  enabled = true,
  interval = 30000,
}: LocationTrackerProps) {
  const {
    currentLocation,
    permission,
    battery,
    isTracking,
    startTracking,
    stopTracking,
    requestPermission,
    isUpdating,
  } = useLocationTracking({
    enabled,
    interval,
    onLocationUpdate: (location) => {
      console.log('Location updated:', location);
    },
    onError: (error) => {
      console.error('Location error:', error);
    },
  });

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  if (permission.denied) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">
              Location Permission Denied
            </h3>
            <p className="text-sm text-red-700 mb-3">
              Please enable location services in your browser settings to track
              your deliveries.
            </p>
            <Button variant="outline" size="sm" onClick={requestPermission}>
              Request Permission Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Location Tracking</h3>
        <Badge variant={isTracking ? 'default' : 'secondary'}>
          {isTracking ? '🟢 Active' : '⚪ Inactive'}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Location Info */}
        {currentLocation && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Latitude</span>
              <span className="font-mono font-medium text-gray-900">
                {currentLocation.latitude.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Longitude</span>
              <span className="font-mono font-medium text-gray-900">
                {currentLocation.longitude.toFixed(6)}
              </span>
            </div>
            {currentLocation.accuracy && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-medium text-gray-900">
                  ±{currentLocation.accuracy.toFixed(0)}m
                </span>
              </div>
            )}
            {currentLocation.speed !== undefined && currentLocation.speed > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Speed</span>
                <span className="font-medium text-gray-900">
                  {(currentLocation.speed * 3.6).toFixed(1)} km/h
                </span>
              </div>
            )}
          </div>
        )}

        {/* Battery Info */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
            <span className="text-sm text-gray-600">Battery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {battery.level}%
            </span>
            {battery.charging && (
              <Badge variant="outline" className="text-xs">
                Charging
              </Badge>
            )}
          </div>
        </div>

        {/* Sync Status */}
        <div className="flex items-center justify-between py-2 border-t">
          <span className="text-sm text-gray-600">Last Update</span>
          <Badge variant={isUpdating ? 'default' : 'secondary'}>
            {isUpdating ? 'Syncing...' : 'Synced'}
          </Badge>
        </div>

        {/* Control Button */}
        <Button
          onClick={isTracking ? stopTracking : startTracking}
          variant={isTracking ? 'outline' : 'default'}
          className="w-full"
        >
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </Button>
      </div>
    </Card>
  );
}
