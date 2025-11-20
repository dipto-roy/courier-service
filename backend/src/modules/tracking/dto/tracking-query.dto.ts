import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackingQueryDto {
  @ApiProperty({ description: 'Shipment AWB number', example: 'FX20250128000001' })
  @IsString()
  @IsNotEmpty()
  awb: string;

  @ApiPropertyOptional({ 
    description: 'Include GPS tracking data (requires authentication)', 
    example: false,
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  includeGpsTracking?: boolean;

  @ApiPropertyOptional({ 
    description: 'Include detailed status history', 
    example: true,
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  includeHistory?: boolean;
}
