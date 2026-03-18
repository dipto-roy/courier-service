import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pickupService } from '../services/pickup.service';
import type {
  PickupFilters,
  CreatePickupInput,
  UpdatePickupInput,
  AssignPickupInput,
  CompletePickupInput,
} from '../types';

const pickupKeys = {
  all: ['pickups'] as const,
  lists: () => [...pickupKeys.all, 'list'] as const,
  list: (filters?: PickupFilters) => [...pickupKeys.lists(), filters] as const,
  details: () => [...pickupKeys.all, 'detail'] as const,
  detail: (id: string) => [...pickupKeys.details(), id] as const,
  statistics: () => [...pickupKeys.all, 'statistics'] as const,
  today: () => [...pickupKeys.all, 'today'] as const,
};

// ==================== Query Hooks ====================

export function usePickups(filters?: PickupFilters) {
  return useQuery({
    queryKey: pickupKeys.list(filters),
    queryFn: () => pickupService.getPickups(filters),
    staleTime: 30000,
  });
}

export function usePickup(id: string) {
  return useQuery({
    queryKey: pickupKeys.detail(id),
    queryFn: () => pickupService.getPickupById(id),
    enabled: !!id,
  });
}

export function usePickupStatistics() {
  return useQuery({
    queryKey: pickupKeys.statistics(),
    queryFn: () => pickupService.getStatistics(),
    staleTime: 60000,
  });
}

export function useTodayPickups() {
  return useQuery({
    queryKey: pickupKeys.today(),
    queryFn: () => pickupService.getTodayPickups(),
    staleTime: 30000,
  });
}

// ==================== Mutation Hooks ====================

export function useCreatePickup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePickupInput) => pickupService.createPickup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pickupKeys.all });
    },
  });
}

export function useUpdatePickup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePickupInput }) =>
      pickupService.updatePickup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pickupKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: pickupKeys.lists() });
    },
  });
}

export function useAssignPickup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignPickupInput }) =>
      pickupService.assignPickup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pickupKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: pickupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pickupKeys.statistics() });
    },
  });
}

export function useStartPickup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pickupService.startPickup(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: pickupKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: pickupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pickupKeys.today() });
    },
  });
}

export function useCompletePickup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompletePickupInput }) =>
      pickupService.completePickup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pickupKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: pickupKeys.all });
    },
  });
}

export function useCancelPickup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pickupService.cancelPickup(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: pickupKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: pickupKeys.all });
    },
  });
}
