import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../analytics.service';
import type { AnalyticsFilters } from '../types';

/**
 * Hook to fetch complete analytics dashboard
 */
export function useAnalyticsDashboard(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', filters],
    queryFn: () => analyticsService.getDashboard(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch shipment statistics
 */
export function useShipmentStatistics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'shipments', filters],
    queryFn: () => analyticsService.getShipmentStatistics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch revenue statistics
 */
export function useRevenueStatistics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'revenue', filters],
    queryFn: () => analyticsService.getRevenueStatistics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch merchant-specific revenue
 */
export function useMerchantRevenue(merchantId: string, enabled = true) {
  return useQuery({
    queryKey: ['analytics', 'revenue', 'merchant', merchantId],
    queryFn: () => analyticsService.getMerchantRevenue(merchantId),
    enabled: enabled && !!merchantId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch performance metrics
 */
export function usePerformanceMetrics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'performance', filters],
    queryFn: () => analyticsService.getPerformanceMetrics(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch COD statistics
 */
export function useCODStatistics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'cod', filters],
    queryFn: () => analyticsService.getCODStatistics(filters),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch shipment trends for charts
 */
export function useShipmentTrends(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'shipments', 'trends', filters],
    queryFn: () => analyticsService.getShipmentTrends(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch revenue trends for charts
 */
export function useRevenueTrends(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'revenue', 'trends', filters],
    queryFn: () => analyticsService.getRevenueTrends(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch top performing riders
 */
export function useTopRiders(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'top-riders', filters],
    queryFn: () => analyticsService.getTopRiders(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch hub statistics
 */
export function useHubStatistics(hubLocation?: string) {
  return useQuery({
    queryKey: ['analytics', 'hub', hubLocation],
    queryFn: () => analyticsService.getHubStatistics(hubLocation),
    staleTime: 5 * 60 * 1000,
  });
}
