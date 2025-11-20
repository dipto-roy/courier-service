import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateManifestDto {
  @ApiProperty({
    description: 'Origin hub location',
    example: 'Dhaka Hub',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  originHub: string;

  @ApiProperty({
    description: 'Destination hub location',
    example: 'Chittagong Hub',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  destinationHub: string;

  @ApiProperty({
    description: 'Array of shipment AWB numbers to include in manifest',
    example: ['FXC2025010001', 'FXC2025010002', 'FXC2025010003'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  awbNumbers: string[];

  @ApiProperty({
    description: 'Rider ID if assigning to rider for transport',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  riderId?: string;

  @ApiProperty({
    description: 'Additional notes for the manifest',
    example: 'Express delivery batch',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
