import { NotificationType } from '../../../common/enums';
export declare class SendNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    shipmentId?: string;
    data?: any;
}
export declare class SendEmailDto {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    template?: string;
    context?: any;
}
export declare class SendSmsDto {
    to: string;
    message: string;
    template?: string;
    context?: any;
}
export declare class SendPushNotificationDto {
    userId: string;
    title: string;
    body: string;
    data?: any;
    channelId?: string;
}
