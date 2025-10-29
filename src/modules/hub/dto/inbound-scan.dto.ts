import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class InboundScanDto {
  @ApiProperty({
    description: 'Array of shipment AWB numbers to scan',
    example: ['FXC2025010001', 'FXC2025010002'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  awbNumbers: string[];

  @ApiProperty({
    description: 'Hub location where shipments are being scanned',
    example: 'Dhaka Hub',
  })
  @IsNotEmpty()
  @IsString()
  hubLocation: string;

  @ApiProperty({
    description: 'Source of shipments (pickup/transfer/return)',
    example: 'pickup',
    required: false,
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({
    description: 'Manifest ID if scanning from a manifest',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  manifestId?: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Received in good condition',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
