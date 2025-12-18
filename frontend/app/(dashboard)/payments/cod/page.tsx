'use client';

import { useState } from 'react';
import { CODDashboard } from '@/src/features/payments/components';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CODPage() {
  const { user } = useAuth();
  const [selectedMerchant, setSelectedMerchant] = useState(user?.id || '');

  // TODO: Fetch merchants list for admin view
  const isAdmin = user?.role === 'admin' || user?.role === 'finance';

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">COD Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Track cash on delivery collections and payouts
            </p>
          </div>

          {isAdmin && (
            <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Merchant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={user?.id || ''}>Current User</SelectItem>
                {/* TODO: Add merchant list */}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <CODDashboard merchantId={selectedMerchant} />
    </div>
  );
}
