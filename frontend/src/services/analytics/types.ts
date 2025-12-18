import { z } from 'zod';

// ==================== Enums ====================

export enum MetricPeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export enum ReportType {
  SHIPMENT = 'shipment',
  REVENUE = 'revenue',
  PERFORMANCE = 'performance',
  COD = 'cod',
}

export enum ExportFormat {
  CSV = 'csv',
  PDF = 'pdf',
  EXCEL = 'excel',
}

// ==================== Interfaces ====================

export interface ShipmentStatistics {
  totalShipments: number;
  pendingShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
  cancelledShipments?: number;
  returnedShipments?: number;
  statusStats: Array<{
    status: string;
    count: number;
  }>;
}

export interface RevenueStatistics {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalCodCollected: number;
  totalCodTransactions: number;
  totalDeliveryFees: number;
  averageOrderValue: number;
  revenueByDate: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
}

export interface PerformanceMetrics {
  deliverySuccessRate: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  customerSatisfactionScore?: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageRating?: number;
  performanceByRider?: Array<{
    riderId: string;
    riderName: string;
    deliveries: number;
    successRate: number;
    avgDeliveryTime: number;
  }>;
}

export interface CODStatistics {
  totalCodCollected: number;
  totalCodTransactions: number;
  pendingCodAmount: number;
  pendingCodTransactions: number;
  settledCodAmount: number;
  settledCodTransactions: number;
  codByStatus: Array<{
    status: string;
    amount: number;
    count: number;
  }>;
}

export interface AnalyticsDashboard {
  shipments: ShipmentStatistics;
  revenue: RevenueStatistics;
  performance: PerformanceMetrics;
  cod: CODStatistics;
  lastUpdated: string;
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface AnalyticsFilters extends DateRangeFilter {
  period?: MetricPeriod;
  merchantId?: string;
  hubLocation?: string;
}

export interface ExportOptions {
  reportType: ReportType;
  format: ExportFormat;
  filters?: AnalyticsFilters;
  includeCharts?: boolean;
}

export interface ExportResponse {
  url: string;
  filename: string;
  expiresAt: string;
}

export interface TrendData {
  label: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TopPerformer {
  id: string;
  name: string;
  metric: number;
  rank: number;
  avatar?: string;
}

// ==================== Zod Schemas ====================

export const dateRangeFilterSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

export const analyticsFiltersSchema = z.object({
  period: z.nativeEnum(MetricPeriod).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  merchantId: z.string().uuid().optional(),
  hubLocation: z.string().optional(),
});

export const exportOptionsSchema = z.object({
  reportType: z.nativeEnum(ReportType),
  format: z.nativeEnum(ExportFormat),
  filters: analyticsFiltersSchema.optional(),
  includeCharts: z.boolean().optional().default(false),
});

// ==================== Form Types ====================

export type AnalyticsFiltersInput = z.infer<typeof analyticsFiltersSchema>;
export type ExportOptionsInput = z.infer<typeof exportOptionsSchema>;
export type DateRangeFilterInput = z.infer<typeof dateRangeFilterSchema>;
