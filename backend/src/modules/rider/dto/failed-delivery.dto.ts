import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FailedDeliveryReason {
  CUSTOMER_NOT_AVAILABLE = 'CUSTOMER_NOT_AVAILABLE',
  CUSTOMER_REFUSED = 'CUSTOMER_REFUSED',
  INCORRECT_ADDRESS = 'INCORRECT_ADDRESS',
  CUSTOMER_REQUESTED_RESCHEDULE = 'CUSTOMER_REQUESTED_RESCHEDULE',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  UNREACHABLE_LOCATION = 'UNREACHABLE_LOCATION',
  BUSINESS_CLOSED = 'BUSINESS_CLOSED',
  OTHER = 'OTHER',
}

export class FailedDeliveryDto {
  @ApiProperty({
    description: 'Shipment AWB number',
    example: 'FX20250128000001',
  })
  @IsString()
  @IsNotEmpty()
  awbNumber: string;

  @ApiProperty({
    description: 'Reason for failed delivery',
    enum: FailedDeliveryReason,
    example: FailedDeliveryReason.CUSTOMER_NOT_AVAILABLE,
  })
  @IsEnum(FailedDeliveryReason)
  @IsNotEmpty()
  reason: FailedDeliveryReason;

  @ApiPropertyOptional({
    description: 'Additional notes about the failed delivery',
    example: 'Called customer multiple times, no response',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Photo evidence URL',
    example: 'https://storage.example.com/failed/abc123.jpg',
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Current latitude', example: 23.8103 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Current longitude', example: 90.4125 })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
