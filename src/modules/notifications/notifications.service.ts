import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Notification } from '../../entities/notification.entity';
import { NotificationType } from '../../common/enums';
import { SendNotificationDto, SendEmailDto, SendSmsDto, SendPushNotificationDto } from './dto';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectQueue('notifications')
    private notificationQueue: Queue,
    private emailService: EmailService,
    private smsService: SmsService,
    private pushService: PushService,
  ) {}

  // ==================== Main Notification Methods ====================

  async sendNotification(sendNotificationDto: SendNotificationDto): Promise<Notification> {
    try {
      // Create notification record
      const notification = this.notificationRepository.create({
        userId: sendNotificationDto.userId,
        shipmentId: sendNotificationDto.shipmentId,
        type: sendNotificationDto.type,
        title: sendNotificationDto.title,
        message: sendNotificationDto.message,
        data: sendNotificationDto.data,
      });

      await this.notificationRepository.save(notification);

      // Queue notification for async processing
      await this.notificationQueue.add('send-notification', {
        notificationId: notification.id,
        ...sendNotificationDto,
      });

      this.logger.log(`Notification queued: ${notification.id}`);
      return notification;
    } catch (error) {
      this.logger.error('Failed to create notification:', error.message);
      throw error;
    }
  }

  async processNotification(notificationId: string, dto: SendNotificationDto): Promise<void> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId },
        relations: ['user'],
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      let success = false;
      let errorMessage: string | null = null;

      try {
        switch (dto.type) {
          case NotificationType.EMAIL:
            if (notification.user.email) {
              await this.emailService.sendEmail({
                to: notification.user.email,
                subject: dto.title,
                html: dto.message,
              });
              success = true;
            }
            break;

          case NotificationType.SMS:
            if (notification.user.phone) {
              await this.smsService.sendSms({
                to: notification.user.phone,
                message: dto.message,
              });
              success = true;
            }
            break;

          case NotificationType.PUSH:
            await this.pushService.sendPushNotification({
              userId: dto.userId,
              title: dto.title,
              body: dto.message,
              data: dto.data,
            });
            success = true;
            break;

          default:
            errorMessage = `Unsupported notification type: ${dto.type}`;
        }
      } catch (error) {
        errorMessage = error.message;
        this.logger.error(`Notification delivery failed: ${error.message}`);
      }

      // Update notification status
      await this.notificationRepository.update(notification.id, {
        sentAt: success ? new Date() : undefined,
        deliveryStatus: success ? 'sent' : 'failed',
        errorMessage: errorMessage || undefined,
      });

      this.logger.log(`Notification ${notificationId} ${success ? 'sent' : 'failed'}`);
    } catch (error) {
      this.logger.error(`Failed to process notification ${notificationId}:`, error.message);
      throw error;
    }
  }

  // ==================== Direct Channel Methods ====================

  async sendEmail(emailDto: SendEmailDto): Promise<boolean> {
    try {
      await this.notificationQueue.add('send-email', emailDto);
      return true;
    } catch (error) {
      this.logger.error('Failed to queue email:', error.message);
      throw error;
    }
  }

  async sendSms(smsDto: SendSmsDto): Promise<boolean> {
    try {
      await this.notificationQueue.add('send-sms', smsDto);
      return true;
    } catch (error) {
      this.logger.error('Failed to queue SMS:', error.message);
      throw error;
    }
  }

  async sendPushNotification(pushDto: SendPushNotificationDto): Promise<boolean> {
    try {
      await this.notificationQueue.add('send-push', pushDto);
      return true;
    } catch (error) {
      this.logger.error('Failed to queue push notification:', error.message);
      throw error;
    }
  }

  // ==================== Shipment Notification Templates ====================

  async notifyShipmentCreated(userId: string, shipmentId: string, awb: string, data: any): Promise<void> {
    const notification: SendNotificationDto = {
      userId,
      shipmentId,
      type: NotificationType.EMAIL,
      title: 'Shipment Created Successfully',
      message: `Your shipment ${awb} has been created.`,
      data,
    };

    await this.sendNotification(notification);

    // Also send SMS
    await this.sendNotification({
      ...notification,
      type: NotificationType.SMS,
    });

    // And push notification
    await this.sendNotification({
      ...notification,
      type: NotificationType.PUSH,
    });
  }

  async notifyShipmentPickedUp(userId: string, shipmentId: string, awb: string, data: any): Promise<void> {
    await this.sendNotification({
      userId,
      shipmentId,
      type: NotificationType.PUSH,
      title: 'Shipment Picked Up',
      message: `Your shipment ${awb} has been picked up and is in transit.`,
      data,
    });

    await this.sendNotification({
      userId,
      shipmentId,
      type: NotificationType.SMS,
      title: 'Shipment Picked Up',
      message: `Your shipment ${awb} has been picked up and is in transit.`,
      data,
    });
  }

  async notifyOutForDelivery(userId: string, shipmentId: string, awb: string, riderName: string, riderPhone: string): Promise<void> {
    const data = { awb, riderName, riderPhone };

    await this.sendNotification({
      userId,
      shipmentId,
      type: NotificationType.SMS,
      title: 'Out for Delivery',
      message: `Your shipment ${awb} is out for delivery. Rider: ${riderName} ${riderPhone}`,
      data,
    });

    await this.sendNotification({
      userId,
      shipmentId,
      type: NotificationType.PUSH,
      title: 'Out for Delivery',
      message: `Your shipment ${awb} is out for delivery with ${riderName}`,
      data,
    });

    await this.pushService.sendDeliveryAlert(userId, shipmentId, awb, riderName);
  }

  async notifyDelivered(userId: string, shipmentId: string, awb: string, deliveredAt: string): Promise<void> {
    const data = { awb, deliveredAt };

    await this.sendNotification({
      userId,
      shipmentId,
      type: NotificationType.EMAIL,
      title: 'Shipment Delivered Successfully',
      message: `Your shipment ${awb} has been delivered successfully at ${deliveredAt}.`,
      data,
    });

    await this.sendNotification({
      userId,
      shipmentId,
      type: NotificationType.SMS,
      title: 'Shipment Delivered',
      message: `Your shipment ${awb} has been delivered successfully. Thank you!`,
      data,
    });

    await this.sendNotification({
      userId,
      shipmentId,
      type: NotificationType.PUSH,
      title: 'Delivery Complete',
      message: `Your shipment ${awb} has been delivered successfully!`,
      data,
    });
  }

  async notifyDeliveryFailed(userId: string, shipmentId: string, awb: string, reason: string): Promise<void> {
    const data = { awb, failureReason: reason };

    await this.sendNotification({
      userId,
      shipmentId,
      type: NotificationType.SMS,
      title: 'Delivery Failed',
      message: `Delivery failed for ${awb}. Reason: ${reason}`,
      data,
    });

    await this.sendNotification({
      userId,
      shipmentId,
      type: NotificationType.PUSH,
      title: 'Delivery Failed',
      message: `Delivery attempt failed for ${awb}. We'll retry soon.`,
      data,
    });
  }

  // ==================== User Notification Methods ====================

  async getUserNotifications(userId: string, isRead?: boolean): Promise<Notification[]> {
    const query: any = { userId };
    if (isRead !== undefined) {
      query.isRead = isRead;
    }

    return this.notificationRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Notification not found');
    }
  }

  // ==================== Payment Notifications ====================

  async notifyPayoutInitiated(userId: string, amount: number, transactionId: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: NotificationType.EMAIL,
      title: 'Payout Initiated',
      message: `Your payout of ${amount} BDT has been initiated.`,
      data: { amount, transactionId },
    });

    await this.pushService.sendPaymentNotification(userId, amount, transactionId, 'debit');
  }

  async notifyPayoutCompleted(userId: string, amount: number, transactionId: string, referenceNumber: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: NotificationType.EMAIL,
      title: 'Payout Completed',
      message: `Your payout of ${amount} BDT has been completed. Reference: ${referenceNumber}`,
      data: { amount, transactionId, referenceNumber },
    });

    await this.sendNotification({
      userId,
      type: NotificationType.SMS,
      title: 'Payout Completed',
      message: `Payout completed. ${amount} BDT credited. Ref: ${referenceNumber}`,
      data: { amount, transactionId, referenceNumber },
    });
  }

  // ==================== Rider Notifications ====================

  async notifyPickupAssignment(riderId: string, pickupId: string, address: string, itemCount: number): Promise<void> {
    await this.pushService.sendPickupAssignment(riderId, pickupId, address, itemCount);

    await this.sendNotification({
      userId: riderId,
      type: NotificationType.SMS,
      title: 'New Pickup Assignment',
      message: `You have a new pickup at ${address} with ${itemCount} item(s).`,
      data: { pickupId, address, itemCount },
    });
  }

  async notifyManifestAssignment(riderId: string, manifestId: string, shipmentCount: number): Promise<void> {
    await this.pushService.sendManifestAssignment(riderId, manifestId, shipmentCount);

    await this.sendNotification({
      userId: riderId,
      type: NotificationType.PUSH,
      title: 'New Manifest Assigned',
      message: `You have ${shipmentCount} shipment(s) to deliver.`,
      data: { manifestId, shipmentCount },
    });
  }

  // ==================== Statistics ====================

  async getNotificationStats(userId?: string): Promise<any> {
    const query = userId ? { userId } : {};

    const [total, sent, failed, unread] = await Promise.all([
      this.notificationRepository.count({ where: query }),
      this.notificationRepository.count({ where: { ...query, deliveryStatus: 'sent' } }),
      this.notificationRepository.count({ where: { ...query, deliveryStatus: 'failed' } }),
      userId ? this.notificationRepository.count({ where: { userId, isRead: false } }) : 0,
    ]);

    const byType = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where(userId ? 'notification.userId = :userId' : '1=1', { userId })
      .groupBy('notification.type')
      .getRawMany();

    return {
      total,
      sent,
      failed,
      unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }
}
