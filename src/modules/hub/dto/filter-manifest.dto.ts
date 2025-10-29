import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ManifestStatus } from '../../../entities/manifest.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterManifestDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by manifest status',
    enum: ManifestStatus,
    example: ManifestStatus.IN_TRANSIT,
  })
  @IsOptional()
  @IsEnum(ManifestStatus)
  status?: ManifestStatus;

  @ApiPropertyOptional({
    description: 'Filter by origin hub',
    example: 'Dhaka Hub',
  })
  @IsOptional()
  @IsString()
  originHub?: string;

  @ApiPropertyOptional({
    description: 'Filter by destination hub',
    example: 'Chittagong Hub',
  })
  @IsOptional()
  @IsString()
  destinationHub?: string;

  @ApiPropertyOptional({
    description: 'Filter by rider ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  riderId?: string;

  @ApiPropertyOptional({
    description: 'Filter from dispatch date (ISO 8601)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter to dispatch date (ISO 8601)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Search by manifest number',
    example: 'MF2025010001',
  })
  @IsOptional()
  @IsString()
  declare search?: string;
}
