'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInitiatePayout } from '@/src/services/payments';
import { initiatePayoutSchema, type InitiatePayout, PaymentMethod } from '@/services/payments/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/src/common/utils';

interface PayoutFormProps {
  merchantId: string;
  availableBalance: number;
  onSuccess?: () => void;
}

export function PayoutForm({ merchantId, availableBalance, onSuccess }: PayoutFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const { mutate: initiatePayout, isPending, error } = useInitiatePayout();

  const form = useForm<InitiatePayout>({
    resolver: zodResolver(initiatePayoutSchema),
    defaultValues: {
      merchantId,
      amount: 0,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      description: '',
      referenceNumber: '',
    },
  });

  const onSubmit = (data: InitiatePayout) => {
    initiatePayout(data, {
      onSuccess: () => {
        setShowSuccess(true);
        form.reset();
        setTimeout(() => setShowSuccess(false), 5000);
        onSuccess?.();
      },
    });
  };

  const watchedAmount = form.watch('amount');
  const fee = watchedAmount * 0.01; // 1% fee
  const netAmount = watchedAmount - fee;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initiate Payout</CardTitle>
        <CardDescription>
          Transfer funds from merchant wallet to bank account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payout initiated successfully! Processing may take 1-2 business days.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error.message || 'Failed to initiate payout. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Available Balance */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Available Balance
              </span>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(availableBalance)}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payout Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum: {formatCurrency(availableBalance)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value={PaymentMethod.MOBILE_BANKING}>
                        Mobile Banking
                      </SelectItem>
                      <SelectItem value={PaymentMethod.WALLET}>
                        Wallet
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="BANK-TXN-20250128-001" {...field} />
                  </FormControl>
                  <FormDescription>
                    Bank transaction or payment reference
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Weekly payout for COD collections..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Calculation Summary */}
            {watchedAmount > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">{formatCurrency(watchedAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Fee (1%)</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(fee)}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Net Amount</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(netAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isPending || watchedAmount > availableBalance}
                className="flex-1"
              >
                {isPending ? 'Processing...' : 'Initiate Payout'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Clear
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
