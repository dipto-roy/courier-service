import apiClient from '@/src/common/lib/apiClient';
import type {
  AnalyticsDashboard,
  ShipmentStatistics,
  RevenueStatistics,
  PerformanceMetrics,
  CODStatistics,
  AnalyticsFilters,
  ExportOptions,
  ExportResponse,
} from './types';

class AnalyticsService {
  private readonly baseUrl = '/analytics';

  /**
   * Get complete analytics dashboard data
   */
  async getDashboard(filters?: AnalyticsFilters): Promise<AnalyticsDashboard> {
    const { data } = await apiClient.get<AnalyticsDashboard>(
      `${this.baseUrl}/dashboard`,
      { params: filters }
    );
    return data;
  }

  /**
   * Get shipment statistics
   */
  async getShipmentStatistics(
    filters?: AnalyticsFilters
  ): Promise<ShipmentStatistics> {
    const { data } = await apiClient.get<ShipmentStatistics>(
      '/shipments/statistics',
      { params: filters }
    );
    return data;
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStatistics(
    filters?: AnalyticsFilters
  ): Promise<RevenueStatistics> {
    const { data } = await apiClient.get<RevenueStatistics>(
      '/payments/statistics/overall',
      { params: filters }
    );
    return data;
  }

  /**
   * Get merchant-specific revenue statistics
   */
  async getMerchantRevenue(merchantId: string): Promise<RevenueStatistics> {
    const { data } = await apiClient.get<RevenueStatistics>(
      `/payments/statistics/merchant/${merchantId}`
    );
    return data;
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(
    filters?: AnalyticsFilters
  ): Promise<PerformanceMetrics> {
    const { data } = await apiClient.get<PerformanceMetrics>(
      `${this.baseUrl}/performance`,
      { params: filters }
    );
    return data;
  }

  /**
   * Get COD statistics
   */
  async getCODStatistics(filters?: AnalyticsFilters): Promise<CODStatistics> {
    const { data } = await apiClient.get<CODStatistics>(
      '/payments/cod/statistics',
      { params: filters }
    );
    return data;
  }

  /**
   * Export report
   */
  async exportReport(options: ExportOptions): Promise<ExportResponse> {
    const { data } = await apiClient.post<ExportResponse>(
      `${this.baseUrl}/export`,
      options
    );
    return data;
  }

  /**
   * Download exported report
   */
  async downloadReport(url: string): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(url, {
      responseType: 'blob',
    });
    return data;
  }

  /**
   * Get shipment trends (for charts)
   */
  async getShipmentTrends(filters?: AnalyticsFilters) {
    const { data } = await apiClient.get(`${this.baseUrl}/shipments/trends`, {
      params: filters,
    });
    return data;
  }

  /**
   * Get revenue trends (for charts)
   */
  async getRevenueTrends(filters?: AnalyticsFilters) {
    const { data } = await apiClient.get(`${this.baseUrl}/revenue/trends`, {
      params: filters,
    });
    return data;
  }

  /**
   * Get top performing riders
   */
  async getTopRiders(filters?: AnalyticsFilters) {
    const { data } = await apiClient.get(`${this.baseUrl}/top-riders`, {
      params: filters,
    });
    return data;
  }

  /**
   * Get hub performance statistics
   */
  async getHubStatistics(hubLocation?: string) {
    const { data } = await apiClient.get('/hub/manifests/statistics', {
      params: { hubLocation },
    });
    return data;
  }
}

export const analyticsService = new AnalyticsService();
