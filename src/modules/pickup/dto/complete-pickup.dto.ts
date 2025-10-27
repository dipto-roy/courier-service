import { IsString, IsOptional, IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompletePickupDto {
  @ApiProperty({
    description: 'Array of shipment AWB numbers picked up',
    example: ['FX202510280001', 'FX202510280002'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  shipmentAwbs: string[];

  @ApiPropertyOptional({
    description: 'Signature URL (uploaded to cloud storage)',
    example: 'https://storage.example.com/signatures/pickup-12345.jpg',
  })
  @IsString()
  @IsOptional()
  signatureUrl?: string;

  @ApiPropertyOptional({
    description: 'Photo URL (uploaded to cloud storage)',
    example: 'https://storage.example.com/photos/pickup-12345.jpg',
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'GPS Latitude',
    example: 23.8103,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'GPS Longitude',
    example: 90.4125,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'All shipments collected successfully',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
