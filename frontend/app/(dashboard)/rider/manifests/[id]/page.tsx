'use client';

import { use } from 'react';
import { useManifest } from '@/src/features/rider/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeliveryActionButtons } from '@/src/features/rider/components';
import { formatDateTime, formatCurrency } from '@/src/common/lib/utils';
import Link from 'next/link';

export default function ManifestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const manifestId = parseInt(id);
  const { data: manifest, isLoading } = useManifest(manifestId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">Loading manifest...</p>
        </div>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Manifest not found</p>
        <Link href="/rider/manifests">
          <Button variant="outline" className="mt-4">
            Back to Manifests
          </Button>
        </Link>
      </div>
    );
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {manifest.manifestNumber}
          </h1>
          <p className="text-gray-600 mt-1">
            {manifest.type === 'PICKUP' ? 'Pickup' : 'Delivery'} Manifest
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/rider/manifests">
            <Button variant="outline">Back</Button>
          </Link>
          <Badge className={statusColors[manifest.status]}>
            {manifest.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Manifest Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Manifest Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Hub</p>
            <p className="font-medium text-gray-900">{manifest.hubName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Shipments</p>
            <p className="font-medium text-gray-900">
              {manifest.totalShipments}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completed</p>
            <p className="font-medium text-gray-900">
              {manifest.completedShipments}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Scheduled Date</p>
            <p className="font-medium text-gray-900">
              {formatDateTime(manifest.scheduledDate)}
            </p>
          </div>
        </div>
      </Card>

      {/* Shipments List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Shipments</h2>
        {manifest.shipments && manifest.shipments.length > 0 ? (
          <div className="space-y-3">
            {manifest.shipments.map((shipment) => (
              <Card key={shipment.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                        {shipment.sequence}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {shipment.awb}
                        </p>
                        <p className="text-sm text-gray-600">
                          {shipment.receiverName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{shipment.status}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                    <p className="text-sm font-medium text-gray-900">
                      {shipment.receiverAddress}
                    </p>
                    <p className="text-sm text-gray-600">
                      {shipment.area}, {shipment.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Contact</p>
                    <p className="text-sm font-medium text-gray-900">
                      {shipment.receiverPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600">
                      Weight: <strong>{shipment.weight} kg</strong>
                    </span>
                    {shipment.codAmount > 0 && (
                      <span className="text-gray-600">
                        COD: <strong>{formatCurrency(shipment.codAmount)}</strong>
                      </span>
                    )}
                  </div>
                  {shipment.latitude && shipment.longitude && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${shipment.latitude},${shipment.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Navigate
                      </a>
                    </Button>
                  )}
                </div>

                {/* Delivery Actions */}
                {manifest.status === 'IN_PROGRESS' &&
                  shipment.status !== 'DELIVERED' &&
                  shipment.status !== 'FAILED' && (
                    <div className="mt-4 pt-4 border-t">
                      <DeliveryActionButtons
                        delivery={{
                          id: shipment.id,
                          awb: shipment.awb,
                          manifestId: manifest.id,
                          manifestNumber: manifest.manifestNumber,
                          customerName: shipment.receiverName,
                          customerPhone: shipment.receiverPhone,
                          deliveryAddress: shipment.receiverAddress,
                          city: shipment.city,
                          area: shipment.area,
                          latitude: shipment.latitude,
                          longitude: shipment.longitude,
                          status: shipment.status,
                          serviceType: shipment.serviceType,
                          weight: shipment.weight,
                          codAmount: shipment.codAmount,
                          isCOD: shipment.codAmount > 0,
                          codCollected: false,
                          sequence: shipment.sequence,
                          createdAt: manifest.createdAt,
                        }}
                      />
                    </div>
                  )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No shipments in this manifest</p>
          </div>
        )}
      </div>
    </div>
  );
}
