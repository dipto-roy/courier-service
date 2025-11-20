import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class OutboundScanDto {
  @ApiProperty({
    description: 'Array of shipment AWB numbers to scan for dispatch',
    example: ['FXC2025010001', 'FXC2025010002'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  awbNumbers: string[];

  @ApiProperty({
    description: 'Origin hub location',
    example: 'Dhaka Hub',
  })
  @IsNotEmpty()
  @IsString()
  originHub: string;

  @ApiProperty({
    description: 'Destination hub location (for hub-to-hub transfer)',
    example: 'Chittagong Hub',
    required: false,
  })
  @IsOptional()
  @IsString()
  destinationHub?: string;

  @ApiProperty({
    description: 'Rider ID if assigning to rider for delivery',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  riderId?: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Dispatched via regular route',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
