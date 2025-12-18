'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSortShipments } from '@/src/services/hub';
import { SortShipments } from '@/src/services/hub/types';
import { Scanner } from './Scanner';
import {
  ArrowRight,
  MapPin,
  Package,
  Trash2,
  CheckCircle,
} from 'lucide-react';

interface SortingInterfaceProps {
  hubLocation: string;
}

/**
 * SortingInterface Component
 * Allows hub staff to sort shipments by destination for routing
 */
export function SortingInterface({ hubLocation }: SortingInterfaceProps) {
  const [destinationHub, setDestinationHub] = useState('');
  const [awbNumbers, setAwbNumbers] = useState<string[]>([]);
  const [showScanner, setShowScanner] = useState(true);
  const [sortedBatches, setSortedBatches] = useState<
    Array<{ destination: string; awbs: string[]; timestamp: Date }>
  >([]);

  const sortShipmentsMutation = useSortShipments();

  const handleScan = async (scannedAwbs: string[]) => {
    // Add new AWBs to the current batch (avoid duplicates)
    const newAwbs = scannedAwbs.filter((awb) => !awbNumbers.includes(awb));
    setAwbNumbers((prev) => [...prev, ...newAwbs]);
  };

  const handleRemoveAwb = (awb: string) => {
    setAwbNumbers((prev) => prev.filter((item) => item !== awb));
  };

  const handleSort = async () => {
    if (!destinationHub || awbNumbers.length === 0) {
      alert('Please select destination and scan shipments');
      return;
    }

    const data: SortShipments = {
      awbNumbers,
      hubLocation,
      destinationHub,
    };

    try {
      await sortShipmentsMutation.mutateAsync(data);

      // Add to sorted batches
      setSortedBatches((prev) => [
        {
          destination: destinationHub,
          awbs: [...awbNumbers],
          timestamp: new Date(),
        },
        ...prev,
      ]);

      // Reset current batch
      setAwbNumbers([]);
      setDestinationHub('');
    } catch (error) {
      console.error('Failed to sort shipments:', error);
    }
  };

  const handleClearBatch = () => {
    setAwbNumbers([]);
    setDestinationHub('');
  };

  return (
    <div className="space-y-6">
      {/* Current Batch */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Sort Shipments</h2>

        <div className="space-y-6">
          {/* Hub Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentHub">Current Hub</Label>
              <div className="mt-1">
                <Input
                  id="currentHub"
                  value={hubLocation}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="destinationHub">
                Destination Hub <span className="text-red-500">*</span>
              </Label>
              <div className="mt-1">
                <Input
                  id="destinationHub"
                  placeholder="Enter destination hub"
                  value={destinationHub}
                  onChange={(e) => setDestinationHub(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Current Batch Shipments */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Current Batch ({awbNumbers.length})
              </h3>
              {awbNumbers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearBatch}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {awbNumbers.length > 0 && (
              <div className="space-y-2 mb-4">
                {awbNumbers.map((awb) => (
                  <div
                    key={awb}
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span className="font-mono font-medium">{awb}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAwb(awb)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleSort}
                disabled={
                  !destinationHub ||
                  awbNumbers.length === 0 ||
                  sortShipmentsMutation.isPending
                }
                className="flex-1"
              >
                {sortShipmentsMutation.isPending
                  ? 'Sorting...'
                  : `Sort ${awbNumbers.length} Shipment${awbNumbers.length !== 1 ? 's' : ''} → ${destinationHub || '...'}`}
              </Button>
            </div>

            {sortShipmentsMutation.isError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  Failed to sort shipments. Please try again.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Scanner */}
      {showScanner && (
        <Scanner
          onScan={handleScan}
          title="Scan Shipments"
          description="Scan AWB numbers to add to sorting batch"
        />
      )}

      {/* Sorted Batches */}
      {sortedBatches.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Recently Sorted ({sortedBatches.length} batches)
          </h3>
          <div className="space-y-4">
            {sortedBatches.map((batch, index) => (
              <div
                key={index}
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{hubLocation}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{batch.destination}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {batch.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-700">
                    {batch.awbs.length} shipments
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {batch.awbs.map((awb) => (
                    <span
                      key={awb}
                      className="px-2 py-1 bg-white border border-green-300 rounded text-xs font-mono"
                    >
                      {awb}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
