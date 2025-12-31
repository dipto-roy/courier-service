import { useMutation } from '@tanstack/react-query';
import { shipmentService } from '../services';
import type { PriceCalculationFormData } from '../types';

export function usePriceCalculator() {
  return useMutation({
    mutationFn: (data: PriceCalculationFormData) =>
      shipmentService.calculatePrice(data),
  });
}
