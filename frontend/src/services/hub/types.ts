import { z } from 'zod';

/**
 * Manifest Status Enum
 * Matches backend ManifestStatus enum
 */
export enum ManifestStatus {
  CREATED = 'created',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  CLOSED = 'closed',
}

/**
 * Inbound Scan Schema
 * For scanning shipments arriving at hub
 */
export const inboundScanSchema = z.object({
  awbNumbers: z.array(z.string().min(1, 'AWB number is required')),
  hubLocation: z.string().min(1, 'Hub location is required'),
  source: z.string().optional(),
  manifestId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type InboundScan = z.infer<typeof inboundScanSchema>;

/**
 * Outbound Scan Schema
 * For scanning shipments leaving hub (to rider or another hub)
 */
export const outboundScanSchema = z.object({
  awbNumbers: z.array(z.string().min(1, 'AWB number is required')),
  originHub: z.string().min(1, 'Origin hub is required'),
  destinationHub: z.string().optional(),
  riderId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type OutboundScan = z.infer<typeof outboundScanSchema>;

/**
 * Sorting Schema
 * For sorting shipments by destination
 */
export const sortShipmentsSchema = z.object({
  awbNumbers: z.array(z.string().min(1, 'AWB number is required')),
  hubLocation: z.string().min(1, 'Hub location is required'),
  destinationHub: z.string().min(1, 'Destination hub is required'),
});

export type SortShipments = z.infer<typeof sortShipmentsSchema>;

/**
 * Create Manifest Schema
 * For creating hub-to-hub transfer manifest
 */
export const createManifestSchema = z.object({
  originHub: z.string().min(2, 'Origin hub is required'),
  destinationHub: z.string().min(2, 'Destination hub is required'),
  awbNumbers: z.array(z.string().min(1, 'AWB number is required')),
  riderId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type CreateManifest = z.infer<typeof createManifestSchema>;

/**
 * Receive Manifest Schema
 * For receiving manifest at destination hub
 */
export const receiveManifestSchema = z.object({
  receivedAwbNumbers: z.array(z.string().min(1, 'AWB number is required')),
  hubLocation: z.string().min(1, 'Hub location is required'),
  notes: z.string().optional(),
});

export type ReceiveManifest = z.infer<typeof receiveManifestSchema>;

/**
 * Manifest Filters Schema
 * For filtering manifest list
 */
export const manifestFiltersSchema = z.object({
  status: z.nativeEnum(ManifestStatus).optional(),
  originHub: z.string().optional(),
  destinationHub: z.string().optional(),
  riderId: z.string().optional(),
  fromDate: z.string().optional(), // ISO 8601 date string
  toDate: z.string().optional(), // ISO 8601 date string
  search: z.string().optional(), // Search by manifest number
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type ManifestFilters = z.infer<typeof manifestFiltersSchema>;

/**
 * Shipment interface (subset for hub operations)
 */
export interface HubShipment {
  id: string;
  awbNumber: string;
  status: string;
  currentHub?: string;
  destinationHub?: string;
  manifestId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hub Manifest interface
 * Matches backend Manifest entity
 */
export interface HubManifest {
  id: string;
  manifestNumber: string;
  originHub: string;
  destinationHub: string;
  riderId?: string;
  status: ManifestStatus;
  totalShipments: number;
  dispatchDate?: string;
  receivedDate?: string;
  createdById: string;
  receivedById?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  shipments?: HubShipment[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  receivedBy?: {
    id: string;
    name: string;
    email: string;
  };
  rider?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Scan Result interface
 * Response from inbound/outbound scan operations
 */
export interface ScanResult {
  success: boolean;
  scannedCount: number;
  originHub?: string;
  destinationHub?: string;
  riderId?: string;
  scannedShipments: Array<{
    awbNumber: string;
    status: string;
    currentHub?: string;
  }>;
  errors?: Array<{
    awbNumber: string;
    error: string;
  }>;
}

/**
 * Sorting Result interface
 * Response from sorting operation
 */
export interface SortingResult {
  success: boolean;
  sortedCount: number;
  hubLocation: string;
  destinationHub: string;
  sortedShipments: Array<{
    awbNumber: string;
    previousHub?: string;
    assignedHub: string;
  }>;
  errors?: Array<{
    awbNumber: string;
    error: string;
  }>;
}

/**
 * Manifest Statistics interface
 * Response from manifest statistics endpoint
 */
export interface ManifestStatistics {
  total: number;
  created: number;
  inTransit: number;
  received: number;
  closed: number;
  hubLocation?: string;
}

/**
 * Discrepancy Report interface
 * Used when receiving manifest with mismatches
 */
export interface DiscrepancyReport {
  manifestId: string;
  manifestNumber: string;
  expectedCount: number;
  receivedCount: number;
  notInManifest: string[]; // AWBs received but not in manifest
  notReceived: string[]; // AWBs in manifest but not received
}

/**
 * Manifest Receive Response interface
 */
export interface ManifestReceiveResponse {
  manifest: HubManifest;
  receivedCount: number;
  expectedCount: number;
  discrepancies: {
    notInManifest: string[];
    notReceived: string[];
  };
}
