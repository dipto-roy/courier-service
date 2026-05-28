'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/common/lib/apiClient';
import { useTransactions } from '@/src/services/payments/hooks/usePayments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DollarSign, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { formatDateTime } from '@/src/common/lib/utils';

interface FinanceStats {
  totalTransactions: number;
  totalAmount: number;
  pendingPayouts: number;
  pendingAmount: number;
}

interface Transaction {
  id: string;
  amount: number;
  status: string;
  type: string;
  userId?: string;
  referenceNumber?: string;
  createdAt: string;
}

function useFinanceStats() {
  return useQuery({
    queryKey: ['finance', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: FinanceStats }>('/finance/stats');
      return res.data.data;
    },
    staleTime: 60000,
  });
}

function useApprovePayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, referenceNumber }: { id: string; referenceNumber?: string }) =>
      apiClient.patch(`/finance/payouts/${id}/approve`, { referenceNumber }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

function useRejectPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.patch(`/finance/payouts/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export default function FinanceDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useFinanceStats();
  const { data: pendingData, isLoading: pendingLoading } = useTransactions({ status: 'PENDING' } as never);
  const approvePayout = useApprovePayout();
  const rejectPayout = useRejectPayout();

  const [approveTarget, setApproveTarget] = useState<Transaction | null>(null);
  const [refNumber, setRefNumber] = useState('');
  const [rejectTarget, setRejectTarget] = useState<Transaction | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pending: Transaction[] = ((pendingData as unknown as { data: Transaction[] })?.data ?? []);

  async function handleApprove() {
    if (!approveTarget) return;
    await approvePayout.mutateAsync({ id: approveTarget.id, referenceNumber: refNumber });
    setApproveTarget(null);
    setRefNumber('');
  }

  async function handleReject() {
    if (!rejectTarget) return;
    await rejectPayout.mutateAsync({ id: rejectTarget.id, reason: rejectReason });
    setRejectTarget(null);
    setRejectReason('');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
        <p className="text-sm text-gray-500">Payout queue and reconciliation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statsLoading ? '…' : (stats?.totalTransactions ?? 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ৳{statsLoading ? '…' : ((stats?.totalAmount ?? 0) / 100).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{statsLoading ? '…' : (stats?.pendingPayouts ?? pending.length)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              ৳{statsLoading ? '…' : ((stats?.pendingAmount ?? 0) / 100).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending payouts table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Payouts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pendingLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
              Loading…
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <CheckCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No pending payouts</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs text-blue-600">
                        {txn.id.slice(0, 8)}…
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {txn.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ৳{(txn.amount / 100).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                          {txn.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDateTime(txn.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => setApproveTarget(txn)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => setRejectTarget(txn)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve dialog */}
      <Dialog open={!!approveTarget} onOpenChange={() => setApproveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payout — ৳{((approveTarget?.amount ?? 0) / 100).toLocaleString()}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-gray-600">Add optional reference number for this payout.</p>
            <Input
              placeholder="Reference number (optional)"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>Cancel</Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={approvePayout.isPending}
            >
              {approvePayout.isPending ? 'Processing…' : 'Confirm Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payout — ৳{((rejectTarget?.amount ?? 0) / 100).toLocaleString()}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-gray-600">Provide a reason for rejection.</p>
            <Input
              placeholder="Reason for rejection"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectPayout.isPending || !rejectReason.trim()}
            >
              {rejectPayout.isPending ? 'Processing…' : 'Confirm Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
