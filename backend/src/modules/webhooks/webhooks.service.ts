import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  verifyHmac(payload: string, signature: string, secret: string): void {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  handlePaymentCallback(payload: Record<string, unknown>) {
    this.logger.log(`Payment webhook received: ${JSON.stringify(payload)}`);
    // Wire to PaymentsService.recordCodCollection or similar based on event type
    return { received: true };
  }

  handleCourierCallback(payload: Record<string, unknown>) {
    this.logger.log(`Courier webhook received: ${JSON.stringify(payload)}`);
    // Wire to ShipmentsService.updateStatus or TrackingService based on event
    return { received: true };
  }
}
