import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';
import { Public } from '../../common/decorators';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Public()
  @Post('payment')
  @ApiOperation({ summary: 'Payment gateway callback (HMAC-verified)' })
  paymentCallback(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET ?? '';
    if (secret) {
      const raw = req.rawBody?.toString('utf8') ?? JSON.stringify(payload);
      this.webhooksService.verifyHmac(raw, signature ?? '', secret);
    }
    return this.webhooksService.handlePaymentCallback(payload);
  }

  @Public()
  @Post('courier')
  @ApiOperation({ summary: 'Courier partner status callback (HMAC-verified)' })
  courierCallback(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const secret = process.env.COURIER_WEBHOOK_SECRET ?? '';
    if (secret) {
      const raw = req.rawBody?.toString('utf8') ?? JSON.stringify(payload);
      this.webhooksService.verifyHmac(raw, signature ?? '', secret);
    }
    return this.webhooksService.handleCourierCallback(payload);
  }
}
