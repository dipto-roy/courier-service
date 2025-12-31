'use client';

import { useState } from 'react';
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
import { useGenerateOTP, useCompleteDelivery } from '../hooks';
import type { RiderDelivery } from '../types';
import { deliveryActionSchema } from '../types';

interface OTPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: RiderDelivery;
  onSuccess?: () => void;
}

export function OTPDialog({
  open,
  onOpenChange,
  delivery,
  onSuccess,
}: OTPDialogProps) {
  const [generatedOTP, setGeneratedOTP] = useState<string>('');
  const generateOTP = useGenerateOTP();
  const completeDelivery = useCompleteDelivery();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof deliveryActionSchema>>({
    resolver: zodResolver(deliveryActionSchema),
    defaultValues: {
      receiverName: delivery.customerName,
    },
  });

  const handleGenerateOTP = async () => {
    try {
      const result = await generateOTP.mutateAsync(delivery.id);
      setGeneratedOTP(result.otp);
    } catch (error) {
      console.error('Failed to generate OTP:', error);
    }
  };

  const onSubmit = async (data: z.infer<typeof deliveryActionSchema>) => {
    try {
      await completeDelivery.mutateAsync({
        shipmentId: delivery.id,
        data,
      });
      onSuccess?.();
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Failed to complete delivery:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Delivery</DialogTitle>
          <DialogDescription>
            AWB: {delivery.awb} - {delivery.customerName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Generate OTP Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Customer OTP</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateOTP}
                disabled={generateOTP.isPending}
              >
                {generateOTP.isPending ? 'Generating...' : 'Generate OTP'}
              </Button>
            </div>
            {generatedOTP && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700 mb-1">Generated OTP</p>
                <p className="text-3xl font-bold text-green-900 tracking-widest">
                  {generatedOTP}
                </p>
              </div>
            )}
          </div>

          {/* Enter OTP */}
          <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP from Customer</Label>
            <Input
              id="otp"
              {...register('otp')}
              placeholder="000000"
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
            {errors.otp && (
              <p className="text-sm text-red-600">{errors.otp.message}</p>
            )}
          </div>

          {/* Receiver Name */}
          <div className="space-y-2">
            <Label htmlFor="receiverName">Receiver Name</Label>
            <Input id="receiverName" {...register('receiverName')} />
            {errors.receiverName && (
              <p className="text-sm text-red-600">
                {errors.receiverName.message}
              </p>
            )}
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              {...register('remarks')}
              placeholder="Any additional notes..."
              rows={3}
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
            <Button type="submit" disabled={completeDelivery.isPending}>
              {completeDelivery.isPending ? 'Completing...' : 'Complete Delivery'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
