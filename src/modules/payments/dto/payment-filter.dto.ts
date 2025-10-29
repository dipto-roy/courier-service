import { IsOptional, IsEnum, IsDateString, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../../../common/enums';
import { TransactionType } from '../../../entities/transaction.entity';

export class PaymentFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by merchant user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  merchantId?: string;

  @ApiPropertyOptional({
    description: 'Filter by transaction type',
    enum: TransactionType,
    example: TransactionType.COD_COLLECTION,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({
    description: 'Filter by payment status',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Filter by payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Start date (ISO 8601)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO 8601)',
    example: '2025-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
