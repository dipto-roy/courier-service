import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service';

describe('SmsService', () => {
  let service: SmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                SMS_PROVIDER: 'log',
                SMS_SENDER_ID: 'FastX',
                SMS_API_URL: 'https://api.test.com',
                SMS_API_KEY: 'test-key',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SmsService>(SmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('SMS Templates', () => {
    it('should render shipment-created template', () => {
      const context = {
        awb: 'FX123456789',
        trackingUrl: 'https://track.example.com/FX123456789',
      };

      const message = service['renderTemplate']('shipment-created', context);

      expect(message).toContain('FX123456789');
      expect(message).toContain('created');
    });

    it('should render OTP template', () => {
      const context = {
        otp: '123456',
        expiryMinutes: 5,
      };

      const message = service['renderTemplate']('otp-verification', context);

      expect(message).toContain('123456');
      expect(message).toContain('5 minutes');
    });

    it('should render out-for-delivery template', () => {
      const context = {
        awb: 'FX123456789',
        riderName: 'John Rider',
        riderPhone: '+8801712345678',
      };

      const message = service['renderTemplate']('out-for-delivery', context);

      expect(message).toContain('FX123456789');
      expect(message).toContain('John Rider');
      expect(message).toContain('+8801712345678');
    });

    it('should return default message for unknown template', () => {
      const context = {
        message: 'Custom message',
      };

      const message = service['renderTemplate']('unknown-template', context);

      expect(message).toContain('Notification from FastX Courier');
    });
  });

  describe('SMS Sending (Log Mode)', () => {
    it('should send SMS in log mode', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');

      const result = await service.sendSms({
        to: '+8801712345678',
        message: 'Test SMS',
      });

      expect(result).toBe(true);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEV MODE] SMS would be sent to +8801712345678'),
      );
    });

    it('should send SMS with template', async () => {
      const result = await service.sendSms({
        to: '+8801712345678',
        message: '',
        template: 'otp-verification',
        context: { otp: '123456' },
      });

      expect(result).toBe(true);
    });
  });

  describe('OTP Sending', () => {
    it('should send OTP SMS', async () => {
      const result = await service.sendOtp('+8801712345678', '123456');

      expect(result).toBe(true);
    });

    it('should send delivery OTP', async () => {
      const result = await service.sendDeliveryOtp(
        '+8801712345678',
        'FX123456789',
        '123456',
      );

      expect(result).toBe(true);
    });
  });

  describe('Bulk SMS', () => {
    it('should send bulk SMS to multiple recipients', async () => {
      const recipients = ['+8801712345678', '+8801812345678', '+8801912345678'];

      const result = await service.sendBulkSms(recipients, 'Test bulk SMS');

      expect(result).toBe(true);
    });

    it('should handle bulk SMS errors', async () => {
      jest.spyOn(service, 'sendSms').mockRejectedValueOnce(new Error('SMS failed'));

      const recipients = ['+8801712345678'];

      await expect(service.sendBulkSms(recipients, 'Test')).rejects.toThrow(
        'Bulk SMS failed',
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle SMS sending errors gracefully', async () => {
      jest
        .spyOn(service, 'sendViaGateway' as any)
        .mockRejectedValueOnce(new Error('Gateway error'));

      await expect(
        service.sendSms({
          to: '+8801712345678',
          message: 'Test',
        }),
      ).rejects.toThrow('Gateway error');
    });
  });
});
