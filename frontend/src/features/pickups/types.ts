import { z } from 'zod';

// ==================== Enums ====================

export enum PickupStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// ==================== Interfaces ====================

export interface Pickup {
  id: string;
  merchantId: string;
  agentId?: string;
  pickupAddress: string;
  pickupCity: string;
  pickupArea: string;
  scheduledDate: string;
  contactPerson: string;
  contactPhone: string;
  totalShipments: number;
  status: PickupStatus;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  merchant?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    companyName?: string;
  };
  agent?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface PickupStatistics {
  total: number;
  pending: number;
  assigned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface PickupsListResponse {
  data: Pickup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== Filter Types ====================

export interface PickupFilters {
  merchantId?: string;
  agentId?: string;
  status?: PickupStatus;
  pickupCity?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ==================== Zod Schemas ====================

export const createPickupSchema = z.object({
  pickupAddress: z.string().min(1, 'Pickup address is required'),
  pickupCity: z.string().min(1, 'Pickup city is required'),
  pickupArea: z.string().min(1, 'Pickup area is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  totalShipments: z.number().int().min(1, 'At least 1 shipment required'),
  notes: z.string().optional(),
});

export const updatePickupSchema = createPickupSchema.partial();

export const assignPickupSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID'),
});

export const completePickupSchema = z.object({
  shipmentAwbs: z.array(z.string().min(1, 'AWB number is required')),
  signatureUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  notes: z.string().optional(),
});

// ==================== Form Types ====================

export type CreatePickupInput = z.infer<typeof createPickupSchema>;
export type UpdatePickupInput = z.infer<typeof updatePickupSchema>;
export type AssignPickupInput = z.infer<typeof assignPickupSchema>;
export type CompletePickupInput = z.infer<typeof completePickupSchema>;
