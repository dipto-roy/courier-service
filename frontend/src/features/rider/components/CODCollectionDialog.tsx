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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollectCOD } from '../hooks';
import type { RiderDelivery } from '../types';
import { codCollectionSchema } from '../types';
import { formatCurrency } from '@/src/common/lib/utils';

interface CODCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: RiderDelivery;
}

export function CODCollectionDialog({
  open,
  onOpenChange,
  delivery,
}: CODCollectionDialogProps) {
  const collectCOD = useCollectCOD();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<z.infer<typeof codCollectionSchema>>({
    resolver: zodResolver(codCollectionSchema),
    defaultValues: {
      amount: delivery.codAmount,
      paymentMethod: 'CASH',
    },
  });

  const paymentMethod = watch('paymentMethod');

  const onSubmit = async (data: z.infer<typeof codCollectionSchema>) => {
    try {
      await collectCOD.mutateAsync({
        shipmentId: delivery.id,
        data,
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Failed to collect COD:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collect COD Payment</DialogTitle>
          <DialogDescription>
            AWB: {delivery.awb} - {delivery.customerName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Expected Amount */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 mb-1">Expected COD Amount</p>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(delivery.codAmount)}
            </p>
          </div>

          {/* Collected Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Collected Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              onValueChange={(value) => setValue('paymentMethod', value as any)}
              value={paymentMethod}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="MOBILE_BANKING">Mobile Banking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction ID (for non-cash payments) */}
          {paymentMethod !== 'CASH' && (
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                {...register('transactionId')}
                placeholder="Enter transaction/reference ID"
              />
            </div>
          )}

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              {...register('remarks')}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={collectCOD.isPending}>
              {collectCOD.isPending ? 'Collecting...' : 'Collect Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
