import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                EMAIL_HOST: 'smtp.gmail.com',
                EMAIL_PORT: 587,
                EMAIL_USER: 'test@example.com',
                EMAIL_PASSWORD: 'test-password',
                APP_NAME: 'FastX Courier Test',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Email Templates', () => {
    it('should render shipment-created template', async () => {
      const context = {
        customerName: 'John Doe',
        awb: 'FX123456789',
        pickupAddress: '123 Test St',
        deliveryAddress: '456 Test Ave',
        expectedDelivery: '2025-10-31',
        trackingUrl: 'https://track.example.com/FX123456789',
      };

      // Access private method via reflection for testing
      const template = service['shipmentCreatedTemplate'](context);

      expect(template).toContain('Shipment Created Successfully');
      expect(template).toContain('John Doe');
      expect(template).toContain('FX123456789');
      expect(template).toContain('123 Test St');
    });

    it('should render shipment-delivered template', async () => {
      const context = {
        customerName: 'Jane Smith',
        awb: 'FX987654321',
        deliveredAt: '2025-10-30 14:30',
        receivedBy: 'John Doe',
        codAmount: 1500,
      };

      const template = service['shipmentDeliveredTemplate'](context);

      expect(template).toContain('Shipment Delivered Successfully');
      expect(template).toContain('Jane Smith');
      expect(template).toContain('FX987654321');
      expect(template).toContain('1500 BDT');
    });

    it('should render OTP template', async () => {
      const context = {
        userName: 'Test User',
        otp: '123456',
        expiryMinutes: 5,
      };

      const template = service['otpVerificationTemplate'](context);

      expect(template).toContain('OTP Verification');
      expect(template).toContain('123456');
      expect(template).toContain('5 minutes');
    });

    it('should render password reset template', async () => {
      const context = {
        userName: 'Test User',
        resetUrl: 'https://example.com/reset/token',
        expiryHours: 1,
      };

      const template = service['passwordResetTemplate'](context);

      expect(template).toContain('Password Reset Request');
      expect(template).toContain('Test User');
      expect(template).toContain('https://example.com/reset/token');
    });

    it('should use default template for unknown template', () => {
      const context = {
        title: 'Test Title',
        message: 'Test Message',
      };

      const template = service['renderTemplate']('unknown-template', context);

      expect(template).toContain('Test Title');
      expect(template).toContain('Test Message');
    });
  });

  describe('Email Sending', () => {
    it('should send email with HTML content', async () => {
      // Mock transporter
      service['transporter'].sendMail = jest.fn().mockResolvedValue({
        messageId: 'test-message-id',
      });

      const result = await service.sendEmail({
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>',
        text: 'Test',
      });

      expect(result).toBe(true);
      expect(service['transporter'].sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Test Email',
          html: '<h1>Test</h1>',
        }),
      );
    });

    it('should send email with template', async () => {
      service['transporter'].sendMail = jest.fn().mockResolvedValue({
        messageId: 'test-message-id',
      });

      const result = await service.sendEmail({
        to: 'user@example.com',
        subject: 'Shipment Created',
        template: 'shipment-created',
        context: {
          customerName: 'John',
          awb: 'FX123',
          pickupAddress: 'Test St',
          deliveryAddress: 'Test Ave',
          expectedDelivery: '2025-10-31',
          trackingUrl: 'https://track.example.com/FX123',
        },
      });

      expect(result).toBe(true);
      expect(service['transporter'].sendMail).toHaveBeenCalled();
    });

    it('should handle email sending errors', async () => {
      service['transporter'].sendMail = jest
        .fn()
        .mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendEmail({
          to: 'user@example.com',
          subject: 'Test',
          html: 'Test',
        }),
      ).rejects.toThrow('SMTP error');
    });
  });

  describe('Connection Verification', () => {
    it('should verify email connection successfully', async () => {
      service['transporter'].verify = jest.fn().mockResolvedValue(true);

      const result = await service.verifyConnection();

      expect(result).toBe(true);
    });

    it('should return false on connection failure', async () => {
      service['transporter'].verify = jest
        .fn()
        .mockRejectedValue(new Error('Connection failed'));

      const result = await service.verifyConnection();

      expect(result).toBe(false);
    });
  });
});
