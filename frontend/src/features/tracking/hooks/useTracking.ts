'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/src/common/lib/queryClient';
import { trackingService } from '../services';

/**
 * Hook to fetch shipment tracking information
 */
export function useTracking(awb: string) {
  return useQuery({
    queryKey: queryKeys.tracking.detail(awb),
    queryFn: () => trackingService.getShipmentTracking(awb),
    enabled: !!awb,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });
}

/**
 * Hook to fetch tracking history
 */
export function useTrackingHistory(awb: string) {
  return useQuery({
    queryKey: queryKeys.tracking.history(awb),
    queryFn: () => trackingService.getTrackingHistory(awb),
    enabled: !!awb,
  });
}

/**
 * Hook to fetch location updates
 */
export function useLocationUpdates(awb: string) {
  return useQuery({
    queryKey: queryKeys.tracking.locations(awb),
    queryFn: () => trackingService.getLocationUpdates(awb),
    enabled: !!awb,
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
  });
}

/**
 * Hook to fetch ETA
 */
export function useETA(awb: string) {
  return useQuery({
    queryKey: queryKeys.tracking.eta(awb),
    queryFn: () => trackingService.getETA(awb),
    enabled: !!awb,
    refetchInterval: 60000, // Refetch every minute
  });
}
