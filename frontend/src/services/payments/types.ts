import { z } from 'zod';

/**
 * Transaction Type Enum
 * Matches backend TransactionType enum
 */
export enum TransactionType {
  DELIVERY_FEE = 'delivery_fee',
  COD_COLLECTION = 'cod_collection',
  COD_PAYOUT = 'cod_payout',
  WALLET_CREDIT = 'wallet_credit',
  WALLET_DEBIT = 'wallet_debit',
  REFUND = 'refund',
}

/**
 * Payment Status Enum
 * Matches backend PaymentStatus enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  COLLECTED = 'collected',
  VERIFIED = 'verified',
  PAID_OUT = 'paid_out',
  FAILED = 'failed',
}

/**
 * Payment Method Enum
 * Matches backend PaymentMethod enum
 */
export enum PaymentMethod {
  COD = 'cod',
  CASH = 'cash',
  PREPAID = 'prepaid',
  WALLET = 'wallet',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_BANKING = 'mobile_banking',
}

/**
 * Initiate Payout Schema
 * For creating payout to merchant
 */
export const initiatePayoutSchema = z.object({
  merchantId: z.string().uuid('Invalid merchant ID'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  description: z.string().optional(),
  referenceNumber: z.string().optional(),
});

export type InitiatePayout = z.infer<typeof initiatePayoutSchema>;

/**
 * Payment Filter Schema
 * For filtering transactions
 */
export const paymentFilterSchema = z.object({
  merchantId: z.string().uuid().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  startDate: z.string().optional(), // ISO 8601
  endDate: z.string().optional(), // ISO 8601
  page: z.number().min(1).optional(),
  limit: z.number().min(1).optional(),
});

export type PaymentFilter = z.infer<typeof paymentFilterSchema>;

/**
 * Transaction interface
 * Matches backend Transaction entity
 */
export interface Transaction {
  id: string;
  transactionId: string;
  userId: string;
  shipmentId?: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  fee: number;
  netAmount: number;
  previousBalance?: number;
  newBalance?: number;
  description?: string;
  referenceNumber?: string;
  gatewayResponse?: Record<string, unknown>;
  processedAt?: string;
  processedById?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  processedBy?: {
    id: string;
    name: string;
    email: string;
  };
  shipment?: {
    id: string;
    awbNumber: string;
  };
}

/**
 * Payment Statistics interface
 */
export interface PaymentStatistics {
  walletBalance: number;
  pendingBalance: number;
  totalCodCollected: number;
  totalCodTransactions: number;
  totalDeliveryFees: number;
  totalPayouts: number;
  totalPayoutTransactions: number;
  thisMonthCollections: number;
}

/**
 * Overall Statistics interface (Admin)
 */
export interface OverallStatistics {
  totalCodCollected: number;
  totalCodTransactions: number;
  totalPayouts: number;
  totalPayoutTransactions: number;
  pendingPayouts: number;
  pendingPayoutTransactions: number;
  todayCollections: number;
  thisMonthCollections: number;
}

/**
 * Pending Balance Response
 */
export interface PendingBalanceResponse {
  pendingBalance: number;
}

/**
 * Transactions Response with Pagination
 */
export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
