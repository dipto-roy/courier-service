import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { SendNotificationDto, SendEmailDto, SendSmsDto, SendPushNotificationDto } from './dto';

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private smsService: SmsService,
    private pushService: PushService,
  ) {}

  @Process('send-notification')
  async handleSendNotification(job: Job<{ notificationId: string } & SendNotificationDto>) {
    this.logger.log(`Processing notification job ${job.id}`);
    
    try {
      await this.notificationsService.processNotification(
        job.data.notificationId,
        job.data,
      );
      this.logger.log(`Notification job ${job.id} completed`);
    } catch (error) {
      this.logger.error(`Notification job ${job.id} failed:`, error.message);
      throw error;
    }
  }

  @Process('send-email')
  async handleSendEmail(job: Job<SendEmailDto>) {
    this.logger.log(`Processing email job ${job.id}`);
    
    try {
      await this.emailService.sendEmail(job.data);
      this.logger.log(`Email job ${job.id} completed`);
    } catch (error) {
      this.logger.error(`Email job ${job.id} failed:`, error.message);
      throw error;
    }
  }

  @Process('send-sms')
  async handleSendSms(job: Job<SendSmsDto>) {
    this.logger.log(`Processing SMS job ${job.id}`);
    
    try {
      await this.smsService.sendSms(job.data);
      this.logger.log(`SMS job ${job.id} completed`);
    } catch (error) {
      this.logger.error(`SMS job ${job.id} failed:`, error.message);
      throw error;
    }
  }

  @Process('send-push')
  async handleSendPush(job: Job<SendPushNotificationDto>) {
    this.logger.log(`Processing push notification job ${job.id}`);
    
    try {
      await this.pushService.sendPushNotification(job.data);
      this.logger.log(`Push notification job ${job.id} completed`);
    } catch (error) {
      this.logger.error(`Push notification job ${job.id} failed:`, error.message);
      throw error;
    }
  }
}
