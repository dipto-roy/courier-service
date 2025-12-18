'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { riderService } from '../services';
import { queryKeys } from '@/src/common/lib/queryClient';
import type { CompleteDelivery, FailedDelivery, FailedDeliveryReason } from '../types';

/**
 * Hook to generate OTP for delivery
 * Backend: POST /rider/generate-otp
 */
export function useGenerateOTP() {
  return useMutation({
    mutationFn: (awbNumber: string) => riderService.generateOTP(awbNumber),
  });
}

/**
 * Hook to complete delivery with OTP verification
 * Backend: POST /rider/complete-delivery
 */
export function useCompleteDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompleteDelivery) => riderService.completeDelivery(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.shipments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.manifests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.statistics() });
    },
  });
}

/**
 * Hook to record failed delivery attempt
 * Backend: POST /rider/failed-delivery
 */
export function useFailDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FailedDelivery) => riderService.failDelivery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.shipments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.manifests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.statistics() });
    },
  });
}

/**
 * Hook to mark shipment for RTO
 * Backend: POST /rider/mark-rto
 */
export function useMarkRTO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { awbNumber: string; reason: FailedDeliveryReason; notes?: string }) =>
      riderService.markRTO(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.shipments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.manifests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.statistics() });
    },
  });
}
