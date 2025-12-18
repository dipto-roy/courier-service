'use client';

import { redirect } from 'next/navigation';

export default function PaymentsPage() {
  // Redirect to transactions page as the main payments view
  redirect('/payments/transactions');
}
