'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFailDelivery } from '../hooks';
import type { RiderDelivery } from '../types';
import { failedDeliverySchema } from '../types';

interface FailedDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: RiderDelivery;
  onSuccess?: () => void;
}

const failureReasons = [
  { value: 'CUSTOMER_NOT_AVAILABLE', label: 'Customer Not Available' },
  { value: 'WRONG_ADDRESS', label: 'Wrong Address' },
  { value: 'CUSTOMER_REFUSED', label: 'Customer Refused' },
  { value: 'PAYMENT_ISSUE', label: 'Payment Issue' },
  { value: 'OTHER', label: 'Other' },
];

export function FailedDeliveryDialog({
  open,
  onOpenChange,
  delivery,
  onSuccess,
}: FailedDeliveryDialogProps) {
  const failDelivery = useFailDelivery();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<z.infer<typeof failedDeliverySchema>>({
    resolver: zodResolver(failedDeliverySchema),
  });

  const selectedReason = watch('reason');

  const onSubmit = async (data: z.infer<typeof failedDeliverySchema>) => {
    try {
      await failDelivery.mutateAsync({
        shipmentId: delivery.id,
        data,
      });
      onSuccess?.();
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Failed to mark delivery as failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Failed</DialogTitle>
          <DialogDescription>
            AWB: {delivery.awb} - {delivery.customerName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Failure Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Failure Reason</Label>
            <Select
              onValueChange={(value) => setValue('reason', value as any)}
              value={selectedReason}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {failureReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Additional Details</Label>
            <Textarea
              id="remarks"
              {...register('remarks')}
              placeholder="Provide more details about why the delivery failed..."
              rows={4}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ This delivery will be marked as failed and may be rescheduled
              for another attempt.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={failDelivery.isPending}
            >
              {failDelivery.isPending ? 'Processing...' : 'Mark as Failed'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
