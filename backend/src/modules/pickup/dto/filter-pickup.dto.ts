import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto';
import { PickupStatus } from '../../../entities/pickup.entity';

export class FilterPickupDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by merchant ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  merchantId?: string;

  @ApiPropertyOptional({
    description: 'Filter by agent ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({
    enum: PickupStatus,
    description: 'Filter by pickup status',
    example: PickupStatus.PENDING,
  })
  @IsEnum(PickupStatus)
  @IsOptional()
  status?: PickupStatus;

  @ApiPropertyOptional({
    description: 'Filter by pickup city',
    example: 'Dhaka',
  })
  @IsString()
  @IsOptional()
  pickupCity?: string;

  @ApiPropertyOptional({
    description: 'Filter from date (YYYY-MM-DD)',
    example: '2025-10-28',
  })
  @IsString()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter to date (YYYY-MM-DD)',
    example: '2025-10-29',
  })
  @IsString()
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Search by contact person or phone',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  declare search?: string;
}
