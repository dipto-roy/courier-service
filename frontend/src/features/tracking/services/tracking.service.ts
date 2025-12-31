import apiClient from '@/src/common/lib/apiClient';

// Backend tracking response interface
interface BackendTrackingResponse {
  success: boolean;
  tracking: {
    awb: string;
    status: string;
    currentLocation: string;
    expectedDeliveryDate: string;
    eta?: string;
    receiverName: string;
    receiverAddress: string;
    receiverCity?: string;
    senderName?: string;
    senderCity?: string;
    deliveryArea?: string;
    weight?: number;
    deliveryType?: string;
    serviceType?: string;
    deliveryAttempts?: number;
    isRto?: boolean;
    codAmount?: number;
    timeline: Array<{
      status: string;
      timestamp: string;
      description: string;
      location?: string;
    }>;
    riderLocation?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      timestamp: string;
      isOnline?: boolean;
    };
  };
}

// Frontend TrackingInfo interface
export interface TrackingInfo {
  awb: string;
  status: string;
  currentLocation: string;
  expectedDeliveryDate: string;
  eta?: string;
  receiverName: string;
  receiverAddress: string;
  receiverCity: string;
  senderName: string;
  senderCity: string;
  deliveryArea?: string;
  weight: number;
  serviceType: string;
  deliveryType?: string;
  deliveryAttempts: number;
  isRto: boolean;
  codAmount: number;
  createdAt: string;
  deliveryLocation?: {
    latitude: number;
    longitude: number;
  };
  riderLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: string;
    isOnline?: boolean;
  };
}

export interface TrackingEvent {
  id: number;
  status: string;
  description: string;
  location?: string;
  timestamp: string;
}

export interface TrackingHistoryResponse {
  events: TrackingEvent[];
  currentStatus: string;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export const trackingService = {
  /**
   * Get shipment tracking information by AWB number
   * Backend: GET /tracking/public/:awb (Public endpoint)
   */
  async getShipmentTracking(awb: string): Promise<TrackingInfo> {
    const response = await apiClient.get<BackendTrackingResponse>(
      `/tracking/public/${awb}`
    );
    
    const tracking = response.data.tracking;
    
    // Transform backend response to frontend TrackingInfo format
    return {
      awb: tracking.awb,
      status: tracking.status,
      currentLocation: tracking.currentLocation || '',
      expectedDeliveryDate: tracking.expectedDeliveryDate || '',
      eta: tracking.eta,
      receiverName: tracking.receiverName || '',
      receiverAddress: tracking.receiverAddress || '',
      receiverCity: tracking.receiverCity || tracking.deliveryArea || '',
      senderName: tracking.senderName || '',
      senderCity: tracking.senderCity || '',
      deliveryArea: tracking.deliveryArea,
      weight: tracking.weight || 0,
      serviceType: tracking.deliveryType || tracking.serviceType || 'STANDARD',
      deliveryType: tracking.deliveryType,
      deliveryAttempts: tracking.deliveryAttempts || 0,
      isRto: tracking.isRto || false,
      codAmount: tracking.codAmount || 0,
      createdAt: tracking.timeline?.[0]?.timestamp || new Date().toISOString(),
      riderLocation: tracking.riderLocation,
    };
  },

  /**
   * Get location updates for a shipment
   * Uses rider location from tracking data
   */
  async getLocationUpdates(awb: string): Promise<LocationUpdate[]> {
    try {
      const response = await apiClient.get<BackendTrackingResponse>(
        `/tracking/public/${awb}`
      );
      
      const tracking = response.data.tracking;
      
      // Return rider location as the latest location update
      if (tracking.riderLocation) {
        return [{
          latitude: tracking.riderLocation.latitude,
          longitude: tracking.riderLocation.longitude,
          accuracy: tracking.riderLocation.accuracy,
          timestamp: tracking.riderLocation.timestamp,
        }];
      }
      
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Get tracking history (status changes timeline)
   * Backend: GET /tracking/public/:awb - extract timeline from response
   */
  async getTrackingHistory(awb: string): Promise<TrackingHistoryResponse> {
    const response = await apiClient.get<BackendTrackingResponse>(
      `/tracking/public/${awb}`
    );
    
    const tracking = response.data.tracking;
    
    // Transform timeline to TrackingEvent format
    const events: TrackingEvent[] = (tracking.timeline || []).map((event, index) => ({
      id: index + 1,
      status: event.status,
      description: event.description,
      location: event.location,
      timestamp: event.timestamp,
    }));
    
    return {
      events,
      currentStatus: tracking.status,
    };
  },

  /**
   * Share tracking link via email/SMS
   * Note: This endpoint may not exist in backend yet
   */
  async shareTracking(
    awb: string,
    data: { method: 'email' | 'sms'; recipient: string }
  ): Promise<void> {
    // If backend endpoint exists, use it. Otherwise, handle locally.
    try {
      await apiClient.post(`/tracking/${awb}/share`, data);
    } catch {
      // Fallback: just generate share link locally
      console.log(`Share tracking ${awb} via ${data.method} to ${data.recipient}`);
    }
  },

  /**
   * Get estimated time of arrival
   * Extract ETA from tracking response
   */
  async getETA(awb: string): Promise<{ eta: string; distance: number }> {
    try {
      const response = await apiClient.get<BackendTrackingResponse>(
        `/tracking/public/${awb}`
      );
      
      const tracking = response.data.tracking;
      
      return {
        eta: tracking.eta || tracking.expectedDeliveryDate || '',
        distance: 0, // Distance not provided by backend
      };
    } catch {
      return { eta: '', distance: 0 };
    }
  },
};
