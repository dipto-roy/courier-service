import { NotificationsService } from './notifications.service';
import { SendNotificationDto, SendEmailDto, SendSmsDto, SendPushNotificationDto } from './dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    sendNotification(sendNotificationDto: SendNotificationDto): Promise<import("../../entities").Notification>;
    sendEmail(sendEmailDto: SendEmailDto): Promise<{
        success: boolean;
        message: string;
    }>;
    sendSms(sendSmsDto: SendSmsDto): Promise<{
        success: boolean;
        message: string;
    }>;
    sendPushNotification(sendPushDto: SendPushNotificationDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getMyNotifications(req: any, isRead?: string): Promise<import("../../entities").Notification[]>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markAsRead(id: string, req: any): Promise<import("../../entities").Notification>;
    markAllAsRead(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteNotification(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserNotifications(userId: string): Promise<import("../../entities").Notification[]>;
    getStatistics(): Promise<any>;
    getUserStatistics(userId: string): Promise<any>;
    notifyShipmentCreated(body: {
        userId: string;
        shipmentId: string;
        awb: string;
        data: any;
    }): Promise<{
        success: boolean;
    }>;
    notifyShipmentPickedUp(body: {
        userId: string;
        shipmentId: string;
        awb: string;
        data: any;
    }): Promise<{
        success: boolean;
    }>;
    notifyOutForDelivery(body: {
        userId: string;
        shipmentId: string;
        awb: string;
        riderName: string;
        riderPhone: string;
    }): Promise<{
        success: boolean;
    }>;
    notifyDelivered(body: {
        userId: string;
        shipmentId: string;
        awb: string;
        deliveredAt: string;
    }): Promise<{
        success: boolean;
    }>;
    notifyDeliveryFailed(body: {
        userId: string;
        shipmentId: string;
        awb: string;
        reason: string;
    }): Promise<{
        success: boolean;
    }>;
    notifyPickupAssignment(body: {
        riderId: string;
        pickupId: string;
        address: string;
        itemCount: number;
    }): Promise<{
        success: boolean;
    }>;
    notifyManifestAssignment(body: {
        riderId: string;
        manifestId: string;
        shipmentCount: number;
    }): Promise<{
        success: boolean;
    }>;
    notifyPayoutInitiated(body: {
        userId: string;
        amount: number;
        transactionId: string;
    }): Promise<{
        success: boolean;
    }>;
    notifyPayoutCompleted(body: {
        userId: string;
        amount: number;
        transactionId: string;
        referenceNumber: string;
    }): Promise<{
        success: boolean;
    }>;
}
