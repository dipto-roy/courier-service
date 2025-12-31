'use client';

import { useMutation } from '@tanstack/react-query';
import { trackingService } from '../services';
import type { ShareTrackingData } from '../types';

/**
 * Hook to share tracking link
 */
export function useShareTracking(awb: string) {
  return useMutation({
    mutationFn: (data: ShareTrackingData) =>
      trackingService.shareTracking(awb, data),
    onSuccess: () => {
      // Could show a success toast notification here
    },
  });
}
