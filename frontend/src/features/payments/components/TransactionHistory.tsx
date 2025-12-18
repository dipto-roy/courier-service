'use client';

import { useState } from 'react';
import { useTransactions } from '@/src/services/payments';
import { TransactionType, PaymentStatus, PaymentMethod, type PaymentFilter } from '@/services/payments/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/src/common/utils';

export function TransactionHistory() {
  const [filters, setFilters] = useState<PaymentFilter>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useTransactions(filters);

  const handleFilterChange = (key: keyof PaymentFilter, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting transactions...');
  };

  const getStatusColor = (status: PaymentStatus) => {
    const colors = {
      [PaymentStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [PaymentStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
      [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [PaymentStatus.COLLECTED]: 'bg-purple-100 text-purple-800',
      [PaymentStatus.VERIFIED]: 'bg-indigo-100 text-indigo-800',
      [PaymentStatus.PAID_OUT]: 'bg-teal-100 text-teal-800',
      [PaymentStatus.FAILED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: TransactionType) => {
    const labels = {
      [TransactionType.DELIVERY_FEE]: 'Delivery Fee',
      [TransactionType.COD_COLLECTION]: 'COD Collection',
      [TransactionType.COD_PAYOUT]: 'COD Payout',
      [TransactionType.WALLET_CREDIT]: 'Wallet Credit',
      [TransactionType.WALLET_DEBIT]: 'Wallet Debit',
      [TransactionType.REFUND]: 'Refund',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction History</span>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transaction ID..."
                className="pl-10"
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <Select
              value={filters.type || 'all'}
              onValueChange={(value) =>
                handleFilterChange('type', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(TransactionType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {getTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                handleFilterChange('status', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.values(PaymentStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.paymentMethod || 'all'}
              onValueChange={(value) =>
                handleFilterChange('paymentMethod', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {Object.values(PaymentMethod).map((method) => (
                  <SelectItem key={method} value={method}>
                    {method.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : data?.transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.transactionId}
                      </TableCell>
                      <TableCell>{getTypeLabel(transaction.type)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(transaction.netAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.paymentMethod.replace('_', ' ')}
                      </TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {(filters.page! - 1) * filters.limit! + 1} to{' '}
                    {Math.min(filters.page! * filters.limit!, data.pagination.total)} of{' '}
                    {data.pagination.total} transactions
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', filters.page! - 1)}
                      disabled={filters.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', filters.page! + 1)}
                      disabled={filters.page === data.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
