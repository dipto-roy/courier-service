import { PaymentMethod, PaymentStatus } from '../common/enums';
import { User } from './user.entity';
export declare enum TransactionType {
    DELIVERY_FEE = "delivery_fee",
    COD_COLLECTION = "cod_collection",
    COD_PAYOUT = "cod_payout",
    WALLET_CREDIT = "wallet_credit",
    WALLET_DEBIT = "wallet_debit",
    REFUND = "refund"
}
export declare class Transaction {
    id: string;
    transactionId: string;
    userId: string;
    shipmentId: string;
    type: TransactionType;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    fee: number;
    netAmount: number;
    previousBalance: number;
    newBalance: number;
    description: string;
    referenceNumber: string;
    gatewayResponse: any;
    processedAt: Date;
    processedById: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    processedBy: User;
}
