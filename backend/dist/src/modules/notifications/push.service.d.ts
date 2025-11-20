import { ConfigService } from '@nestjs/config';
import { SendPushNotificationDto } from './dto';
export declare class PushService {
    private configService;
    private readonly logger;
    private pusher;
    constructor(configService: ConfigService);
    sendPushNotification(pushDto: SendPushNotificationDto): Promise<boolean>;
    sendToMultipleUsers(userIds: string[], title: string, body: string, data?: any): Promise<boolean>;
    sendShipmentUpdate(userId: string, shipmentId: string, status: string, message: string): Promise<boolean>;
    sendDeliveryAlert(userId: string, shipmentId: string, awb: string, riderName: string): Promise<boolean>;
    sendPaymentNotification(userId: string, amount: number, transactionId: string, type: string): Promise<boolean>;
    sendRiderNotification(riderId: string, title: string, message: string, data?: any): Promise<boolean>;
    sendMerchantNotification(merchantId: string, title: string, message: string, data?: any): Promise<boolean>;
    broadcastSystemNotification(title: string, message: string, data?: any): Promise<boolean>;
    sendPickupAssignment(riderId: string, pickupId: string, address: string, itemCount: number): Promise<boolean>;
    sendManifestAssignment(riderId: string, manifestId: string, shipmentCount: number): Promise<boolean>;
}
