'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RiderManifest } from '../types';
import { formatDateTime } from '@/src/common/lib/utils';

interface ManifestCardProps {
  manifest: RiderManifest;
  onStart?: (manifestId: number) => void;
  onComplete?: (manifestId: number) => void;
  onView?: (manifestId: number) => void;
}

export function ManifestCard({
  manifest,
  onStart,
  onComplete,
  onView,
}: ManifestCardProps) {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const typeIcons = {
    PICKUP: '📥',
    DELIVERY: '🚚',
  };

  const progress = (manifest.completedShipments / manifest.totalShipments) * 100;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
            {typeIcons[manifest.type]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {manifest.manifestNumber}
            </h3>
            <p className="text-sm text-gray-600">{manifest.hubName}</p>
          </div>
        </div>
        <Badge className={statusColors[manifest.status]}>
          {manifest.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipments</span>
          <span className="font-medium text-gray-900">
            {manifest.completedShipments} / {manifest.totalShipments}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Scheduled</span>
          <span className="font-medium text-gray-900">
            {formatDateTime(manifest.scheduledDate)}
          </span>
        </div>

        {manifest.startedAt && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Started</span>
            <span className="font-medium text-gray-900">
              {formatDateTime(manifest.startedAt)}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {manifest.status === 'PENDING' && (
          <Button onClick={() => onStart?.(manifest.id)} className="flex-1">
            Start {manifest.type === 'PICKUP' ? 'Pickup' : 'Delivery'}
          </Button>
        )}
        {manifest.status === 'IN_PROGRESS' && (
          <>
            <Button
              onClick={() => onView?.(manifest.id)}
              variant="outline"
              className="flex-1"
            >
              View Details
            </Button>
            <Button
              onClick={() => onComplete?.(manifest.id)}
              className="flex-1"
              disabled={manifest.completedShipments < manifest.totalShipments}
            >
              Complete
            </Button>
          </>
        )}
        {manifest.status === 'COMPLETED' && (
          <Button
            onClick={() => onView?.(manifest.id)}
            variant="outline"
            className="w-full"
          >
            View Details
          </Button>
        )}
      </div>
    </Card>
  );
}
