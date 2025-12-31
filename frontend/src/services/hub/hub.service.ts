import apiClient from '@/src/common/lib/apiClient';
import {
  InboundScan,
  OutboundScan,
  CreateManifest,
  SortShipments,
  ReceiveManifest,
  ManifestFilters,
  HubManifest,
  ManifestStatistics,
  ScanResult,
  SortingResult,
} from './types';

/**
 * Hub Service
 * Handles all hub operations including scanning, sorting, and manifest management
 */
class HubService {
  /**
   * Scan shipments arriving at hub (inbound)
   * @param data - Inbound scan data
   */
  async inboundScan(data: InboundScan): Promise<ScanResult> {
    const response = await apiClient.post<ScanResult>('/hub/inbound-scan', data);
    return response.data;
  }

  /**
   * Scan shipments leaving hub (outbound)
   * Can assign to rider or route to another hub
   * @param data - Outbound scan data
   */
  async outboundScan(data: OutboundScan): Promise<ScanResult> {
    const response = await apiClient.post<ScanResult>('/hub/outbound-scan', data);
    return response.data;
  }

  /**
   * Sort shipments by destination for routing
   * @param data - Sorting data
   */
  async sortShipments(data: SortShipments): Promise<SortingResult> {
    const response = await apiClient.post<SortingResult>('/hub/sorting', data);
    return response.data;
  }

  /**
   * Create manifest for hub-to-hub transfer
   * Manifest number is auto-generated (format: MF-YYYYMMDD-####)
   * @param data - Manifest creation data
   */
  async createManifest(data: CreateManifest): Promise<HubManifest> {
    const response = await apiClient.post<HubManifest>('/hub/manifests', data);
    return response.data;
  }

  /**
   * Get list of manifests with optional filters
   * @param filters - Filter criteria (status, hub, rider, date range, search)
   */
  async getManifests(filters?: ManifestFilters): Promise<{
    manifests: HubManifest[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get('/hub/manifests', { params: filters });
    return response.data;
  }

  /**
   * Get manifest details by ID
   * @param id - Manifest UUID
   */
  async getManifestById(id: string): Promise<HubManifest> {
    const response = await apiClient.get<HubManifest>(`/hub/manifests/${id}`);
    return response.data;
  }

  /**
   * Get manifest statistics (counts by status)
   * @param hubLocation - Optional filter by hub location
   */
  async getManifestStatistics(hubLocation?: string): Promise<ManifestStatistics> {
    const response = await apiClient.get<ManifestStatistics>('/hub/manifests/statistics', {
      params: hubLocation ? { hubLocation } : undefined,
    });
    return response.data;
  }

  /**
   * Receive manifest at destination hub
   * Handles discrepancies between expected and received shipments
   * @param id - Manifest UUID
   * @param data - Receive manifest data
   */
  async receiveManifest(
    id: string,
    data: ReceiveManifest,
  ): Promise<{
    manifest: HubManifest;
    receivedCount: number;
    expectedCount: number;
    discrepancies: {
      notInManifest: string[];
      notReceived: string[];
    };
  }> {
    const response = await apiClient.post(`/hub/manifests/${id}/receive`, data);
    return response.data;
  }
}

export const hubService = new HubService();
