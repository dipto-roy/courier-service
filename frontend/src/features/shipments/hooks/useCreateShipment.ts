import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { shipmentService } from '../services';
import { queryKeys } from '@/src/common/lib/queryClient';
import type { CreateShipmentRequest } from '@/src/common/types';

export function useCreateShipment() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShipmentRequest) =>
      shipmentService.createShipment(data),
    onSuccess: (shipment) => {
      // Invalidate shipments list
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });

      // Redirect to shipment details
      router.push(`/dashboard/shipments/${shipment.id}`);
    },
  });
}
