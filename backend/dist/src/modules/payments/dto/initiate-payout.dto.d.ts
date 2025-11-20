import { PaymentMethod } from '../../../common/enums';
export declare class InitiatePayoutDto {
    merchantId: string;
    amount: number;
    paymentMethod?: PaymentMethod;
    description?: string;
    referenceNumber?: string;
}
