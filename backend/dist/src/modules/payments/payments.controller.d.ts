import { PaymentsService } from './payments.service';
import { InitiatePayoutDto, PaymentFilterDto } from './dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    recordCodCollection(shipmentId: string, req: any): Promise<import("../../entities").Transaction>;
    recordDeliveryFee(shipmentId: string): Promise<import("../../entities").Transaction>;
    initiatePayout(initiatePayoutDto: InitiatePayoutDto, req: any): Promise<import("../../entities").Transaction>;
    completePayout(transactionId: string, referenceNumber?: string): Promise<import("../../entities").Transaction>;
    failPayout(transactionId: string, reason: string): Promise<import("../../entities").Transaction>;
    getTransactions(filterDto: PaymentFilterDto, req: any): Promise<{
        transactions: import("../../entities").Transaction[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getTransaction(transactionId: string): Promise<import("../../entities").Transaction>;
    getPendingCollections(merchantId: string): Promise<import("../../entities").Transaction[]>;
    getPendingBalance(merchantId: string): Promise<{
        pendingBalance: number;
    }>;
    getMerchantStatistics(merchantId: string): Promise<{
        walletBalance: number;
        pendingBalance: number;
        totalCodCollected: number;
        totalCodTransactions: number;
        totalDeliveryFees: number;
        totalPayouts: number;
        totalPayoutTransactions: number;
        thisMonthCollections: number;
    }>;
    getOverallStatistics(): Promise<{
        totalCodCollected: number;
        totalCodTransactions: number;
        totalPayouts: number;
        totalPayoutTransactions: number;
        pendingPayouts: number;
        pendingPayoutTransactions: number;
        todayCollections: number;
        thisMonthCollections: number;
    }>;
}
