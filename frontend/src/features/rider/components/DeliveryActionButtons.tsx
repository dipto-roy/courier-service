'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OTPDialog } from './OTPDialog';
import { FailedDeliveryDialog } from './FailedDeliveryDialog';
import { CODCollectionDialog } from './CODCollectionDialog';
import type { RiderDelivery } from '../types';

interface DeliveryActionButtonsProps {
  delivery: RiderDelivery;
  onComplete?: () => void;
  onFail?: () => void;
}

export function DeliveryActionButtons({
  delivery,
  onComplete,
  onFail,
}: DeliveryActionButtonsProps) {
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [failDialogOpen, setFailDialogOpen] = useState(false);
  const [codDialogOpen, setCodDialogOpen] = useState(false);

  const isCompleted = delivery.status === 'DELIVERED';
  const isFailed = delivery.status === 'FAILED';
  const isPending = !isCompleted && !isFailed;

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="font-medium">Delivered</span>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <span className="font-medium">Failed</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {/* Collect COD Button */}
      {delivery.isCOD && !delivery.codCollected && (
        <Button
          variant="outline"
          onClick={() => setCodDialogOpen(true)}
          className="flex-1"
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
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Collect COD
        </Button>
      )}

      {/* Complete Delivery Button */}
      <Button onClick={() => setOtpDialogOpen(true)} className="flex-1">
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
            d="M5 13l4 4L19 7"
          />
        </svg>
        Complete
      </Button>

      {/* Mark as Failed Button */}
      <Button
        variant="destructive"
        onClick={() => setFailDialogOpen(true)}
        className="flex-1"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        Failed
      </Button>

      {/* Dialogs */}
      <OTPDialog
        open={otpDialogOpen}
        onOpenChange={setOtpDialogOpen}
        delivery={delivery}
        onSuccess={onComplete}
      />

      <FailedDeliveryDialog
        open={failDialogOpen}
        onOpenChange={setFailDialogOpen}
        delivery={delivery}
        onSuccess={onFail}
      />

      {delivery.isCOD && (
        <CODCollectionDialog
          open={codDialogOpen}
          onOpenChange={setCodDialogOpen}
          delivery={delivery}
        />
      )}
    </div>
  );
}
