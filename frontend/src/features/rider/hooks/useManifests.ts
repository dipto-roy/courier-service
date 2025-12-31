'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riderService } from '../services';
import { queryKeys } from '@/src/common/lib/queryClient';

/**
 * Hook to fetch rider's assigned manifests
 * Backend: GET /rider/manifests
 */
export function useManifests(status?: string) {
  return useQuery({
    queryKey: queryKeys.rider.manifests(status),
    queryFn: () => riderService.getManifests(status),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch rider's assigned shipments
 * Backend: GET /rider/shipments
 */
export function useShipments(status?: string) {
  return useQuery({
    queryKey: queryKeys.rider.shipments(status),
    queryFn: () => riderService.getShipments(status),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch specific shipment details by AWB
 * Backend: GET /rider/shipments/:awb
 */
export function useShipment(awb: string | null) {
  return useQuery({
    queryKey: queryKeys.rider.shipment(awb!),
    queryFn: () => riderService.getShipmentByAwb(awb!),
    enabled: awb !== null && awb.length > 0,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

/**
 * Hook to fetch rider's performance statistics
 * Backend: GET /rider/statistics
 */
export function useRiderStats() {
  return useQuery({
    queryKey: queryKeys.rider.statistics(),
    queryFn: () => riderService.getStatistics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

/**
 * Hook to fetch rider location history
 * Backend: GET /rider/location-history
 */
export function useLocationHistory(limit?: number) {
  return useQuery({
    queryKey: queryKeys.rider.locationHistory(limit),
    queryFn: () => riderService.getLocationHistory(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single manifest by ID
 * Backend: GET /rider/manifests/:id
 */
export function useManifest(manifestId: string | number | null) {
  return useQuery({
    queryKey: queryKeys.rider.manifest(manifestId!),
    queryFn: () => riderService.getManifestById(manifestId!),
    enabled: manifestId !== null,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to start a manifest
 * Backend: POST /rider/manifests/:id/start
 */
export function useStartManifest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (manifestId: number) => riderService.startManifest(manifestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.manifests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.statistics() });
    },
  });
}

/**
 * Hook to complete a manifest
 * Backend: POST /rider/manifests/:id/complete
 */
export function useCompleteManifest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (manifestId: number) => riderService.completeManifest(manifestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.manifests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.statistics() });
    },
  });
}

/**
 * Hook to collect COD payment
 * Backend: POST /rider/collect-cod
 */
export function useCollectCOD() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { awbNumber: string; amount: number; paymentMethod: string; notes?: string }) =>
      riderService.collectCOD(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.shipments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rider.statistics() });
    },
  });
}
