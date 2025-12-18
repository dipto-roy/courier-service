import apiClient from '@/src/common/lib/apiClient';
import {
  Transaction,
  InitiatePayout,
  PaymentFilter,
  PaymentStatistics,
  OverallStatistics,
  PendingBalanceResponse,
  TransactionsResponse,
} from './types';

/**
 * Payment Service
 * Handles all payment operations including COD, payouts, and transactions
 */
class PaymentService {
  /**
   * Record COD collection for a shipment
   * Automatically creates transaction record
   * @param shipmentId - Shipment UUID
   */
  async recordCodCollection(shipmentId: string): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(
      `/payments/record-cod/${shipmentId}`,
    );
    return response.data;
  }

  /**
   * Record delivery fee for a shipment
   * @param shipmentId - Shipment UUID
   */
  async recordDeliveryFee(shipmentId: string): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(
      `/payments/record-delivery-fee/${shipmentId}`,
    );
    return response.data;
  }

  /**
   * Initiate payout to merchant
   * Validates T+7 eligibility and available balance
   * @param data - Payout initiation data
   */
  async initiatePayout(data: InitiatePayout): Promise<Transaction> {
    const response = await apiClient.post<Transaction>('/payments/initiate-payout', data);
    return response.data;
  }

  /**
   * Complete a payout transaction
   * Mark as completed after successful bank transfer
   * @param transactionId - Transaction UUID
   * @param referenceNumber - Bank transaction reference
   */
  async completePayout(
    transactionId: string,
    referenceNumber?: string,
  ): Promise<Transaction> {
    const response = await apiClient.patch<Transaction>(
      `/payments/complete-payout/${transactionId}`,
      { referenceNumber },
    );
    return response.data;
  }

  /**
   * Fail a payout transaction
   * Reverses wallet deduction
   * @param transactionId - Transaction UUID
   * @param reason - Failure reason
   */
  async failPayout(transactionId: string, reason: string): Promise<Transaction> {
    const response = await apiClient.patch<Transaction>(
      `/payments/fail-payout/${transactionId}`,
      { reason },
    );
    return response.data;
  }

  /**
   * Get transactions with filters and pagination
   * @param filters - Filter criteria
   */
  async getTransactions(filters?: PaymentFilter): Promise<TransactionsResponse> {
    const response = await apiClient.get<TransactionsResponse>('/payments/transactions', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get transaction by ID
   * @param transactionId - Transaction UUID
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(
      `/payments/transactions/${transactionId}`,
    );
    return response.data;
  }

  /**
   * Get pending COD collections for merchant
   * Collections older than 7 days pending payout
   * @param merchantId - Merchant user UUID
   */
  async getPendingCollections(merchantId: string): Promise<Transaction[]> {
    const response = await apiClient.get<Transaction[]>(
      `/payments/pending-collections/${merchantId}`,
    );
    return response.data;
  }

  /**
   * Get pending balance for merchant
   * Calculate T+7 eligible amount
   * @param merchantId - Merchant user UUID
   */
  async getPendingBalance(merchantId: string): Promise<PendingBalanceResponse> {
    const response = await apiClient.get<PendingBalanceResponse>(
      `/payments/pending-balance/${merchantId}`,
    );
    return response.data;
  }

  /**
   * Get merchant payment statistics
   * @param merchantId - Merchant user UUID
   */
  async getMerchantStatistics(merchantId: string): Promise<PaymentStatistics> {
    const response = await apiClient.get<PaymentStatistics>(
      `/payments/statistics/merchant/${merchantId}`,
    );
    return response.data;
  }

  /**
   * Get overall payment statistics (Admin only)
   */
  async getOverallStatistics(): Promise<OverallStatistics> {
    const response = await apiClient.get<OverallStatistics>(
      '/payments/statistics/overall',
    );
    return response.data;
  }
}

export const paymentService = new PaymentService();
