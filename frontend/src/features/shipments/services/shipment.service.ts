import apiClient from '@/src/common/lib/apiClient';
import type {
  Shipment,
  CreateShipmentRequest,
  BulkShipmentRequest,
  ShipmentFilters,
  PaginatedResponse,
} from '@/src/common/types';

export const shipmentService = {
  /**
   * Create a single shipment
   */
  async createShipment(data: CreateShipmentRequest): Promise<Shipment> {
    const response = await apiClient.post<Shipment>('/shipments', data);
    return response.data;
  },

  /**
   * Get paginated list of shipments with optional filters
   */
  async getShipments(
    filters?: ShipmentFilters,
  ): Promise<PaginatedResponse<Shipment>> {
    const response = await apiClient.get<PaginatedResponse<Shipment>>(
      '/shipments',
      {
        params: filters,
      },
    );
    return response.data;
  },

  /**
   * Get shipment by ID
   */
  async getShipmentById(id: string): Promise<Shipment> {
    const response = await apiClient.get<Shipment>(`/shipments/${id}`);
    return response.data;
  },

  /**
   * Get shipment by AWB number
   */
  async getShipmentByAwb(awb: string): Promise<Shipment> {
    const response = await apiClient.get<Shipment>(`/shipments/awb/${awb}`);
    return response.data;
  },

  /**
   * Update shipment details (before pickup)
   */
  async updateShipment(
    id: string,
    data: Partial<CreateShipmentRequest>,
  ): Promise<Shipment> {
    const response = await apiClient.patch<Shipment>(`/shipments/${id}`, data);
    return response.data;
  },

  /**
   * Cancel shipment
   */
  async cancelShipment(id: string, reason: string): Promise<Shipment> {
    const response = await apiClient.post<Shipment>(
      `/shipments/${id}/cancel`,
      { reason },
    );
    return response.data;
  },

  /**
   * Delete shipment (soft delete)
   */
  async deleteShipment(id: string): Promise<void> {
    await apiClient.delete(`/shipments/${id}`);
  },

  /**
   * Bulk create shipments from CSV
   */
  async bulkCreateShipments(data: BulkShipmentRequest): Promise<{
    success: Shipment[];
    failed: Array<{ row: number; error: string; data: BulkShipmentRequest[number] }>;
  }> {
    const response = await apiClient.post<{
      success: Shipment[];
      failed: Array<{ row: number; error: string; data: BulkShipmentRequest[number] }>;
    }>('/shipments/bulk', data);
    return response.data;
  },

  /**
   * Calculate shipment price
   */
  async calculatePrice(data: {
    pickupHubId: string;
    deliveryHubId: string;
    weight: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    serviceType?: 'STANDARD' | 'EXPRESS' | 'SAME_DAY';
  }): Promise<{
    basePrice: number;
    weightCharge: number;
    dimensionCharge: number;
    serviceCharge: number;
    totalPrice: number;
  }> {
    const response = await apiClient.post<{
      basePrice: number;
      weightCharge: number;
      dimensionCharge: number;
      serviceCharge: number;
      totalPrice: number;
    }>('/shipments/calculate-price', data);
    return response.data;
  },

  /**
   * Download shipment label
   */
  async downloadLabel(id: string): Promise<Blob> {
    const response = await apiClient.get(`/shipments/${id}/label`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Download multiple labels
   */
  async downloadLabels(ids: string[]): Promise<Blob> {
    const response = await apiClient.post(
      '/shipments/labels/bulk',
      { shipmentIds: ids },
      {
        responseType: 'blob',
      },
    );
    return response.data;
  },

  /**
   * Download shipment invoice
   */
  async downloadInvoice(id: string): Promise<Blob> {
    const response = await apiClient.get(`/shipments/${id}/invoice`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Download CSV template for bulk upload
   */
  async downloadTemplate(): Promise<Blob> {
    const response = await apiClient.get('/shipments/template', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Export shipments to CSV
   */
  async exportShipments(filters?: ShipmentFilters): Promise<Blob> {
    const response = await apiClient.get('/shipments/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get shipment statistics
   * Backend: GET /shipments/statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byDeliveryType: Record<string, number>;
    totalRevenue: number;
    totalCOD: number;
  }> {
    const response = await apiClient.get('/shipments/statistics');
    return response.data;
  },
};
