import { ShipmentForm } from '@/src/features/shipments/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Shipment - FastX Courier',
  description: 'Create a new shipment',
};

export default function CreateShipmentPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Shipment</h1>
        <p className="text-gray-600">
          Fill in the details to create a new shipment
        </p>
      </div>

      <ShipmentForm />
    </div>
  );
}
