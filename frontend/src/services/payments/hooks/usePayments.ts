import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../payment.service';
import { queryKeys } from '../../../common/lib/queryClient';
import { PaymentFilter } from '../types';

/**
 * Hook to fetch transactions with filters
 */
export function useTransactions(filters?: PaymentFilter) {
  return useQuery({
    queryKey: queryKeys.payments.transactions(filters),
    queryFn: () => paymentService.getTransactions(filters),
  });
}

/**
 * Hook to fetch transaction by ID
 */
export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: queryKeys.payments.transaction(transactionId),
    queryFn: () => paymentService.getTransaction(transactionId),
    enabled: !!transactionId,
  });
}

/**
 * Hook to fetch pending COD collections for merchant
 */
export function usePendingCollections(merchantId: string) {
  return useQuery({
    queryKey: queryKeys.payments.pendingCollections(merchantId),
    queryFn: () => paymentService.getPendingCollections(merchantId),
    enabled: !!merchantId,
  });
}

/**
 * Hook to fetch pending balance for merchant
 */
export function usePendingBalance(merchantId: string) {
  return useQuery({
    queryKey: queryKeys.payments.pendingBalance(merchantId),
    queryFn: () => paymentService.getPendingBalance(merchantId),
    enabled: !!merchantId,
  });
}

/**
 * Hook to fetch merchant payment statistics
 */
export function useMerchantStatistics(merchantId: string) {
  return useQuery({
    queryKey: queryKeys.payments.merchantStats(merchantId),
    queryFn: () => paymentService.getMerchantStatistics(merchantId),
    enabled: !!merchantId,
  });
}

/**
 * Hook to fetch overall payment statistics (Admin only)
 * @param refetchInterval - Auto-refresh interval in ms (default: 5 minutes)
 */
export function useOverallStatistics(refetchInterval: number = 5 * 60 * 1000) {
  return useQuery({
    queryKey: queryKeys.payments.overallStats(),
    queryFn: () => paymentService.getOverallStatistics(),
    refetchInterval,
  });
}
