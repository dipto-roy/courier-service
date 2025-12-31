'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Camera,
  Keyboard,
  Trash2,
  CheckCircle,
  AlertCircle,
  ScanLine,
} from 'lucide-react';

interface ScannerProps {
  onScan: (awbNumbers: string[]) => Promise<void>;
  title?: string;
  description?: string;
}

interface ScannedItem {
  awb: string;
  timestamp: Date;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

/**
 * Scanner Component
 * Supports both barcode scanning and manual AWB entry
 * Maintains scan history with validation
 */
export function Scanner({ onScan, title, description }: ScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [manualInput, setManualInput] = useState('');
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateAwb = (awb: string): boolean => {
    // Basic AWB format validation
    // Adjust regex based on your AWB format (e.g., FXC2025010001)
    const awbRegex = /^[A-Z]{3}\d{10}$/;
    return awbRegex.test(awb.trim().toUpperCase());
  };

  const handleManualScan = () => {
    const awb = manualInput.trim().toUpperCase();
    if (!awb) return;

    // Check for duplicates
    if (scannedItems.some((item) => item.awb === awb)) {
      alert('This AWB has already been scanned');
      return;
    }

    // Validate format
    if (!validateAwb(awb)) {
      setScannedItems((prev) => [
        ...prev,
        {
          awb,
          timestamp: new Date(),
          status: 'error',
          error: 'Invalid AWB format',
        },
      ]);
      setManualInput('');
      return;
    }

    // Add to pending list
    setScannedItems((prev) => [
      ...prev,
      {
        awb,
        timestamp: new Date(),
        status: 'pending',
      },
    ]);
    setManualInput('');
  };

  const handleSubmit = async () => {
    const pendingItems = scannedItems.filter((item) => item.status === 'pending');
    if (pendingItems.length === 0) return;

    setIsProcessing(true);
    try {
      const awbNumbers = pendingItems.map((item) => item.awb);
      await onScan(awbNumbers);

      // Mark items as success
      setScannedItems((prev) =>
        prev.map((item) =>
          pendingItems.some((p) => p.awb === item.awb)
            ? { ...item, status: 'success' as const }
            : item,
        ),
      );
    } catch (error) {
      // Mark items as error
      setScannedItems((prev) =>
        prev.map((item) =>
          pendingItems.some((p) => p.awb === item.awb)
            ? {
                ...item,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Scan failed',
              }
            : item,
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setScannedItems([]);
    setManualInput('');
  };

  const handleRemoveItem = (awb: string) => {
    setScannedItems((prev) => prev.filter((item) => item.awb !== awb));
  };

  const pendingCount = scannedItems.filter((item) => item.status === 'pending').length;
  const successCount = scannedItems.filter((item) => item.status === 'success').length;
  const errorCount = scannedItems.filter((item) => item.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{title || 'Scan Shipments'}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={mode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('manual')}
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Manual
            </Button>
            <Button
              variant={mode === 'camera' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('camera')}
              disabled
              title="Camera scanning coming soon"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
          </div>
        </div>

        {/* Manual Input */}
        {mode === 'manual' && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter AWB number (e.g., FXC2025010001)"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
              className="font-mono"
              autoFocus
            />
            <Button onClick={handleManualScan} disabled={!manualInput.trim()}>
              <ScanLine className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        )}

        {/* Camera Scanner Placeholder */}
        {mode === 'camera' && (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="text-center">
              <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Camera scanning will be available soon
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Scan History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">
            Scanned Items ({scannedItems.length})
          </h4>
          <div className="flex items-center gap-4 text-sm">
            {pendingCount > 0 && (
              <span className="text-yellow-600">Pending: {pendingCount}</span>
            )}
            {successCount > 0 && (
              <span className="text-green-600">Success: {successCount}</span>
            )}
            {errorCount > 0 && (
              <span className="text-red-600">Error: {errorCount}</span>
            )}
          </div>
        </div>

        {scannedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ScanLine className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No items scanned yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {scannedItems.map((item) => (
              <div
                key={item.awb}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  item.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : item.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : item.status === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <ScanLine className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <p className="font-mono font-medium">{item.awb}</p>
                    {item.error && (
                      <p className="text-xs text-red-600">{item.error}</p>
                    )}
                  </div>
                </div>
                {item.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.awb)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {scannedItems.length > 0 && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSubmit}
              disabled={pendingCount === 0 || isProcessing}
              className="flex-1"
            >
              {isProcessing
                ? 'Processing...'
                : `Submit ${pendingCount} Item${pendingCount !== 1 ? 's' : ''}`}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isProcessing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
