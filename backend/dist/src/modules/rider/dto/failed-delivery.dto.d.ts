export declare enum FailedDeliveryReason {
    CUSTOMER_NOT_AVAILABLE = "CUSTOMER_NOT_AVAILABLE",
    CUSTOMER_REFUSED = "CUSTOMER_REFUSED",
    INCORRECT_ADDRESS = "INCORRECT_ADDRESS",
    CUSTOMER_REQUESTED_RESCHEDULE = "CUSTOMER_REQUESTED_RESCHEDULE",
    PAYMENT_ISSUE = "PAYMENT_ISSUE",
    UNREACHABLE_LOCATION = "UNREACHABLE_LOCATION",
    BUSINESS_CLOSED = "BUSINESS_CLOSED",
    OTHER = "OTHER"
}
export declare class FailedDeliveryDto {
    awbNumber: string;
    reason: FailedDeliveryReason;
    notes?: string;
    photoUrl?: string;
    latitude?: number;
    longitude?: number;
}
