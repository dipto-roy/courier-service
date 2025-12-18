'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useManifest } from '@/src/services/hub';
import { ManifestStatus } from '@/src/services/hub/types';
import { formatDateTime } from '@/src/common/lib/utils';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface ManifestDetailsProps {
  id: string;
  onReceive?: () => void;
}

/**
 * ManifestDetails Component
 * Displays complete manifest information including shipment list and status timeline
 */
export function ManifestDetails({ id, onReceive }: ManifestDetailsProps) {
  const { data: manifest, isLoading, error } = useManifest(id);

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center text-red-600">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <p>Failed to load manifest details</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-32 bg-gray-200 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!manifest) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">Manifest not found</p>
      </Card>
    );
  }

  const getStatusColor = (status: ManifestStatus) => {
    switch (status) {
      case ManifestStatus.CREATED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ManifestStatus.IN_TRANSIT:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ManifestStatus.RECEIVED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case ManifestStatus.CLOSED:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const canReceive = manifest.status === ManifestStatus.IN_TRANSIT;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{manifest.manifestNumber}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Created {formatDateTime(manifest.createdAt)}
            </p>
          </div>
          <Badge className={getStatusColor(manifest.status)}>
            {manifest.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Route</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-medium">{manifest.originHub}</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span className="font-medium">
                  {manifest.destinationHub || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-gray-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Total Shipments</p>
              <p className="font-medium mt-1">{manifest.totalShipments} items</p>
            </div>
          </div>

          {manifest.createdBy && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium mt-1">{manifest.createdBy.name}</p>
              </div>
            </div>
          )}

          {manifest.rider && (
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-gray-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Assigned Rider</p>
                <p className="font-medium mt-1">{manifest.rider.name}</p>
              </div>
            </div>
          )}
        </div>

        {manifest.notes && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-500 mb-1">Notes</p>
            <p className="text-sm">{manifest.notes}</p>
          </div>
        )}

        {canReceive && onReceive && (
          <div className="mt-6 pt-6 border-t">
            <Button onClick={onReceive} className="w-full md:w-auto">
              <CheckCircle className="h-4 w-4 mr-2" />
              Receive Manifest
            </Button>
          </div>
        )}
      </Card>

      {/* Status Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Status Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div className="w-0.5 h-12 bg-gray-200" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Created</p>
              <p className="text-sm text-gray-600">
                {formatDateTime(manifest.createdAt)}
              </p>
            </div>
          </div>

          {manifest.dispatchDate && (
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-blue-600" />
                </div>
                {manifest.receivedDate && (
                  <div className="w-0.5 h-12 bg-gray-200" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">Dispatched</p>
                <p className="text-sm text-gray-600">
                  {formatDateTime(manifest.dispatchDate)}
                </p>
              </div>
            </div>
          )}

          {manifest.receivedDate && (
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                {manifest.status === ManifestStatus.CLOSED && (
                  <div className="w-0.5 h-12 bg-gray-200" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">Received</p>
                <p className="text-sm text-gray-600">
                  {formatDateTime(manifest.receivedDate)}
                </p>
                {manifest.receivedBy && (
                  <p className="text-sm text-gray-600">
                    by {manifest.receivedBy.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {manifest.status === ManifestStatus.CLOSED && (
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium">Closed</p>
                <p className="text-sm text-gray-600">
                  {formatDateTime(manifest.updatedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Shipments List */}
      {manifest.shipments && manifest.shipments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Shipments ({manifest.shipments.length})
          </h3>
          <div className="space-y-2">
            {manifest.shipments.map((shipment) => (
              <div
                key={shipment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-mono font-medium">{shipment.awbNumber}</p>
                  <p className="text-sm text-gray-600">{shipment.status}</p>
                </div>
                {shipment.destinationHub && (
                  <span className="text-sm text-gray-600">
                    → {shipment.destinationHub}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
