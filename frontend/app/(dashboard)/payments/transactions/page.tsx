'use client';

import { TransactionHistory } from '@/src/features/payments/components';

export default function TransactionsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-gray-600 mt-2">
          View and manage all payment transactions
        </p>
      </div>

      <TransactionHistory />
    </div>
  );
}
