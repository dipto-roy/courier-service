import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentService } from '../services';
import { queryKeys } from '@/src/common/lib/queryClient';
import type { CreateShipmentRequest } from '@/src/common/types';

export function useUpdateShipment(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateShipmentRequest>) =>
      shipmentService.updateShipment(id, data),
    onSuccess: (updatedShipment) => {
      // Update shipment detail cache
      queryClient.setQueryData(
        queryKeys.shipments.detail(id),
        updatedShipment,
      );

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
    },
  });
}

export function useCancelShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      shipmentService.cancelShipment(id, reason),
    onSuccess: (_, variables) => {
      // Invalidate detail and lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.shipments.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
    },
  });
}

export function useDeleteShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shipmentService.deleteShipment(id),
    onSuccess: () => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
    },
  });
}
