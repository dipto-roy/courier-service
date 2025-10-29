import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });

    this.logger.log('Email service initialized');
  }

  async sendEmail(emailDto: SendEmailDto): Promise<boolean> {
    try {
      let emailContent: string;

      // If template is provided, use it
      if (emailDto.template && emailDto.context) {
        emailContent = this.renderTemplate(emailDto.template, emailDto.context);
      } else {
        emailContent = emailDto.html || emailDto.text || '';
      }

      const mailOptions = {
        from: `${this.configService.get('APP_NAME')} <${this.configService.get('EMAIL_USER')}>`,
        to: emailDto.to,
        subject: emailDto.subject,
        html: emailContent,
        text: emailDto.text,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent to ${emailDto.to}: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${emailDto.to}:`, error.message);
      throw error;
    }
  }

  private renderTemplate(templateName: string, context: any): string {
    // Template rendering logic
    const templates = {
      'shipment-created': this.shipmentCreatedTemplate,
      'shipment-picked-up': this.shipmentPickedUpTemplate,
      'shipment-in-transit': this.shipmentInTransitTemplate,
      'shipment-out-for-delivery': this.shipmentOutForDeliveryTemplate,
      'shipment-delivered': this.shipmentDeliveredTemplate,
      'shipment-failed': this.shipmentFailedTemplate,
      'shipment-rto': this.shipmentRtoTemplate,
      'otp-verification': this.otpVerificationTemplate,
      'password-reset': this.passwordResetTemplate,
      'payout-initiated': this.payoutInitiatedTemplate,
      'payout-completed': this.payoutCompletedTemplate,
    };

    const template = templates[templateName];
    if (!template) {
      this.logger.warn(`Template ${templateName} not found, using default`);
      return this.defaultTemplate(context);
    }

    return template(context);
  }

  // Email Templates
  private shipmentCreatedTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Shipment Created Successfully</h1>
            </div>
            <div class="content">
              <p>Dear ${context.customerName},</p>
              <p>Your shipment has been created successfully. Here are the details:</p>
              <div class="details">
                <p><strong>AWB Number:</strong> ${context.awb}</p>
                <p><strong>Pickup Address:</strong> ${context.pickupAddress}</p>
                <p><strong>Delivery Address:</strong> ${context.deliveryAddress}</p>
                <p><strong>Expected Delivery:</strong> ${context.expectedDelivery}</p>
              </div>
              <p>You can track your shipment using the AWB number.</p>
              <p style="text-align: center; margin: 20px 0;">
                <a href="${context.trackingUrl}" class="button">Track Shipment</a>
              </p>
            </div>
            <div class="footer">
              <p>© 2025 FastX Courier. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private shipmentPickedUpTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Shipment Picked Up</h1>
            </div>
            <div class="content">
              <p>Dear ${context.customerName},</p>
              <p>Your shipment <strong>${context.awb}</strong> has been picked up and is now in transit.</p>
              <div class="details">
                <p><strong>Pickup Time:</strong> ${context.pickupTime}</p>
                <p><strong>Current Location:</strong> ${context.currentLocation}</p>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 FastX Courier. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private shipmentInTransitTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>🚚 Shipment In Transit</h2>
            <p>Dear ${context.customerName},</p>
            <p>Your shipment <strong>${context.awb}</strong> is currently in transit.</p>
            <p><strong>Current Hub:</strong> ${context.currentHub}</p>
            <p><strong>Next Hub:</strong> ${context.nextHub}</p>
          </div>
        </body>
      </html>
    `;
  }

  private shipmentOutForDeliveryTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏍️ Out For Delivery</h1>
            </div>
            <div class="content">
              <p>Dear ${context.customerName},</p>
              <p>Great news! Your shipment <strong>${context.awb}</strong> is out for delivery today.</p>
              <div class="details">
                <p><strong>Delivery Rider:</strong> ${context.riderName}</p>
                <p><strong>Rider Phone:</strong> ${context.riderPhone}</p>
                <p><strong>Estimated Delivery:</strong> ${context.estimatedDelivery}</p>
              </div>
              <p>Please keep your phone available and someone ready to receive the shipment.</p>
            </div>
            <div class="footer">
              <p>© 2025 FastX Courier. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private shipmentDeliveredTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Shipment Delivered Successfully</h1>
            </div>
            <div class="content">
              <p>Dear ${context.customerName},</p>
              <p>Your shipment <strong>${context.awb}</strong> has been delivered successfully!</p>
              <div class="details">
                <p><strong>Delivered On:</strong> ${context.deliveredAt}</p>
                <p><strong>Received By:</strong> ${context.receivedBy}</p>
                ${context.codAmount ? `<p><strong>COD Amount Collected:</strong> ${context.codAmount} BDT</p>` : ''}
              </div>
              <p>Thank you for choosing FastX Courier!</p>
            </div>
            <div class="footer">
              <p>© 2025 FastX Courier. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private shipmentFailedTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f44336; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Delivery Attempt Failed</h1>
            </div>
            <div class="content">
              <p>Dear ${context.customerName},</p>
              <p>We attempted to deliver your shipment <strong>${context.awb}</strong>, but the delivery failed.</p>
              <div class="details">
                <p><strong>Reason:</strong> ${context.failureReason}</p>
                <p><strong>Attempt Date:</strong> ${context.attemptDate}</p>
                <p><strong>Next Attempt:</strong> ${context.nextAttempt || 'Contact us to reschedule'}</p>
              </div>
              <p>Please contact our customer service for assistance.</p>
            </div>
            <div class="footer">
              <p>© 2025 FastX Courier. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private shipmentRtoTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>↩️ Shipment Returning to Origin</h2>
            <p>Dear ${context.customerName},</p>
            <p>Your shipment <strong>${context.awb}</strong> is being returned to the sender.</p>
            <p><strong>Reason:</strong> ${context.rtoReason}</p>
          </div>
        </body>
      </html>
    `;
  }

  private otpVerificationTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #9C27B0; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .otp { font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background-color: white; margin: 20px 0; border-radius: 8px; letter-spacing: 8px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 OTP Verification</h1>
            </div>
            <div class="content">
              <p>Dear ${context.userName || 'User'},</p>
              <p>Your OTP for verification is:</p>
              <div class="otp">${context.otp}</div>
              <p style="text-align: center; color: #666;">This OTP will expire in ${context.expiryMinutes || 5} minutes.</p>
              <p style="color: #f44336; text-align: center;"><strong>Do not share this OTP with anyone.</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 FastX Courier. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private passwordResetTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>🔑 Password Reset Request</h2>
            <p>Dear ${context.userName},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${context.resetUrl}" style="background-color: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666;">This link will expire in ${context.expiryHours || 1} hour(s).</p>
            <p style="color: #f44336;">If you didn't request this, please ignore this email.</p>
          </div>
        </body>
      </html>
    `;
  }

  private payoutInitiatedTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>💰 Payout Initiated</h2>
            <p>Dear ${context.merchantName},</p>
            <p>A payout has been initiated to your account.</p>
            <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0;">
              <p><strong>Amount:</strong> ${context.amount} BDT</p>
              <p><strong>Transaction ID:</strong> ${context.transactionId}</p>
              <p><strong>Expected Credit:</strong> ${context.expectedCredit}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private payoutCompletedTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>✅ Payout Completed</h2>
            <p>Dear ${context.merchantName},</p>
            <p>Your payout has been completed successfully.</p>
            <div style="background-color: #e8f5e9; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50;">
              <p><strong>Amount:</strong> ${context.amount} BDT</p>
              <p><strong>Transaction ID:</strong> ${context.transactionId}</p>
              <p><strong>Reference Number:</strong> ${context.referenceNumber}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private defaultTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>${context.title || 'Notification'}</h2>
            <p>${context.message || ''}</p>
          </div>
        </body>
      </html>
    `;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email service connection verified');
      return true;
    } catch (error) {
      this.logger.error('Email service connection failed:', error.message);
      return false;
    }
  }
}
