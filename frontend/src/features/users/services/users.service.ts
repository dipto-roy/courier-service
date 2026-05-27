import apiClient from '@/src/common/lib/apiClient';
import type {
  UserProfile,
  UserStatistics,
  UsersListResponse,
  UserFilters,
  CreateUserInput,
  UpdateUserInput,
  KYCVerificationInput,
  WalletUpdateInput,
} from '../types';

const ENDPOINTS = {
  BASE: '/users',
  STATISTICS: '/users/statistics',
  BY_ROLE: (role: string) => `/users/by-role/${role}`,
  ME: '/users/me',
  DETAIL: (id: string) => `/users/${id}`,
  KYC: (id: string) => `/users/${id}/kyc`,
  WALLET: (id: string) => `/users/${id}/wallet`,
  RESTORE: (id: string) => `/users/${id}/restore`,
} as const;

class UsersService {
  /**
   * Create a new user (Admin only)
   */
  async createUser(data: CreateUserInput): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>(ENDPOINTS.BASE, data);
    return response.data;
  }

  /**
   * Get all users with filters and pagination
   */
  async getUsers(filters?: UserFilters): Promise<UsersListResponse> {
    const response = await apiClient.get<UsersListResponse>(ENDPOINTS.BASE, {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get user statistics (Admin only)
   */
  async getStatistics(): Promise<UserStatistics> {
    const response = await apiClient.get<UserStatistics>(ENDPOINTS.STATISTICS);
    return response.data;
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<UsersListResponse> {
    const response = await apiClient.get<UsersListResponse>(ENDPOINTS.BY_ROLE(role));
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(ENDPOINTS.ME);
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(ENDPOINTS.DETAIL(id));
    return response.data;
  }

  /**
   * Update user information
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>(ENDPOINTS.DETAIL(id), data);
    return response.data;
  }

  /**
   * Update KYC verification status (Admin/Finance only)
   */
  async updateKYC(id: string, data: KYCVerificationInput): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>(ENDPOINTS.KYC(id), data);
    return response.data;
  }

  /**
   * Update user wallet balance (Admin/Finance only)
   */
  async updateWallet(id: string, data: WalletUpdateInput): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>(ENDPOINTS.WALLET(id), data);
    return response.data;
  }

  /**
   * Delete user (soft delete, Admin only)
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.DETAIL(id));
  }

  /**
   * Restore soft-deleted user (Admin only)
   */
  async restoreUser(id: string): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>(ENDPOINTS.RESTORE(id));
    return response.data;
  }
}

export const usersService = new UsersService();
