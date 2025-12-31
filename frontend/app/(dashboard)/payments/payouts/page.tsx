'use client';

import { useState } from 'react';
import { PayoutForm } from '@/src/features/payments/components';
import { useTransactions, usePendingBalance } from '@/src/services/payments';
import { useAuth } from '@/src/common/hooks/useAuth';
import { TransactionType, PaymentStatus } from '@/src/services/payments/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/src/common/utils';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export default function PayoutsPage() {
  const { user } = useAuth();
  const merchantId = user?.id || '';
  
  const { data: balanceData } = usePendingBalance(merchantId);
  const { data: payoutsData, isLoading } = useTransactions({
    type: TransactionType.COD_PAYOUT,
    merchantId,
  });

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case PaymentStatus.PROCESSING:
        return <Clock className="h-4 w-4 text-blue-600" />;
      case PaymentStatus.FAILED:
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    const colors = {
      [PaymentStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [PaymentStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
      [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [PaymentStatus.FAILED]: 'bg-red-100 text-red-800',
      [PaymentStatus.COLLECTED]: 'bg-purple-100 text-purple-800',
      [PaymentStatus.VERIFIED]: 'bg-indigo-100 text-indigo-800',
      [PaymentStatus.PAID_OUT]: 'bg-teal-100 text-teal-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Payout Management</h1>
        <p className="text-gray-600 mt-2">
          Request and track payouts from your wallet
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout Form */}
        <div className="lg:col-span-1">
          <PayoutForm
            merchantId={merchantId}
            availableBalance={balanceData?.pendingBalance || 0}
          />
        </div>

        {/* Payout History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : payoutsData?.transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No payouts yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Initiate your first payout using the form
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutsData?.transactions.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-mono text-sm">
                          {payout.transactionId}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payout.netAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payout.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(payout.status)}
                              {payout.status.replace('_', ' ')}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(payout.createdAt)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
