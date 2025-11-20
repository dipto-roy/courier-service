export declare enum WalletOperationType {
    CREDIT = "credit",
    DEBIT = "debit"
}
export declare class WalletUpdateDto {
    operation: WalletOperationType;
    amount: number;
    remarks?: string;
}
