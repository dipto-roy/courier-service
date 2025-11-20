import type { Job } from 'bull';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { SendNotificationDto, SendEmailDto, SendSmsDto, SendPushNotificationDto } from './dto';
export declare class NotificationsProcessor {
    private notificationsService;
    private emailService;
    private smsService;
    private pushService;
    private readonly logger;
    constructor(notificationsService: NotificationsService, emailService: EmailService, smsService: SmsService, pushService: PushService);
    handleSendNotification(job: Job<{
        notificationId: string;
    } & SendNotificationDto>): Promise<void>;
    handleSendEmail(job: Job<SendEmailDto>): Promise<void>;
    handleSendSms(job: Job<SendSmsDto>): Promise<void>;
    handleSendPush(job: Job<SendPushNotificationDto>): Promise<void>;
}
