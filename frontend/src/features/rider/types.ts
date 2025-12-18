import { z } from 'zod';

// ==================== SCHEMAS ====================

// Location update schema (matches backend UpdateLocationDto)
export const locationUpdateSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  shipmentAwb: z.string().optional(),
  isOnline: z.boolean().optional(),
});

// Generate OTP schema (matches backend GenerateOTPDto)
export const generateOTPSchema = z.object({
  awbNumber: z.string().min(1, 'AWB number is required'),
});

// Complete delivery schema (matches backend DeliveryAttemptDto)
export const completeDeliverySchema = z.object({
  awbNumber: z.string().min(1, 'AWB number is required'),
  otpCode: z.string().length(6, 'OTP must be 6 digits'),
  signatureUrl: z.string().optional(),
  podPhotoUrl: z.string().optional(),
  codAmountCollected: z.number().min(0).optional(),
  deliveryNote: z.string().max(500).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Failed delivery reasons (matches backend enum)
export enum FailedDeliveryReason {
  CUSTOMER_NOT_AVAILABLE = 'CUSTOMER_NOT_AVAILABLE',
  CUSTOMER_REFUSED = 'CUSTOMER_REFUSED',
  INCORRECT_ADDRESS = 'INCORRECT_ADDRESS',
  CUSTOMER_REQUESTED_RESCHEDULE = 'CUSTOMER_REQUESTED_RESCHEDULE',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  UNREACHABLE_LOCATION = 'UNREACHABLE_LOCATION',
  BUSINESS_CLOSED = 'BUSINESS_CLOSED',
  OTHER = 'OTHER',
}

// Failed delivery schema (matches backend FailedDeliveryDto)
export const failedDeliverySchema = z.object({
  awbNumber: z.string().min(1, 'AWB number is required'),
  reason: z.nativeEnum(FailedDeliveryReason),
  notes: z.string().max(500).optional(),
  photoUrl: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// COD collection schema
export const codCollectionSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'NET_BANKING']),
  notes: z.string().max(500).optional(),
});

// Delivery action schema (for OTP dialog)
export const deliveryActionSchema = z.object({
  awbNumber: z.string().min(1, 'AWB number is required'),
  otpCode: z.string().length(6, 'OTP must be 6 digits'),
  receiverName: z.string().optional(),
  signatureUrl: z.string().optional(),
  podPhotoUrl: z.string().optional(),
  codAmountCollected: z.number().min(0).optional(),
  deliveryNote: z.string().max(500).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// ==================== TYPE EXPORTS ====================

export type LocationUpdate = z.infer<typeof locationUpdateSchema>;
export type GenerateOTP = z.infer<typeof generateOTPSchema>;
export type CompleteDelivery = z.infer<typeof completeDeliverySchema>;
export type FailedDelivery = z.infer<typeof failedDeliverySchema>;
export type CODCollection = z.infer<typeof codCollectionSchema>;
export type DeliveryAction = z.infer<typeof deliveryActionSchema>;

// ==================== COMPLEX TYPES ====================

export interface RiderManifest {
  id: number;
  manifestNumber: string;
  hubId: number;
  hubName: string;
  riderId: number;
  riderName: string;
  type: 'PICKUP' | 'DELIVERY';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalShipments: number;
  completedShipments: number;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  shipments: ManifestShipment[];
  createdAt: string;
}

export interface ManifestShipment {
  id: number;
  awb: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  city: string;
  area: string;
  status: string;
  serviceType: string;
  weight: number;
  codAmount: number;
  latitude?: number;
  longitude?: number;
  sequence: number;
}

export interface RiderDelivery {
  id: number;
  awb: string;
  manifestId: number;
  manifestNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  area: string;
  latitude?: number;
  longitude?: number;
  status: string;
  serviceType: string;
  weight: number;
  codAmount: number;
  isCOD: boolean;
  codCollected: boolean;
  paymentMethod?: string;
  otp?: string;
  deliveredAt?: string;
  failureReason?: string;
  photoUrl?: string;
  signatureUrl?: string;
  remarks?: string;
  sequence: number;
  createdAt: string;
}

export interface RiderStats {
  date: string;
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  pendingDeliveries: number;
  totalCOD: number;
  collectedCOD: number;
  pendingCOD: number;
  totalDistance: number;
  averageDeliveryTime: number;
  successRate: number;
  onTimeRate: number;
}

export interface RiderEarnings {
  period: {
    startDate: string;
    endDate: string;
  };
  totalEarnings: number;
  deliveryFees: number;
  bonuses: number;
  deductions: number;
  codCommission: number;
  totalDeliveries: number;
  dailyBreakdown: DailyEarning[];
}

export interface DailyEarning {
  date: string;
  deliveries: number;
  earnings: number;
  cod: number;
  distance: number;
}

// ==================== UI TYPES ====================

export interface DeliveryMapMarker {
  id: number;
  awb: string;
  latitude: number;
  longitude: number;
  customerName: string;
  address: string;
  sequence: number;
  status: string;
  codAmount: number;
}

export interface LocationPermissionState {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export interface BatteryState {
  level: number;
  charging: boolean;
  chargingTime?: number;
  dischargingTime?: number;
}
