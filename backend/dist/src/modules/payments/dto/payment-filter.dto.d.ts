import { PaymentStatus, PaymentMethod } from '../../../common/enums';
import { TransactionType } from '../../../entities/transaction.entity';
export declare class PaymentFilterDto {
    merchantId?: string;
    type?: TransactionType;
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
