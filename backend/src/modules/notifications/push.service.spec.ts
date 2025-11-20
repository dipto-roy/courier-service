import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PushService } from './push.service';

describe('PushService', () => {
  let service: PushService;
  let mockPusher: any;

  beforeEach(async () => {
    mockPusher = {
      trigger: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                PUSHER_APP_ID: 'test-app-id',
                PUSHER_KEY: 'test-key',
                PUSHER_SECRET: 'test-secret',
                PUSHER_CLUSTER: 'ap2',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PushService>(PushService);
    service['pusher'] = mockPusher;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Push Notifications', () => {
    it('should send push notification to user', async () => {
      const result = await service.sendPushNotification({
        userId: 'user-123',
        title: 'Test Notification',
        body: 'This is a test',
        data: { test: true },
      });

      expect(result).toBe(true);
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        'private-user-user-123',
        'notification',
        expect.objectContaining({
          title: 'Test Notification',
          body: 'This is a test',
        }),
      );
    });

    it('should send notification to multiple users', async () => {
      const userIds = ['user-1', 'user-2', 'user-3'];

      const result = await service.sendToMultipleUsers(
        userIds,
        'Test',
        'Message',
        { test: true },
      );

      expect(result).toBe(true);
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        ['private-user-user-1', 'private-user-user-2', 'private-user-user-3'],
        'notification',
        expect.any(Object),
      );
    });
  });

  describe('Shipment Notifications', () => {
    it('should send shipment update notification', async () => {
      const result = await service.sendShipmentUpdate(
        'user-123',
        'shipment-456',
        'delivered',
        'Your shipment has been delivered',
      );

      expect(result).toBe(true);
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        'private-user-user-123',
        'notification',
        expect.objectContaining({
          title: 'Shipment Update',
          data: expect.objectContaining({
            type: 'shipment_update',
            shipmentId: 'shipment-456',
            status: 'delivered',
          }),
        }),
      );
    });

    it('should send delivery alert', async () => {
      const result = await service.sendDeliveryAlert(
        'user-123',
        'shipment-456',
        'FX123456789',
        'John Rider',
      );

      expect(result).toBe(true);
      expect(mockPusher.trigger).toHaveBeenCalled();
    });
  });

  describe('Payment Notifications', () => {
    it('should send payment notification', async () => {
      const result = await service.sendPaymentNotification(
        'user-123',
        1500,
        'txn-789',
        'credit',
      );

      expect(result).toBe(true);
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        'private-user-user-123',
        'notification',
        expect.objectContaining({
          title: 'Payment Update',
          body: 'Received 1500 BDT',
        }),
      );
    });
  });

  describe('Rider Notifications', () => {
    it('should send rider notification', async () => {
      const result = await service.sendRiderNotification(
        'rider-123',
        'New Task',
        'You have a new task',
        { taskId: 'task-456' },
      );

      expect(result).toBe(true);
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        'private-rider-rider-123',
        'rider-notification',
        expect.any(Object),
      );
    });

    it('should send pickup assignment', async () => {
      const result = await service.sendPickupAssignment(
        'rider-123',
        'pickup-456',
        '123 Test St',
        5,
      );

      expect(result).toBe(true);
      expect(mockPusher.trigger).toHaveBeenCalled();
    });

    it('should send manifest assignment', async () => {
      const result = await service.sendManifestAssignment(
        'rider-123',
        'manifest-456',
        10,
      );

      expect(result).toBe(true);
      expect(mockPusher.trigger).toHaveBeenCalled();
    });
  });

  describe('Merchant Notifications', () => {
    it('should send merchant notification', async () => {
      const result = await service.sendMerchantNotification(
        'merchant-123',
        'Payout Update',
        'Your payout has been processed',
        { amount: 5000 },
      );

      expect(result).toBe(true);
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        'private-merchant-merchant-123',
        'merchant-notification',
        expect.any(Object),
      );
    });
  });

  describe('System Notifications', () => {
    it('should broadcast system notification', async () => {
      const result = await service.broadcastSystemNotification(
        'System Maintenance',
        'System will be down for maintenance',
        { scheduledAt: '2025-11-01 02:00' },
      );

      expect(result).toBe(true);
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        'system-notifications',
        'broadcast',
        expect.any(Object),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle push notification errors', async () => {
      mockPusher.trigger.mockRejectedValueOnce(new Error('Pusher error'));

      await expect(
        service.sendPushNotification({
          userId: 'user-123',
          title: 'Test',
          body: 'Test',
        }),
      ).rejects.toThrow('Pusher error');
    });
  });
});
