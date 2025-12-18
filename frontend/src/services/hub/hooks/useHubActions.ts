import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hubService } from '../hub.service';
import { queryKeys } from '../../../common/lib/queryClient';
import {
  InboundScan,
  OutboundScan,
  SortShipments,
  CreateManifest,
  ReceiveManifest,
} from '../types';

/**
 * Hook for inbound scanning (shipments arriving at hub)
 */
export function useInboundScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InboundScan) => hubService.inboundScan(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.manifests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.statistics() });
    },
  });
}

/**
 * Hook for outbound scanning (shipments leaving hub)
 */
export function useOutboundScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OutboundScan) => hubService.outboundScan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.manifests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.statistics() });
    },
  });
}

/**
 * Hook for sorting shipments by destination
 */
export function useSortShipments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SortShipments) => hubService.sortShipments(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.manifests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.statistics() });
    },
  });
}

/**
 * Hook for creating manifest
 */
export function useCreateManifest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateManifest) => hubService.createManifest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.manifests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.statistics() });
    },
  });
}

/**
 * Hook for receiving manifest at destination hub
 */
export function useReceiveManifest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReceiveManifest }) =>
      hubService.receiveManifest(id, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific manifest
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.manifest(variables.id) });
      // Invalidate manifest list and statistics
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.manifests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.statistics() });
    },
  });
}
