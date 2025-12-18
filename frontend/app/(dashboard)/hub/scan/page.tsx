'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scanner } from '@/src/features/hub/components';
import { useInboundScan, useOutboundScan } from '@/src/services/hub';
import { Card } from '@/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';

export default function HubScanPage() {
  const [hubLocation] = useState('Dhaka Hub'); // TODO: Get from user context
  const inboundScanMutation = useInboundScan();
  const outboundScanMutation = useOutboundScan();

  const handleInboundScan = async (awbNumbers: string[]) => {
    await inboundScanMutation.mutateAsync({
      awbNumbers,
      hubLocation,
    });
  };

  const handleOutboundScan = async (awbNumbers: string[]) => {
    await outboundScanMutation.mutateAsync({
      awbNumbers,
      originHub: hubLocation,
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Hub Scanning</h1>
        <p className="text-gray-600 mt-1">
          Scan shipments for inbound or outbound operations
        </p>
      </div>

      <Tabs defaultValue="inbound" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="inbound" className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4" />
            Inbound Scan
          </TabsTrigger>
          <TabsTrigger value="outbound" className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4" />
            Outbound Scan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbound" className="mt-6">
          <Scanner
            onScan={handleInboundScan}
            title="Inbound Scan"
            description="Scan shipments arriving at the hub"
          />
        </TabsContent>

        <TabsContent value="outbound" className="mt-6">
          <Scanner
            onScan={handleOutboundScan}
            title="Outbound Scan"
            description="Scan shipments leaving the hub"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
