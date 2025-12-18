import apiClient from '@/src/common/lib/apiClient';
import type { LocationUpdate, FailedDeliveryReason } from '../types';

export const riderService = {
  /**
   * Get rider's assigned manifests
   * Backend: GET /rider/manifests
   */
  async getManifests(status?: string) {
    const response = await apiClient.get('/rider/manifests', {
      params: { status },
    });
    return response.data;
  },

  /**
   * Get rider's assigned shipments  
   * Backend: GET /rider/shipments
   */
  async getShipments(status?: string) {
    const response = await apiClient.get('/rider/shipments', {
      params: { status },
    });
    return response.data;
  },

  /**
   * Get specific shipment details by AWB
   * Backend: GET /rider/shipments/:awb
   */
  async getShipmentByAwb(awb: string) {
    const response = await apiClient.get(`/rider/shipments/${awb}`);
    return response.data;
  },

  /**
   * Generate OTP for shipment delivery
   * Backend: POST /rider/generate-otp
   */
  async generateOTP(awbNumber: string) {
    const response = await apiClient.post('/rider/generate-otp', { awbNumber });
    return response.data;
  },

  /**
   * Complete delivery with OTP verification
   * Backend: POST /rider/complete-delivery
   */
  async completeDelivery(data: {
    awbNumber: string;
    otpCode: string;
    signatureUrl?: string;
    podPhotoUrl?: string;
    codAmountCollected?: number;
    deliveryNote?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const response = await apiClient.post('/rider/complete-delivery', data);
    return response.data;
  },

  /**
   * Record failed delivery attempt
   * Backend: POST /rider/failed-delivery
   */
  async failDelivery(data: {
    awbNumber: string;
    reason: FailedDeliveryReason;
    notes?: string;
    photoUrl?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const response = await apiClient.post('/rider/failed-delivery', data);
    return response.data;
  },

  /**
   * Mark shipment for RTO
   * Backend: POST /rider/mark-rto
   */
  async markRTO(data: {
    awbNumber: string;
    reason: FailedDeliveryReason;
    notes?: string;
  }) {
    const response = await apiClient.post('/rider/mark-rto', data);
    return response.data;
  },

  /**
   * Update rider's GPS location
   * Backend: POST /rider/update-location
   */
  async updateLocation(data: LocationUpdate) {
    const response = await apiClient.post('/rider/update-location', data);
    return response.data;
  },

  /**
   * Get rider location history
   * Backend: GET /rider/location-history
   */
  async getLocationHistory(limit?: number) {
    const response = await apiClient.get('/rider/location-history', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get rider performance statistics
   * Backend: GET /rider/statistics
   */
  async getStatistics() {
    const response = await apiClient.get('/rider/statistics');
    return response.data;
  },

  /**
   * Get a single manifest by ID
   * Backend: GET /rider/manifests/:id
   */
  async getManifestById(manifestId: string | number) {
    const response = await apiClient.get(`/rider/manifests/${manifestId}`);
    return response.data;
  },

  /**
   * Start a manifest
   * Backend: POST /rider/manifests/:id/start
   */
  async startManifest(manifestId: number) {
    const response = await apiClient.post(`/rider/manifests/${manifestId}/start`);
    return response.data;
  },

  /**
   * Complete a manifest
   * Backend: POST /rider/manifests/:id/complete
   */
  async completeManifest(manifestId: number) {
    const response = await apiClient.post(`/rider/manifests/${manifestId}/complete`);
    return response.data;
  },

  /**
   * Collect COD payment
   * Backend: POST /rider/collect-cod
   */
  async collectCOD(data: {
    awbNumber: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
  }) {
    const response = await apiClient.post('/rider/collect-cod', data);
    return response.data;
  },
};
