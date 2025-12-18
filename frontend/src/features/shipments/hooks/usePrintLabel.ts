import { useMutation } from '@tanstack/react-query';
import { shipmentService } from '../services';

export function useDownloadLabel() {
  return useMutation({
    mutationFn: (id: string) => shipmentService.downloadLabel(id),
    onSuccess: (blob, id) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `label-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useDownloadLabels() {
  return useMutation({
    mutationFn: (ids: string[]) => shipmentService.downloadLabels(ids),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `labels-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: (id: string) => shipmentService.downloadInvoice(id),
    onSuccess: (blob, id) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

export function usePrintLabel() {
  return useMutation({
    mutationFn: (id: string) => shipmentService.downloadLabel(id),
    onSuccess: (blob) => {
      // Open in new window for printing
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    },
  });
}
