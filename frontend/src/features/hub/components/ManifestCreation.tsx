'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateManifest } from '@/src/services/hub';
import { CreateManifest } from '@/src/services/hub/types';
import { Scanner } from './Scanner';
import { Plus, Trash2, Package } from 'lucide-react';

interface ManifestCreationProps {
  originHub: string;
  onSuccess?: (manifestId: string) => void;
}

/**
 * ManifestCreation Component
 * Form for creating new manifests with shipment selection
 */
export function ManifestCreation({
  originHub,
  onSuccess,
}: ManifestCreationProps) {
  const [destinationHub, setDestinationHub] = useState('');
  const [riderId, setRiderId] = useState('');
  const [notes, setNotes] = useState('');
  const [awbNumbers, setAwbNumbers] = useState<string[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  const createManifestMutation = useCreateManifest();

  const handleScan = async (scannedAwbs: string[]) => {
    // Add new AWBs to the list (avoid duplicates)
    const newAwbs = scannedAwbs.filter((awb) => !awbNumbers.includes(awb));
    setAwbNumbers((prev) => [...prev, ...newAwbs]);
  };

  const handleRemoveAwb = (awb: string) => {
    setAwbNumbers((prev) => prev.filter((item) => item !== awb));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!destinationHub || awbNumbers.length === 0) {
      alert('Please provide destination hub and at least one shipment');
      return;
    }

    const data: CreateManifest = {
      originHub,
      destinationHub,
      awbNumbers,
      riderId: riderId || undefined,
      notes: notes || undefined,
    };

    try {
      const result = await createManifestMutation.mutateAsync(data);
      // Reset form
      setDestinationHub('');
      setRiderId('');
      setNotes('');
      setAwbNumbers([]);
      setShowScanner(false);

      if (onSuccess) {
        onSuccess(result.id);
      }
    } catch (error) {
      console.error('Failed to create manifest:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Create Manifest</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Origin and Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="originHub">Origin Hub</Label>
              <div className="mt-1">
                <Input
                  id="originHub"
                  value={originHub}
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
                  required
                />
              </div>
            </div>
          </div>

          {/* Rider ID (Optional) */}
          <div>
            <Label htmlFor="riderId">Rider ID (Optional)</Label>
            <div className="mt-1">
              <Input
                id="riderId"
                placeholder="Enter rider UUID if assigning to specific rider"
                value={riderId}
                onChange={(e) => setRiderId(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <div className="mt-1">
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Shipments Section */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold">
                  Shipments ({awbNumbers.length})
                </h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowScanner(!showScanner)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {showScanner ? 'Hide Scanner' : 'Add Shipments'}
              </Button>
            </div>

            {awbNumbers.length === 0 && !showScanner && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No shipments added yet</p>
                <p className="text-sm mt-1">Click "Add Shipments" to scan AWBs</p>
              </div>
            )}

            {awbNumbers.length > 0 && (
              <div className="space-y-2 mb-4">
                {awbNumbers.map((awb) => (
                  <div
                    key={awb}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-mono font-medium">{awb}</span>
                    <Button
                      type="button"
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
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={
                !destinationHub ||
                awbNumbers.length === 0 ||
                createManifestMutation.isPending
              }
              className="flex-1"
            >
              {createManifestMutation.isPending
                ? 'Creating Manifest...'
                : `Create Manifest with ${awbNumbers.length} Shipment${awbNumbers.length !== 1 ? 's' : ''}`}
            </Button>
          </div>

          {createManifestMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                Failed to create manifest. Please try again.
              </p>
            </div>
          )}
        </form>
      </Card>

      {/* Scanner Section */}
      {showScanner && (
        <Scanner
          onScan={handleScan}
          title="Scan Shipments"
          description="Scan AWB numbers to add to manifest"
        />
      )}
    </div>
  );
}
