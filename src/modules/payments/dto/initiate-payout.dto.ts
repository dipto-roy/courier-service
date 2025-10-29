import { IsUUID, IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../common/enums';

export class InitiatePayoutDto {
  @ApiProperty({
    description: 'Merchant user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  merchantId: string;

  @ApiProperty({
    description: 'Payout amount',
    example: 15000.50,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Payment method for payout',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Optional description/note for payout',
    example: 'Weekly payout for COD collections',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Reference number (e.g., bank transaction ID)',
    example: 'BANK-TXN-20250128-001',
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
