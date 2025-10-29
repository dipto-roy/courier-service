import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendSmsDto } from './dto';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly senderId: string;

  constructor(private configService: ConfigService) {
    // Configure your SMS gateway (e.g., Twilio, BulkSMS, local BD provider)
    this.apiUrl = this.configService.get('SMS_API_URL') || 'https://api.sms-gateway.com/send';
    this.apiKey = this.configService.get('SMS_API_KEY') || '';
    this.senderId = this.configService.get('SMS_SENDER_ID') || 'FastX';

    this.logger.log('SMS service initialized');
  }

  async sendSms(smsDto: SendSmsDto): Promise<boolean> {
    try {
      let message = smsDto.message;

      // If template is provided, use it
      if (smsDto.template && smsDto.context) {
        message = this.renderTemplate(smsDto.template, smsDto.context);
      }

      // Send SMS via API (example implementation)
      // Replace this with your actual SMS gateway API call
      const response = await this.sendViaGateway(smsDto.to, message);

      this.logger.log(`SMS sent to ${smsDto.to}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${smsDto.to}:`, error.message);
      throw error;
    }
  }

  private async sendViaGateway(to: string, message: string): Promise<boolean> {
    try {
      const smsProvider = this.configService.get('SMS_PROVIDER') || 'log';

      switch (smsProvider) {
        case 'twilio':
          return await this.sendViaTwilio(to, message);
        
        case 'ssl-wireless':
          return await this.sendViaSSLWireless(to, message);
        
        case 'nexmo':
          return await this.sendViaNexmo(to, message);
        
        case 'generic':
          return await this.sendViaGenericAPI(to, message);
        
        default:
          // Log mode for development (no actual SMS sent)
          this.logger.log(`[DEV MODE] SMS would be sent to ${to}: ${message}`);
          return true;
      }
    } catch (error) {
      this.logger.error('SMS gateway error:', error.message);
      throw error;
    }
  }

  /**
   * Send SMS via Twilio (International)
   */
  private async sendViaTwilio(to: string, message: string): Promise<boolean> {
    try {
      const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
      const fromNumber = this.configService.get('TWILIO_PHONE_NUMBER');

      if (!accountSid || !authToken || !fromNumber) {
        throw new Error('Twilio credentials not configured');
      }

      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);

      await client.messages.create({
        body: message,
        from: fromNumber,
        to: to,
      });

      this.logger.log(`SMS sent via Twilio to ${to}`);
      return true;
    } catch (error) {
      this.logger.error('Twilio SMS error:', error.message);
      throw error;
    }
  }

  /**
   * Send SMS via SSL Wireless (Bangladesh)
   */
  private async sendViaSSLWireless(to: string, message: string): Promise<boolean> {
    try {
      const apiToken = this.configService.get('SSL_SMS_API_TOKEN');
      const sid = this.configService.get('SSL_SMS_SID');
      const senderId = this.configService.get('SSL_SMS_SENDER_ID') || this.senderId;

      if (!apiToken || !sid) {
        throw new Error('SSL Wireless credentials not configured');
      }

      const axios = require('axios');
      const response = await axios.post(
        'https://smsplus.sslwireless.com/api/v3/send-sms',
        {
          api_token: apiToken,
          sid: sid,
          sms: message,
          msisdn: to.replace(/^\+880/, ''), // Remove +880 prefix
          csms_id: Date.now().toString(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      if (response.data.status === 'success' || response.data.status === 'SUCCESS') {
        this.logger.log(`SMS sent via SSL Wireless to ${to}`);
        return true;
      } else {
        throw new Error(`SSL Wireless error: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      this.logger.error('SSL Wireless SMS error:', error.message);
      throw error;
    }
  }

  /**
   * Send SMS via Nexmo/Vonage
   */
  private async sendViaNexmo(to: string, message: string): Promise<boolean> {
    try {
      const apiKey = this.configService.get('NEXMO_API_KEY');
      const apiSecret = this.configService.get('NEXMO_API_SECRET');
      const fromName = this.configService.get('NEXMO_FROM_NAME') || this.senderId;

      if (!apiKey || !apiSecret) {
        throw new Error('Nexmo credentials not configured');
      }

      const axios = require('axios');
      const response = await axios.post('https://rest.nexmo.com/sms/json', {
        api_key: apiKey,
        api_secret: apiSecret,
        from: fromName,
        to: to,
        text: message,
      });

      if (response.data.messages[0].status === '0') {
        this.logger.log(`SMS sent via Nexmo to ${to}`);
        return true;
      } else {
        throw new Error(`Nexmo error: ${response.data.messages[0]['error-text']}`);
      }
    } catch (error) {
      this.logger.error('Nexmo SMS error:', error.message);
      throw error;
    }
  }

  /**
   * Send SMS via Generic REST API
   */
  private async sendViaGenericAPI(to: string, message: string): Promise<boolean> {
    try {
      if (!this.apiUrl || !this.apiKey) {
        throw new Error('Generic API credentials not configured');
      }

      const axios = require('axios');
      const response = await axios.post(
        this.apiUrl,
        {
          apiKey: this.apiKey,
          to: to,
          message: message,
          senderId: this.senderId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      this.logger.log(`SMS sent via Generic API to ${to}`);
      return true;
    } catch (error) {
      this.logger.error('Generic API SMS error:', error.message);
      throw error;
    }
  }

  private renderTemplate(templateName: string, context: any): string {
    const templates = {
      'shipment-created': (ctx: any) =>
        `FastX: Your shipment ${ctx.awb} has been created. Track at ${ctx.trackingUrl}`,
      
      'shipment-picked-up': (ctx: any) =>
        `FastX: Shipment ${ctx.awb} picked up and in transit. Expected delivery: ${ctx.expectedDelivery}`,
      
      'out-for-delivery': (ctx: any) =>
        `FastX: Your shipment ${ctx.awb} is out for delivery. Rider: ${ctx.riderName} ${ctx.riderPhone}`,
      
      'delivered': (ctx: any) =>
        `FastX: Shipment ${ctx.awb} delivered successfully at ${ctx.deliveredAt}. Thank you!`,
      
      'failed-delivery': (ctx: any) =>
        `FastX: Delivery failed for ${ctx.awb}. Reason: ${ctx.failureReason}. Contact: ${ctx.supportPhone}`,
      
      'otp-verification': (ctx: any) =>
        `FastX: Your OTP is ${ctx.otp}. Valid for ${ctx.expiryMinutes || 5} minutes. Do not share.`,
      
      'delivery-otp': (ctx: any) =>
        `FastX: Your delivery OTP for ${ctx.awb} is ${ctx.otp}. Share with rider to confirm delivery.`,
      
      'cod-collection': (ctx: any) =>
        `FastX: COD ${ctx.amount} BDT collected for ${ctx.awb}. Transaction ID: ${ctx.transactionId}`,
      
      'payout-initiated': (ctx: any) =>
        `FastX: Payout of ${ctx.amount} BDT initiated. Ref: ${ctx.transactionId}`,
      
      'payout-completed': (ctx: any) =>
        `FastX: Payout completed. ${ctx.amount} BDT credited. Ref: ${ctx.referenceNumber}`,
    };

    const template = templates[templateName];
    if (!template) {
      this.logger.warn(`SMS template ${templateName} not found`);
      return context.message || 'Notification from FastX Courier';
    }

    return template(context);
  }

  async sendBulkSms(recipients: string[], message: string): Promise<boolean> {
    try {
      const promises = recipients.map(phone => 
        this.sendSms({ to: phone, message })
      );
      
      await Promise.all(promises);
      
      this.logger.log(`Bulk SMS sent to ${recipients.length} recipients`);
      return true;
    } catch (error) {
      this.logger.error('Bulk SMS failed:', error.message);
      throw error;
    }
  }

  async sendOtp(phone: string, otp: string): Promise<boolean> {
    return this.sendSms({
      to: phone,
      message: '',
      template: 'otp-verification',
      context: { otp, expiryMinutes: 5 }
    });
  }

  async sendDeliveryOtp(phone: string, awb: string, otp: string): Promise<boolean> {
    return this.sendSms({
      to: phone,
      message: '',
      template: 'delivery-otp',
      context: { awb, otp }
    });
  }
}
