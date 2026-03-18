import apiClient from '@/src/common/lib/apiClient';
import type { SLAStatistics, ShipmentSLAStatus, SLAQueueStatus } from './types';

const ENDPOINTS = {
  STATISTICS: '/sla/statistics',
  SHIPMENT: (shipmentId: string) => `/sla/shipment/${shipmentId}`,
  QUEUE_STATUS: '/sla/queue/status',
} as const;

class SLAService {
  /**
   * Get SLA violation statistics
   */
  async getStatistics(): Promise<SLAStatistics> {
    const response = await apiClient.get<{ success: boolean; data: SLAStatistics }>(
      ENDPOINTS.STATISTICS,
    );
    return response.data.data;
  }

  /**
   * Check SLA status for a specific shipment
   */
  async checkShipmentSLA(shipmentId: string): Promise<ShipmentSLAStatus> {
    const response = await apiClient.get<{ success: boolean; data: ShipmentSLAStatus }>(
      ENDPOINTS.SHIPMENT(shipmentId),
    );
    return response.data.data;
  }

  /**
   * Get SLA queue status (Admin only)
   */
  async getQueueStatus(): Promise<SLAQueueStatus> {
    const response = await apiClient.get<{ success: boolean; data: SLAQueueStatus }>(
      ENDPOINTS.QUEUE_STATUS,
    );
    return response.data.data;
  }
}

export const slaService = new SLAService();
