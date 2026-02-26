import { z } from 'zod';

// Location coordinates schema
export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  timestamp: z.string(),
});

// Tracking event schema (matches backend timeline format)
export const trackingEventSchema = z.object({
  id: z.number(),
  status: z.string(),
  description: z.string(),
  location: z.string().optional(),
  timestamp: z.string(),
  hubName: z.string().optional(),
  riderName: z.string().optional(),
});

// Rider info schema
export const riderInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string(),
  rating: z.number().min(0).max(5).optional(),
  vehicleType: z.string().optional(),
  vehicleNumber: z.string().optional(),
});

// Share tracking schema
export const shareTrackingSchema = z.object({
  method: z.enum(['email', 'sms']),
  recipient: z.string().min(1, 'Recipient is required'),
});

// Type exports
export type LocationData = z.infer<typeof locationSchema>;
export type TrackingEvent = z.infer<typeof trackingEventSchema>;
export type RiderInfo = z.infer<typeof riderInfoSchema>;
export type ShareTrackingData = z.infer<typeof shareTrackingSchema>;

// Additional type definitions for complex structures
export interface TrackingTimeline {
  events: TrackingEvent[];
  currentStatus: string;
  currentStatusDescription: string;
}

export interface ETAInfo {
  eta: string;
  estimatedDeliveryTime: string;
  distance: number;
  remainingStops: number;
}

export interface TrackingMapData {
  currentLocation: LocationData | null;
  deliveryLocation: LocationData;
  route: LocationData[];
  rider: RiderInfo | null;
}

// TrackingInfo interface matching backend response
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

// Location update type
export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

// Tracking history response
export interface TrackingHistoryResponse {
  events: TrackingEvent[];
  currentStatus: string;
}
