import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsObject,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { NotificationType } from '../../../common/enums';

export class SendNotificationDto {
  @ApiProperty({
    description: 'User ID to send notification to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.EMAIL,
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Shipment Delivered Successfully',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Your shipment #AWB123456789 has been delivered successfully.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Related shipment ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  shipmentId?: string;

  @ApiPropertyOptional({
    description: 'Additional data for the notification',
    example: { awb: 'AWB123456789', status: 'DELIVERED' },
  })
  @IsObject()
  @IsOptional()
  data?: any;
}

export class SendEmailDto {
  @ApiProperty({
    description: 'Recipient email address',
    example: 'customer@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'Email subject',
    example: 'Your Shipment Update',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiPropertyOptional({
    description: 'HTML content for email body',
    example: '<h1>Shipment Delivered</h1><p>Your shipment has been delivered.</p>',
  })
  @IsString()
  @IsOptional()
  html?: string;

  @ApiPropertyOptional({
    description: 'Plain text content for email body',
    example: 'Your shipment has been delivered.',
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({
    description: 'Template name to use',
    example: 'shipment-delivered',
  })
  @IsString()
  @IsOptional()
  template?: string;

  @ApiPropertyOptional({
    description: 'Template variables',
    example: { customerName: 'John Doe', awb: 'AWB123456789' },
  })
  @IsObject()
  @IsOptional()
  context?: any;
}

export class SendSmsDto {
  @ApiProperty({
    description: 'Recipient phone number in E.164 format',
    example: '+8801712345678',
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'SMS message content (max 160 characters recommended)',
    example: 'Your shipment AWB123456789 has been delivered. Thank you!',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Template name to use',
    example: 'delivery-notification',
  })
  @IsString()
  @IsOptional()
  template?: string;

  @ApiPropertyOptional({
    description: 'Template variables',
    example: { awb: 'AWB123456789', status: 'Delivered' },
  })
  @IsObject()
  @IsOptional()
  context?: any;
}

export class SendPushNotificationDto {
  @ApiProperty({
    description: 'User ID to send push notification to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Push notification title',
    example: 'Shipment Update',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Push notification body',
    example: 'Your shipment has been delivered!',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    description: 'Additional data payload',
    example: { shipmentId: '123e4567-e89b-12d3-a456-426614174001', action: 'VIEW_SHIPMENT' },
  })
  @IsObject()
  @IsOptional()
  data?: any;

  @ApiPropertyOptional({
    description: 'Push notification channel ID (Android)',
    example: 'shipment-updates',
  })
  @IsString()
  @IsOptional()
  channelId?: string;
}
