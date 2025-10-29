import { IsNumber, IsOptional, Min, Max, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({ description: 'Latitude coordinate', example: 23.8103 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate', example: 90.4125 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ description: 'Location accuracy in meters', example: 10.5 })
  @IsNumber()
  @IsOptional()
  accuracy?: number;

  @ApiPropertyOptional({ description: 'Speed in meters per second', example: 15.2 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  speed?: number;

  @ApiPropertyOptional({ description: 'Heading/direction in degrees (0-360)', example: 270 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(360)
  heading?: number;

  @ApiPropertyOptional({ description: 'Battery level percentage (0-100)', example: 85 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @ApiPropertyOptional({ description: 'Current shipment AWB being delivered', example: 'FX20250128000001' })
  @IsOptional()
  shipmentAwb?: string;

  @ApiPropertyOptional({ description: 'Is rider online', example: true })
  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;
}
