import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher from 'pusher';
import { SendPushNotificationDto } from './dto';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private pusher: Pusher;

  constructor(private configService: ConfigService) {
    this.pusher = new Pusher({
      appId: this.configService.get('PUSHER_APP_ID') || '',
      key: this.configService.get('PUSHER_KEY') || '',
      secret: this.configService.get('PUSHER_SECRET') || '',
      cluster: this.configService.get('PUSHER_CLUSTER') || 'ap2',
      useTLS: true,
    });

    this.logger.log('Push notification service initialized');
  }

  async sendPushNotification(pushDto: SendPushNotificationDto): Promise<boolean> {
    try {
      // Send push notification via Pusher
      await this.pusher.trigger(
        `private-user-${pushDto.userId}`,
        'notification',
        {
          title: pushDto.title,
          body: pushDto.body,
          data: pushDto.data,
          channelId: pushDto.channelId || 'default',
          timestamp: new Date().toISOString(),
        }
      );

      this.logger.log(`Push notification sent to user ${pushDto.userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send push notification to user ${pushDto.userId}:`, error.message);
      throw error;
    }
  }

  async sendToMultipleUsers(userIds: string[], title: string, body: string, data?: any): Promise<boolean> {
    try {
      const channels = userIds.map(userId => `private-user-${userId}`);
      
      await this.pusher.trigger(
        channels,
        'notification',
        {
          title,
          body,
          data,
          timestamp: new Date().toISOString(),
        }
      );

      this.logger.log(`Push notification sent to ${userIds.length} users`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send push notification to multiple users:', error.message);
      throw error;
    }
  }

  async sendShipmentUpdate(userId: string, shipmentId: string, status: string, message: string): Promise<boolean> {
    return this.sendPushNotification({
      userId,
      title: 'Shipment Update',
      body: message,
      data: {
        type: 'shipment_update',
        shipmentId,
        status,
        action: 'VIEW_SHIPMENT',
      },
      channelId: 'shipment-updates',
    });
  }

  async sendDeliveryAlert(userId: string, shipmentId: string, awb: string, riderName: string): Promise<boolean> {
    return this.sendPushNotification({
      userId,
      title: 'Out for Delivery',
      body: `Your shipment ${awb} is out for delivery with ${riderName}`,
      data: {
        type: 'delivery_alert',
        shipmentId,
        awb,
        action: 'TRACK_SHIPMENT',
      },
      channelId: 'delivery-alerts',
    });
  }

  async sendPaymentNotification(userId: string, amount: number, transactionId: string, type: string): Promise<boolean> {
    return this.sendPushNotification({
      userId,
      title: 'Payment Update',
      body: `${type === 'credit' ? 'Received' : 'Paid'} ${amount} BDT`,
      data: {
        type: 'payment_update',
        transactionId,
        amount,
        action: 'VIEW_TRANSACTION',
      },
      channelId: 'payment-updates',
    });
  }

  async sendRiderNotification(riderId: string, title: string, message: string, data?: any): Promise<boolean> {
    try {
      await this.pusher.trigger(
        `private-rider-${riderId}`,
        'rider-notification',
        {
          title,
          body: message,
          data,
          timestamp: new Date().toISOString(),
        }
      );

      this.logger.log(`Rider notification sent to rider ${riderId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send rider notification:`, error.message);
      throw error;
    }
  }

  async sendMerchantNotification(merchantId: string, title: string, message: string, data?: any): Promise<boolean> {
    try {
      await this.pusher.trigger(
        `private-merchant-${merchantId}`,
        'merchant-notification',
        {
          title,
          body: message,
          data,
          timestamp: new Date().toISOString(),
        }
      );

      this.logger.log(`Merchant notification sent to merchant ${merchantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send merchant notification:`, error.message);
      throw error;
    }
  }

  async broadcastSystemNotification(title: string, message: string, data?: any): Promise<boolean> {
    try {
      await this.pusher.trigger(
        'system-notifications',
        'broadcast',
        {
          title,
          body: message,
          data,
          timestamp: new Date().toISOString(),
        }
      );

      this.logger.log('System notification broadcasted');
      return true;
    } catch (error) {
      this.logger.error('Failed to broadcast system notification:', error.message);
      throw error;
    }
  }

  async sendPickupAssignment(riderId: string, pickupId: string, address: string, itemCount: number): Promise<boolean> {
    return this.sendRiderNotification(
      riderId,
      'New Pickup Assignment',
      `You have been assigned a pickup with ${itemCount} item(s) at ${address}`,
      {
        type: 'pickup_assignment',
        pickupId,
        action: 'VIEW_PICKUP',
      }
    );
  }

  async sendManifestAssignment(riderId: string, manifestId: string, shipmentCount: number): Promise<boolean> {
    return this.sendRiderNotification(
      riderId,
      'New Manifest Assigned',
      `You have ${shipmentCount} shipment(s) to deliver`,
      {
        type: 'manifest_assignment',
        manifestId,
        action: 'VIEW_MANIFEST',
      }
    );
  }
}
