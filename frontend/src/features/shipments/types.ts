import { z } from 'zod';
// import type { ShipmentStatus } from '@/src/common/types';

// Address validation schema
export const addressSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional().or(z.literal('')),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  landmark: z.string().optional().or(z.literal('')),
});

// Package details schema
export const packageDetailsSchema = z.object({
  weight: z.number().min(0.1, 'Weight must be at least 0.1 kg'),
  length: z.number().min(0).optional().or(z.literal(0)),
  width: z.number().min(0).optional().or(z.literal(0)),
  height: z.number().min(0).optional().or(z.literal(0)),
  description: z.string().min(3, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  invoiceValue: z.number().min(0).optional().or(z.literal(0)),
});

// Shipment form schema
export const createShipmentSchema = z.object({
  // Sender details
  sender: addressSchema,

  // Receiver details
  receiver: addressSchema,

  // Package details
  package: packageDetailsSchema,

  // Pickup and delivery
  pickupHubId: z.string().min(1, 'Pickup hub is required'),
  deliveryHubId: z.string().min(1, 'Delivery hub is required'),

  // Payment details
  paymentMethod: z.enum(['PREPAID', 'COD'], {
    message: 'Payment method is required',
  }),
  codAmount: z.number().min(0).optional(),

  // Service type
  serviceType: z
    .enum(['STANDARD', 'EXPRESS', 'SAME_DAY'])
    .default('STANDARD'),

  // Special instructions
  specialInstructions: z.string().max(500).optional(),

  // Fragile/valuable
  isFragile: z.boolean().default(false),
  requiresSignature: z.boolean().default(false),
});

// Validate COD amount when payment method is COD
export const createShipmentSchemaWithRefinements = createShipmentSchema.refine(
  (data) => {
    if (data.paymentMethod === 'COD') {
      return data.codAmount && data.codAmount > 0;
    }
    return true;
  },
  {
    message: 'COD amount is required when payment method is COD',
    path: ['codAmount'],
  },
);

// Bulk upload row schema (CSV format)
export const bulkShipmentRowSchema = z.object({
  // Sender
  senderName: z.string(),
  senderPhone: z.string(),
  senderEmail: z.string().email().optional(),
  senderAddress: z.string(),
  senderCity: z.string(),
  senderState: z.string(),
  senderPostalCode: z.string(),

  // Receiver
  receiverName: z.string(),
  receiverPhone: z.string(),
  receiverEmail: z.string().email().optional(),
  receiverAddress: z.string(),
  receiverCity: z.string(),
  receiverState: z.string(),
  receiverPostalCode: z.string(),

  // Package
  weight: z.number(),
  description: z.string(),
  quantity: z.number().optional(),
  invoiceValue: z.number().optional(),

  // Payment
  paymentMethod: z.enum(['PREPAID', 'COD']),
  codAmount: z.number().optional(),

  // Service
  serviceType: z.enum(['STANDARD', 'EXPRESS', 'SAME_DAY']).optional(),

  // Hubs
  pickupHubId: z.string(),
  deliveryHubId: z.string(),
});

// Shipment filters schema
export const shipmentFiltersSchema = z.object({
  status: z
    .enum([
      'PENDING',
      'PICKED_UP',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'FAILED',
      'RETURNED',
      'CANCELLED',
    ])
    .optional()
    .or(z.literal('')),
  search: z.string().optional().or(z.literal('')), // AWB number or receiver name/phone
  dateFrom: z.string().optional().or(z.literal('')), // ISO date string
  dateTo: z.string().optional().or(z.literal('')),
  paymentMethod: z.enum(['PREPAID', 'COD']).optional().or(z.literal('')),
  serviceType: z.enum(['STANDARD', 'EXPRESS', 'SAME_DAY']).optional().or(z.literal('')),
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  sortBy: z.enum(['createdAt', 'updatedAt', 'deliveryFee', 'status']),
  sortOrder: z.enum(['asc', 'desc']),
});

// Update shipment schema (only editable fields)
export const updateShipmentSchema = z.object({
  receiver: addressSchema.partial().optional(),
  package: packageDetailsSchema.partial().optional(),
  specialInstructions: z.string().max(500).optional(),
  deliveryHubId: z.string().optional(),
});

// Price calculation schema
export const priceCalculationSchema = z.object({
  pickupHubId: z.string().min(1, 'Pickup hub is required'),
  deliveryHubId: z.string().min(1, 'Delivery hub is required'),
  weight: z.number().min(0.1, 'Weight must be at least 0.1 kg'),
  dimensions: z
    .object({
      length: z.number().min(1),
      width: z.number().min(1),
      height: z.number().min(1),
    })
    .optional(),
  serviceType: z
    .enum(['STANDARD', 'EXPRESS', 'SAME_DAY'])
    .default('STANDARD'),
});

// Type exports
export type CreateShipmentFormData = z.infer<typeof createShipmentSchema>;
export type BulkShipmentRow = z.infer<typeof bulkShipmentRowSchema>;
export type ShipmentFiltersFormData = z.infer<typeof shipmentFiltersSchema>;
export type UpdateShipmentFormData = z.infer<typeof updateShipmentSchema>;
export type PriceCalculationFormData = z.infer<typeof priceCalculationSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type PackageDetailsFormData = z.infer<typeof packageDetailsSchema>;

// Multi-step form state
export type ShipmentFormStep = 'sender' | 'receiver' | 'package' | 'review';

export interface ShipmentFormState {
  currentStep: ShipmentFormStep;
  data: Partial<CreateShipmentFormData>;
}
