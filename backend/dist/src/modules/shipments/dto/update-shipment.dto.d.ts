import { DeliveryType, PaymentMethod } from '../../../common/enums';
declare class UpdateAddressDto {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    area?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
}
export declare class UpdateShipmentDto {
    sender?: UpdateAddressDto;
    receiver?: UpdateAddressDto;
    deliveryType?: DeliveryType;
    weight?: number;
    productCategory?: string;
    productDescription?: string;
    declaredValue?: number;
    paymentMethod?: PaymentMethod;
    codAmount?: number;
    specialInstructions?: string;
}
export {};
