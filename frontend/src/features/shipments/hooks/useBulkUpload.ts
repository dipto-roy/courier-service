import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentService } from '../services';
import { queryKeys } from '@/src/common/lib/queryClient';
import type { BulkShipmentRequest } from '@/src/common/types';

export function useBulkUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkShipmentRequest) =>
      shipmentService.bulkCreateShipments(data),
    onSuccess: () => {
      // Invalidate shipments list
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
    },
  });
}

export function useDownloadTemplate() {
  return useMutation({
    mutationFn: () => shipmentService.downloadTemplate(),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'shipment-template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useExportShipments() {
  return useMutation({
    mutationFn: (filters?: Record<string, unknown>) => shipmentService.exportShipments(filters),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shipments-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}
