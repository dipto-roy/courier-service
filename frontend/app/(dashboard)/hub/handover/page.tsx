'use client';

import { HandoverList } from '@/src/features/hub/components';
import { useState } from 'react';

export default function HubHandoverPage() {
  const [hubLocation] = useState('Dhaka Hub'); // TODO: Get from user context

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Shipment Handover</h1>
        <p className="text-gray-600 mt-1">
          Handover shipments to riders for delivery
        </p>
      </div>

      <HandoverList originHub={hubLocation} />
    </div>
  );
}
