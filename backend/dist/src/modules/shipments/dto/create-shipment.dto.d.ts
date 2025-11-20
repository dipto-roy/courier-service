import { DeliveryType, PaymentMethod } from '../../../common/enums';
declare class AddressDto {
    name: string;
    phone: string;
    email?: string;
    city: string;
    area: string;
    address: string;
    latitude?: number;
    longitude?: number;
}
export declare class CreateShipmentDto {
    sender: AddressDto;
    receiver: AddressDto;
    deliveryType: DeliveryType;
    weight: number;
    productCategory?: string;
    productDescription?: string;
    declaredValue?: number;
    paymentMethod: PaymentMethod;
    codAmount?: number;
    specialInstructions?: string;
    merchantInvoice?: string;
}
export {};
