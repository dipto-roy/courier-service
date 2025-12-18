'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useManifests } from '@/src/services/hub';
import { ManifestFilters, ManifestStatus } from '@/src/services/hub/types';
import { formatDateTime } from '@/src/common/lib/utils';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface ManifestListProps {
  filters?: ManifestFilters;
}

/**
 * ManifestList Component
 * Displays list of manifests with filtering and pagination
 */
export function ManifestList({ filters }: ManifestListProps) {
  const { data, isLoading, error } = useManifests(filters);

  const getStatusIcon = (status: ManifestStatus) => {
    switch (status) {
      case ManifestStatus.CREATED:
        return <Clock className="h-4 w-4" />;
      case ManifestStatus.IN_TRANSIT:
        return <Truck className="h-4 w-4" />;
      case ManifestStatus.RECEIVED:
        return <Package className="h-4 w-4" />;
      case ManifestStatus.CLOSED:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: ManifestStatus) => {
    const variants: Record<
      ManifestStatus,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      [ManifestStatus.CREATED]: 'secondary',
      [ManifestStatus.IN_TRANSIT]: 'default',
      [ManifestStatus.RECEIVED]: 'outline',
      [ManifestStatus.CLOSED]: 'outline',
    };

    const colors: Record<ManifestStatus, string> = {
      [ManifestStatus.CREATED]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [ManifestStatus.IN_TRANSIT]: 'bg-blue-100 text-blue-800 border-blue-200',
      [ManifestStatus.RECEIVED]: 'bg-purple-100 text-purple-800 border-purple-200',
      [ManifestStatus.CLOSED]: 'bg-green-100 text-green-800 border-green-200',
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        <span className="flex items-center gap-1">
          {getStatusIcon(status)}
          {status.replace('_', ' ').toUpperCase()}
        </span>
      </Badge>
    );
  };

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Failed to load manifests</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-gray-200 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!data || data.manifests.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No manifests found</p>
          <p className="text-sm mt-1">
            Try adjusting your filters or create a new manifest
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing {data.manifests.length} of {data.total} manifests
        </p>
      </div>

      {data.manifests.map((manifest) => (
        <Link key={manifest.id} href={`/dashboard/hub/manifests/${manifest.id}`}>
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Manifest Number
                </p>
                <p className="text-xl font-semibold">{manifest.manifestNumber}</p>
              </div>
              {getStatusBadge(manifest.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Origin Hub</p>
                <p className="text-sm font-medium">{manifest.originHub}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Destination Hub</p>
                <p className="text-sm font-medium">
                  {manifest.destinationHub || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Shipments</p>
                <p className="text-sm font-medium">
                  {manifest.totalShipments} items
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm">{formatDateTime(manifest.createdAt)}</p>
              </div>
              {manifest.dispatchDate && (
                <div>
                  <p className="text-xs text-gray-500">Dispatched</p>
                  <p className="text-sm">
                    {formatDateTime(manifest.dispatchDate)}
                  </p>
                </div>
              )}
              {manifest.receivedDate && (
                <div>
                  <p className="text-xs text-gray-500">Received</p>
                  <p className="text-sm">
                    {formatDateTime(manifest.receivedDate)}
                  </p>
                </div>
              )}
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
