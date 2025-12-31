import apiClient from '@/src/common/lib/apiClient';
import type {
  TrackingInfo,
  LocationUpdate,
  TrackingHistoryResponse,
} from '@/src/common/types';

export const trackingService = {
  /**
   * Get shipment tracking information by AWB number
   */
  async getShipmentTracking(awb: string): Promise<TrackingInfo> {
    const response = await apiClient.get<TrackingInfo>(`/tracking/${awb}`);
    return response.data;
  },

  /**
   * Get location updates for a shipment
   */
  async getLocationUpdates(awb: string): Promise<LocationUpdate[]> {
    const response = await apiClient.get<LocationUpdate[]>(
      `/tracking/${awb}/locations`
    );
    return response.data;
  },

  /**
   * Get tracking history (status changes timeline)
   */
  async getTrackingHistory(awb: string): Promise<TrackingHistoryResponse> {
    const response = await apiClient.get<TrackingHistoryResponse>(
      `/tracking/${awb}/history`
    );
    return response.data;
  },

  /**
   * Share tracking link via email/SMS
   */
  async shareTracking(
    awb: string,
    data: { method: 'email' | 'sms'; recipient: string }
  ): Promise<void> {
    await apiClient.post(`/tracking/${awb}/share`, data);
  },

  /**
   * Get estimated time of arrival
   */
  async getETA(awb: string): Promise<{ eta: string; distance: number }> {
    const response = await apiClient.get<{ eta: string; distance: number }>(
      `/tracking/${awb}/eta`
    );
    return response.data;
  },
};
