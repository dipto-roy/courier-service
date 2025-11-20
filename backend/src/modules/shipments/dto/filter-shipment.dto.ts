import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto';
import { ShipmentStatus, DeliveryType, PaymentMethod, PaymentStatus } from '../../../common/enums';

export class FilterShipmentDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'FX20251028', description: 'Search by AWB number' })
  @IsString()
  @IsOptional()
  awb?: string;

  @ApiPropertyOptional({ example: 'merchant-uuid', description: 'Filter by merchant ID' })
  @IsString()
  @IsOptional()
  merchantId?: string;

  @ApiPropertyOptional({
    enum: ShipmentStatus,
    example: ShipmentStatus.PENDING,
    description: 'Filter by status',
  })
  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus;

  @ApiPropertyOptional({
    enum: DeliveryType,
    example: DeliveryType.NORMAL,
    description: 'Filter by delivery type',
  })
  @IsEnum(DeliveryType)
  @IsOptional()
  deliveryType?: DeliveryType;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    example: PaymentMethod.COD,
    description: 'Filter by payment method',
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
    description: 'Filter by payment status',
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ example: 'Dhaka', description: 'Filter by receiver city' })
  @IsString()
  @IsOptional()
  receiverCity?: string;

  @ApiPropertyOptional({ example: '2025-10-28', description: 'Filter from date (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2025-10-29', description: 'Filter to date (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Search by receiver name or phone' })
  @IsString()
  @IsOptional()
  declare search?: string;
}
