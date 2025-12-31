import { useMutation } from '@tanstack/react-query';
import { analyticsService } from '../analytics.service';
import type { ExportOptions } from '../types';

/**
 * Hook to export analytics report
 */
export function useExportReport() {
  return useMutation({
    mutationFn: (options: ExportOptions) =>
      analyticsService.exportReport(options),
    onSuccess: () => {
      // Optionally invalidate any queries if needed
    },
  });
}

/**
 * Hook to download report file
 */
export function useDownloadReport() {
  return useMutation({
    mutationFn: (url: string) => analyticsService.downloadReport(url),
    onSuccess: (blob, url) => {
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = url.split('/').pop() || 'report';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    },
  });
}
