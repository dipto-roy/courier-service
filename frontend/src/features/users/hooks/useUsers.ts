import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/common/lib/queryClient';
import { usersService } from '../services/users.service';
import type {
  UserFilters,
  CreateUserInput,
  UpdateUserInput,
  KYCVerificationInput,
  WalletUpdateInput,
} from '../types';

// ==================== Query Hooks ====================

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters ?? {}),
    queryFn: () => usersService.getUsers(filters),
    staleTime: 30000,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersService.getUserById(id),
    enabled: !!id,
  });
}

export function useUsersByRole(role: string) {
  return useQuery({
    queryKey: [...queryKeys.users.all, 'by-role', role] as const,
    queryFn: () => usersService.getUsersByRole(role),
    enabled: !!role,
  });
}

export function useUserStatistics() {
  return useQuery({
    queryKey: [...queryKeys.users.all, 'statistics'] as const,
    queryFn: () => usersService.getStatistics(),
    staleTime: 60000,
  });
}

export function useCurrentUserProfile() {
  return useQuery({
    queryKey: [...queryKeys.users.all, 'me'] as const,
    queryFn: () => usersService.getCurrentUser(),
  });
}

// ==================== Mutation Hooks ====================

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => usersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      usersService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

export function useUpdateKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: KYCVerificationInput }) =>
      usersService.updateKYC(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WalletUpdateInput }) =>
      usersService.updateWallet(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
