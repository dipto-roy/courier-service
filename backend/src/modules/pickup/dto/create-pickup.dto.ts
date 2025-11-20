import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePickupDto {
  @ApiProperty({
    description: 'Pickup address',
    example: '123 Main Street, Apartment 4B',
  })
  @IsString()
  @IsNotEmpty()
  pickupAddress: string;

  @ApiProperty({
    description: 'Pickup city',
    example: 'Dhaka',
  })
  @IsString()
  @IsNotEmpty()
  pickupCity: string;

  @ApiProperty({
    description: 'Pickup area',
    example: 'Gulshan',
  })
  @IsString()
  @IsNotEmpty()
  pickupArea: string;

  @ApiProperty({
    description: 'Scheduled pickup date (ISO 8601 format)',
    example: '2025-10-28T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiProperty({
    description: 'Contact person name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+8801712345678',
  })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @ApiProperty({
    description: 'Total number of shipments to pickup',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  totalShipments: number;

  @ApiPropertyOptional({
    description: 'Additional notes or instructions',
    example: 'Please call before arrival',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
