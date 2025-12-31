'use client';

import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShipmentDetails, PrintLabelButton, PrintInvoiceButton } from '@/src/features/shipments/components';
import { useShipment } from '@/src/features/shipments/hooks';

export default function ShipmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: shipment, isLoading, error } = useShipment(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-900 mb-2">
          Error Loading Shipment
        </h2>
        <p className="text-red-600 mb-4">
          {error instanceof Error ? error.message : 'Shipment not found'}
        </p>
        <Link href="/dashboard/shipments">
          <Button variant="outline">Back to Shipments</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/shipments">
          <Button variant="outline">← Back to Shipments</Button>
        </Link>
        <div className="flex items-center gap-2">
          <PrintLabelButton shipmentId={id} />
          <PrintInvoiceButton shipmentId={id} />
        </div>
      </div>

      {/* Shipment Details */}
      <ShipmentDetails shipment={shipment} />
    </div>
  );
}
