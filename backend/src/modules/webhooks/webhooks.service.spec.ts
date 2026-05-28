import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { WebhooksService } from './webhooks.service';

describe('WebhooksService', () => {
  let service: WebhooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhooksService],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  describe('verifyHmac', () => {
    const secret = 'test-secret-key';
    const payload = '{"event":"payment.completed","amount":1500}';

    function sign(p: string, s: string): string {
      return crypto.createHmac('sha256', s).update(p).digest('hex');
    }

    it('passes with valid HMAC signature', () => {
      const signature = sign(payload, secret);
      expect(() =>
        service.verifyHmac(payload, signature, secret),
      ).not.toThrow();
    });

    it('throws UnauthorizedException for tampered payload', () => {
      const signature = sign(payload, secret);
      expect(() =>
        service.verifyHmac(
          '{"event":"payment.completed","amount":9999}',
          signature,
          secret,
        ),
      ).toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong secret', () => {
      const signature = sign(payload, 'wrong-secret');
      expect(() => service.verifyHmac(payload, signature, secret)).toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for empty signature', () => {
      expect(() => service.verifyHmac(payload, '', secret)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('handlePaymentCallback', () => {
    it('returns received: true', () => {
      const result = service.handlePaymentCallback({
        event: 'payment.completed',
        amount: 1500,
      });
      expect(result).toEqual({ received: true });
    });

    it('handles empty payload', () => {
      const result = service.handlePaymentCallback({});
      expect(result).toEqual({ received: true });
    });
  });

  describe('handleCourierCallback', () => {
    it('returns received: true', () => {
      const result = service.handleCourierCallback({
        event: 'shipment.delivered',
        awb: 'FX001',
      });
      expect(result).toEqual({ received: true });
    });
  });
});
