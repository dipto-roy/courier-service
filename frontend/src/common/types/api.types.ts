// ==================== ENUMS ====================

export enum UserRole {
  ADMIN = 'admin',
  MERCHANT = 'merchant',
  AGENT = 'agent',
  HUB_STAFF = 'hub_staff',
  RIDER = 'rider',
  CUSTOMER = 'customer',
  FINANCE = 'finance',
  SUPPORT = 'support',
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum ManifestStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

// ==================== USER TYPES ====================

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Merchant extends User {
  businessName: string;
  businessAddress: string;
  tradeLicense?: string;
  nid?: string;
  walletBalance: number;
}

export interface Rider extends User {
  vehicleType: string;
  vehicleNumber?: string;
  drivingLicense?: string;
  nid?: string;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

// ==================== AUTH TYPES ====================

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  businessName?: string;
  businessAddress?: string;
}

export interface VerifyOTPRequest {
  email: string;
  otpCode: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ==================== SHIPMENT TYPES ====================

export interface Shipment {
  id: number;
  awb: string;
  awbNumber: string; // Same as awb, for backward compatibility
  status: ShipmentStatus;
  merchantId: number;
  merchant?: Merchant;
  
  // Sender details
  senderName: string;
  senderPhone: string;
  senderAddress?: string;
  senderEmail?: string;
  senderCity?: string;
  senderState?: string;
  senderPostalCode?: string;
  
  // Receiver details
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverEmail?: string;
  receiverCity: string;
  receiverState?: string;
  receiverPostalCode?: string;
  receiverZone: string;
  
  // Package details
  weight: number;
  itemDescription?: string;
  description?: string; // Alias for itemDescription
  quantity?: number;
  invoiceValue?: number;
  
  // Pricing
  codAmount: number;
  deliveryFee: number;
  paymentMethod: 'COD' | 'PREPAID';
  
  // Additional info
  specialInstructions?: string;
  assignedRiderId?: number;
  assignedRider?: Rider;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface CreateShipmentRequest {
  senderName: string;
  senderPhone: string;
  senderAddress?: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  receiverZone: string;
  weight: number;
  itemDescription?: string;
  codAmount: number;
  specialInstructions?: string;
}

export interface BulkShipmentRequest {
  shipments: CreateShipmentRequest[];
}

export interface ShipmentFilters {
  status?: ShipmentStatus;
  merchantId?: number;
  riderId?: number;
  awb?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ==================== TRACKING TYPES ====================

export interface TrackingLocation {
  latitude: number;
  longitude: number;
  speed?: number;
  accuracy?: number;
  timestamp: string;
}

export interface TrackingEvent {
  id: number;
  shipmentId: number;
  status: ShipmentStatus;
  location?: string;
  remarks?: string;
  createdAt: string;
}

export interface TrackingDetails {
  shipment: Shipment;
  events: TrackingEvent[];
  currentLocation?: TrackingLocation;
  estimatedDeliveryTime?: string;
}

// ==================== MANIFEST TYPES ====================

export interface Manifest {
  id: number;
  manifestNumber: string;
  status: ManifestStatus;
  riderId?: number;
  rider?: Rider;
  hubId?: number;
  shipments: Shipment[];
  shipmentCount: number;
  totalCOD: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateManifestRequest {
  shipmentIds: number[];
  riderId?: number;
  hubId?: number;
}

// ==================== PAYMENT TYPES ====================

export interface Payment {
  id: number;
  amount: number;
  status: PaymentStatus;
  type: 'COD' | 'DELIVERY_FEE' | 'PAYOUT' | 'REFUND';
  shipmentId?: number;
  merchantId?: number;
  riderId?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CODCollection {
  id: number;
  shipmentId: number;
  shipment?: Shipment;
  riderId: number;
  rider?: Rider;
  amount: number;
  collectedAt: string;
  depositedAt?: string;
}

export interface Payout {
  id: number;
  merchantId: number;
  merchant?: Merchant;
  amount: number;
  status: PaymentStatus;
  method: 'BANK' | 'MOBILE_BANKING' | 'CASH';
  accountDetails?: string;
  processedAt?: string;
  createdAt: string;
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// ==================== PAGINATION TYPES ====================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ==================== API RESPONSE TYPES ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ==================== ANALYTICS TYPES ====================

export interface DashboardStats {
  totalShipments: number;
  pendingShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
  totalRevenue: number;
  totalCOD: number;
  activeRiders: number;
  todayDeliveries: number;
}

export interface RevenueStats {
  date: string;
  revenue: number;
  deliveries: number;
}

export interface RiderPerformance {
  riderId: number;
  riderName: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  totalCOD: number;
  successRate: number;
}

// ==================== FORM TYPES ====================

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FileUpload {
  file: File;
  preview?: string;
  progress?: number;
}

// ==================== WEBSOCKET TYPES ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SocketEvent<T = any> {
  event: string;
  data: T;
  timestamp: string;
}

export interface LocationUpdateEvent {
  riderId: number;
  shipmentId?: number;
  location: TrackingLocation;
}

export interface StatusUpdateEvent {
  shipmentId: number;
  status: ShipmentStatus;
  location?: string;
  remarks?: string;
}

// ==================== TRACKING TYPES ====================

export interface TrackingLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}

export interface TrackingInfo {
  awb: string;
  status: ShipmentStatus;
  senderName: string;
  senderCity: string;
  receiverName: string;
  receiverCity: string;
  weight: number;
  serviceType: string;
  codAmount: number;
  createdAt: string;
  deliveryLocation?: TrackingLocation;
}

export interface LocationUpdate extends TrackingLocation {
  id: number;
  shipmentId: number;
  riderId?: number;
}

export interface TrackingHistoryResponse {
  events: Array<{
    id: number;
    status: ShipmentStatus;
    description: string;
    location?: string;
    timestamp: string;
    hubName?: string;
    riderName?: string;
  }>;
  currentStatus: ShipmentStatus;
  currentStatusDescription: string;
}
