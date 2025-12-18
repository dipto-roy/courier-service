'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOutboundScan } from '@/src/services/hub';
import { OutboundScan } from '@/src/services/hub/types';
import { Scanner } from './Scanner';
import {
  User,
  Package,
  Truck,
  FileText,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface HandoverListProps {
  originHub: string;
}

interface HandoverRecord {
  riderId: string;
  riderName: string;
  awbs: string[];
  timestamp: Date;
  notes?: string;
}

/**
 * HandoverList Component
 * Manages handover of shipments to riders for delivery
 */
export function HandoverList({ originHub }: HandoverListProps) {
  const [riderId, setRiderId] = useState('');
  const [riderName, setRiderName] = useState('');
  const [notes, setNotes] = useState('');
  const [awbNumbers, setAwbNumbers] = useState<string[]>([]);
  const [showScanner, setShowScanner] = useState(true);
  const [handoverRecords, setHandoverRecords] = useState<HandoverRecord[]>([]);

  const outboundScanMutation = useOutboundScan();

  const handleScan = async (scannedAwbs: string[]) => {
    // Add new AWBs to the list (avoid duplicates)
    const newAwbs = scannedAwbs.filter((awb) => !awbNumbers.includes(awb));
    setAwbNumbers((prev) => [...prev, ...newAwbs]);
  };

  const handleHandover = async () => {
    if (!riderId || !riderName || awbNumbers.length === 0) {
      alert('Please provide rider information and scan shipments');
      return;
    }

    const data: OutboundScan = {
      awbNumbers,
      originHub,
      riderId,
      notes: notes || undefined,
    };

    try {
      await outboundScanMutation.mutateAsync(data);

      // Add to handover records
      setHandoverRecords((prev) => [
        {
          riderId,
          riderName,
          awbs: [...awbNumbers],
          timestamp: new Date(),
          notes,
        },
        ...prev,
      ]);

      // Reset form
      setAwbNumbers([]);
      setRiderId('');
      setRiderName('');
      setNotes('');
    } catch (error) {
      console.error('Failed to handover shipments:', error);
    }
  };

  const handleCancel = () => {
    setAwbNumbers([]);
    setRiderId('');
    setRiderName('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Handover Form */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Shipment Handover</h2>

        <div className="space-y-6">
          {/* Rider Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="riderId">
                Rider ID <span className="text-red-500">*</span>
              </Label>
              <div className="mt-1">
                <Input
                  id="riderId"
                  placeholder="Enter rider UUID"
                  value={riderId}
                  onChange={(e) => setRiderId(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="riderName">
                Rider Name <span className="text-red-500">*</span>
              </Label>
              <div className="mt-1">
                <Input
                  id="riderName"
                  placeholder="Enter rider name"
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <div className="mt-1">
              <Input
                id="notes"
                placeholder="Add any notes about this handover..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Shipments Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Shipments to Handover ({awbNumbers.length})
              </h3>
            </div>

            {awbNumbers.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <Package className="h-5 w-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">
                      {awbNumbers.length} shipment{awbNumbers.length !== 1 ? 's' : ''}{' '}
                      ready for handover
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {awbNumbers.slice(0, 5).map((awb) => (
                        <span
                          key={awb}
                          className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-mono"
                        >
                          {awb}
                        </span>
                      ))}
                      {awbNumbers.length > 5 && (
                        <span className="px-2 py-1 text-xs text-gray-600">
                          +{awbNumbers.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleHandover}
                disabled={
                  !riderId ||
                  !riderName ||
                  awbNumbers.length === 0 ||
                  outboundScanMutation.isPending
                }
                className="flex-1"
              >
                <Truck className="h-4 w-4 mr-2" />
                {outboundScanMutation.isPending
                  ? 'Processing...'
                  : `Handover ${awbNumbers.length} Shipment${awbNumbers.length !== 1 ? 's' : ''}`}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={outboundScanMutation.isPending}
              >
                Cancel
              </Button>
            </div>

            {outboundScanMutation.isError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  Failed to process handover. Please try again.
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
          description="Scan AWB numbers for handover to rider"
        />
      )}

      {/* Handover History */}
      {handoverRecords.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Recent Handovers ({handoverRecords.length})
          </h3>
          <div className="space-y-4">
            {handoverRecords.map((record, index) => (
              <div
                key={index}
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{record.riderName}</span>
                      </div>
                      <p className="text-xs text-gray-600 font-mono mt-1">
                        ID: {record.riderId}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <p className="text-xs text-gray-600">
                          {record.timestamp.toLocaleString()}
                        </p>
                      </div>
                      {record.notes && (
                        <div className="flex items-center gap-2 mt-1">
                          <FileText className="h-3 w-3 text-gray-500" />
                          <p className="text-xs text-gray-600">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-700">
                    {record.awbs.length} shipments
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-3 border-t border-green-300">
                  {record.awbs.map((awb) => (
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
