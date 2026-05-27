import { useQuery } from '@tanstack/react-query';
import { slaService } from '../sla.service';

const slaKeys = {
  all: ['sla'] as const,
  statistics: () => [...slaKeys.all, 'statistics'] as const,
  shipment: (shipmentId: string) => [...slaKeys.all, 'shipment', shipmentId] as const,
  queueStatus: () => [...slaKeys.all, 'queue-status'] as const,
};

/**
 * Get SLA violation statistics
 */
export function useSLAStatistics() {
  return useQuery({
    queryKey: slaKeys.statistics(),
    queryFn: () => slaService.getStatistics(),
    staleTime: 60000,
    refetchInterval: 5 * 60 * 1000,
  });
}

/**
 * Check SLA status for a specific shipment
 */
export function useShipmentSLA(shipmentId: string) {
  return useQuery({
    queryKey: slaKeys.shipment(shipmentId),
    queryFn: () => slaService.checkShipmentSLA(shipmentId),
    enabled: !!shipmentId,
  });
}

/**
 * Get SLA queue status (Admin only)
 */
export function useSLAQueueStatus() {
  return useQuery({
    queryKey: slaKeys.queueStatus(),
    queryFn: () => slaService.getQueueStatus(),
    staleTime: 30000,
  });
}
