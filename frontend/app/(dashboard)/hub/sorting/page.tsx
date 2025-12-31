'use client';

import { SortingInterface } from '@/src/features/hub/components';
import { useState } from 'react';

export default function HubSortingPage() {
  const [hubLocation] = useState('Dhaka Hub'); // TODO: Get from user context

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Shipment Sorting</h1>
        <p className="text-gray-600 mt-1">
          Sort shipments by destination for routing
        </p>
      </div>

      <SortingInterface hubLocation={hubLocation} />
    </div>
  );
}
