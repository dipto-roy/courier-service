import { useQuery } from '@tanstack/react-query';
import { shipmentService } from '../services';
import { queryKeys } from '@/src/common/lib/queryClient';
import type { ShipmentFilters } from '@/src/common/types';

export function useShipments(filters?: ShipmentFilters) {
  return useQuery({
    queryKey: queryKeys.shipments.list(filters),
    queryFn: () => shipmentService.getShipments(filters),
    staleTime: 30000, // 30 seconds
  });
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: queryKeys.shipments.detail(id),
    queryFn: () => shipmentService.getShipmentById(id),
    enabled: !!id,
  });
}

export function useShipmentByAwb(awb: string) {
  return useQuery({
    queryKey: queryKeys.shipments.byAwb(awb),
    queryFn: () => shipmentService.getShipmentByAwb(awb),
    enabled: !!awb,
  });
}
