import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../payment.service';
import { queryKeys } from '../../../common/lib/queryClient';
import { InitiatePayout } from '../types';

/**
 * Hook for recording COD collection
 */
export function useRecordCOD() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shipmentId: string) => paymentService.recordCodCollection(shipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.transactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.overallStats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.merchantStats() });
    },
  });
}

/**
 * Hook for recording delivery fee
 */
export function useRecordDeliveryFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shipmentId: string) => paymentService.recordDeliveryFee(shipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.transactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.overallStats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.merchantStats() });
    },
  });
}

/**
 * Hook for initiating payout to merchant
 */
export function useInitiatePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InitiatePayout) => paymentService.initiatePayout(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.transactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.overallStats() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.merchantStats(variables.merchantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.pendingBalance(variables.merchantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.pendingCollections(variables.merchantId),
      });
    },
  });
}

/**
 * Hook for completing a payout
 */
export function useCompletePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      referenceNumber,
    }: {
      transactionId: string;
      referenceNumber?: string;
    }) => paymentService.completePayout(transactionId, referenceNumber),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.transaction(variables.transactionId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.transactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.overallStats() });
    },
  });
}

/**
 * Hook for failing a payout
 */
export function useFailPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason: string }) =>
      paymentService.failPayout(transactionId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.transaction(variables.transactionId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.transactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.overallStats() });
    },
  });
}
