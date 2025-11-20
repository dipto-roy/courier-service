import { PaginationDto } from '../../../common/dto';
import { ShipmentStatus, DeliveryType, PaymentMethod, PaymentStatus } from '../../../common/enums';
export declare class FilterShipmentDto extends PaginationDto {
    awb?: string;
    merchantId?: string;
    status?: ShipmentStatus;
    deliveryType?: DeliveryType;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    receiverCity?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
}
