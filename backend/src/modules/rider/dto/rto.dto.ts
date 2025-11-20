import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RTOReason {
  CUSTOMER_NOT_AVAILABLE = 'CUSTOMER_NOT_AVAILABLE',
  CUSTOMER_REFUSED = 'CUSTOMER_REFUSED',
  INCORRECT_ADDRESS = 'INCORRECT_ADDRESS',
  CUSTOMER_NOT_REACHABLE = 'CUSTOMER_NOT_REACHABLE',
  MULTIPLE_FAILED_ATTEMPTS = 'MULTIPLE_FAILED_ATTEMPTS',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  DAMAGED_PRODUCT = 'DAMAGED_PRODUCT',
  OTHER = 'OTHER',
}

export class RTODto {
  @ApiProperty({ description: 'Shipment AWB number', example: 'FX20250128000001' })
  @IsString()
  @IsNotEmpty()
  awbNumber: string;

  @ApiProperty({ 
    description: 'Reason for RTO', 
    enum: RTOReason,
    example: RTOReason.MULTIPLE_FAILED_ATTEMPTS 
  })
  @IsEnum(RTOReason)
  @IsNotEmpty()
  reason: RTOReason;

  @ApiPropertyOptional({ description: 'Additional notes about the RTO', example: 'Customer refused to accept after 3 delivery attempts' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
