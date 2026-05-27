import apiClient from '@/src/common/lib/apiClient';
import type {
  Pickup,
  PickupStatistics,
  PickupsListResponse,
  PickupFilters,
  CreatePickupInput,
  UpdatePickupInput,
  AssignPickupInput,
  CompletePickupInput,
} from '../types';

const ENDPOINTS = {
  BASE: '/pickups',
  STATISTICS: '/pickups/statistics',
  TODAY: '/pickups/today',
  DETAIL: (id: string) => `/pickups/${id}`,
  ASSIGN: (id: string) => `/pickups/${id}/assign`,
  START: (id: string) => `/pickups/${id}/start`,
  COMPLETE: (id: string) => `/pickups/${id}/complete`,
  CANCEL: (id: string) => `/pickups/${id}/cancel`,
} as const;

class PickupService {
  /**
   * Create a new pickup request (Merchant/Admin)
   */
  async createPickup(data: CreatePickupInput): Promise<Pickup> {
    const response = await apiClient.post<Pickup>(ENDPOINTS.BASE, data);
    return response.data;
  }

  /**
   * Get all pickups with filters and pagination
   */
  async getPickups(filters?: PickupFilters): Promise<PickupsListResponse> {
    const response = await apiClient.get<PickupsListResponse>(ENDPOINTS.BASE, {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get pickup statistics
   */
  async getStatistics(): Promise<PickupStatistics> {
    const response = await apiClient.get<PickupStatistics>(ENDPOINTS.STATISTICS);
    return response.data;
  }

  /**
   * Get agent's assigned pickups for today
   */
  async getTodayPickups(): Promise<Pickup[]> {
    const response = await apiClient.get<Pickup[]>(ENDPOINTS.TODAY);
    return response.data;
  }

  /**
   * Get pickup by ID
   */
  async getPickupById(id: string): Promise<Pickup> {
    const response = await apiClient.get<Pickup>(ENDPOINTS.DETAIL(id));
    return response.data;
  }

  /**
   * Update pickup (only pending pickups)
   */
  async updatePickup(id: string, data: UpdatePickupInput): Promise<Pickup> {
    const response = await apiClient.patch<Pickup>(ENDPOINTS.DETAIL(id), data);
    return response.data;
  }

  /**
   * Assign pickup to an agent (Admin/HubStaff)
   */
  async assignPickup(id: string, data: AssignPickupInput): Promise<Pickup> {
    const response = await apiClient.post<Pickup>(ENDPOINTS.ASSIGN(id), data);
    return response.data;
  }

  /**
   * Start pickup (Agent only)
   */
  async startPickup(id: string): Promise<Pickup> {
    const response = await apiClient.post<Pickup>(ENDPOINTS.START(id));
    return response.data;
  }

  /**
   * Complete pickup with shipment scanning (Agent only)
   */
  async completePickup(id: string, data: CompletePickupInput): Promise<Pickup> {
    const response = await apiClient.post<Pickup>(ENDPOINTS.COMPLETE(id), data);
    return response.data;
  }

  /**
   * Cancel pickup (Merchant/Admin)
   */
  async cancelPickup(id: string): Promise<Pickup> {
    const response = await apiClient.post<Pickup>(ENDPOINTS.CANCEL(id));
    return response.data;
  }
}

export const pickupService = new PickupService();
