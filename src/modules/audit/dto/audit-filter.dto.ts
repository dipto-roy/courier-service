import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';

export class AuditFilterDto {
  @ApiPropertyOptional({
    description: 'User ID who performed the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Type of entity (shipment, user, pickup, etc.)',
    example: 'shipment',
  })
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Specific entity ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  @IsOptional()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Action performed (create, update, delete, status_change, etc.)',
    example: 'update',
  })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO 8601 format)',
    example: '2025-10-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO 8601 format)',
    example: '2025-10-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'IP address filter',
    example: '192.168.1.1',
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}

export class CreateAuditLogDto {
  @ApiPropertyOptional({
    description: 'User ID who performed the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'Type of entity',
    example: 'shipment',
  })
  @IsString()
  entityType: string;

  @ApiPropertyOptional({
    description: 'Entity ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({
    description: 'Action performed',
    example: 'update',
  })
  @IsString()
  action: string;

  @ApiPropertyOptional({
    description: 'Old values before the change',
    example: { status: 'PENDING' },
  })
  @IsOptional()
  oldValues?: any;

  @ApiPropertyOptional({
    description: 'New values after the change',
    example: { status: 'IN_TRANSIT' },
  })
  @IsOptional()
  newValues?: any;

  @ApiPropertyOptional({
    description: 'IP address',
    example: '192.168.1.1',
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent string',
    example: 'Mozilla/5.0...',
  })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Description of the action',
    example: 'Updated shipment status from PENDING to IN_TRANSIT',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
