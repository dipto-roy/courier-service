import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { Shipment } from '../../entities/shipment.entity';
import { InitiatePayoutDto, PaymentFilterDto } from './dto';
export declare class PaymentsService {
    private transactionRepository;
    private userRepository;
    private shipmentRepository;
    constructor(transactionRepository: Repository<Transaction>, userRepository: Repository<User>, shipmentRepository: Repository<Shipment>);
    recordCodCollection(shipmentId: string, riderId: string): Promise<Transaction>;
    recordDeliveryFee(shipmentId: string): Promise<Transaction>;
    initiatePayout(initiatePayoutDto: InitiatePayoutDto, adminId: string): Promise<Transaction>;
    completePayout(transactionId: string, referenceNumber?: string): Promise<Transaction>;
    failPayout(transactionId: string, reason: string): Promise<Transaction>;
    getTransaction(transactionId: string): Promise<Transaction>;
    getTransactions(filterDto: PaymentFilterDto): Promise<{
        transactions: Transaction[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPendingCodCollections(merchantId: string): Promise<Transaction[]>;
    calculatePendingBalance(merchantId: string): Promise<number>;
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
    private generateTransactionId;
    private calculatePayoutFee;
}
