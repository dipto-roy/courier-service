import { useQuery } from '@tanstack/react-query';
import { hubService } from '../hub.service';
import { queryKeys } from '../../../common/lib/queryClient';
import { ManifestFilters } from '../types';

/**
 * Hook to fetch manifests with optional filters
 */
export function useManifests(filters?: ManifestFilters) {
  return useQuery({
    queryKey: queryKeys.hub.manifests(filters),
    queryFn: () => hubService.getManifests(filters),
  });
}

/**
 * Hook to fetch manifest details by ID
 */
export function useManifest(id: string) {
  return useQuery({
    queryKey: queryKeys.hub.manifest(id),
    queryFn: () => hubService.getManifestById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch manifest statistics
 * @param hubLocation - Optional filter by hub location
 * @param refetchInterval - Auto-refresh interval in ms (default: 5 minutes)
 */
export function useManifestStats(
  hubLocation?: string,
  refetchInterval: number = 5 * 60 * 1000, // 5 minutes
) {
  return useQuery({
    queryKey: queryKeys.hub.statistics(hubLocation),
    queryFn: () => hubService.getManifestStatistics(hubLocation),
    refetchInterval,
  });
}
