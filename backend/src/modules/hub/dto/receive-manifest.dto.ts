import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReceiveManifestDto {
  @ApiProperty({
    description: 'Array of shipment AWB numbers actually received (may differ from manifest)',
    example: ['FXC2025010001', 'FXC2025010002'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  receivedAwbNumbers: string[];

  @ApiProperty({
    description: 'Hub location where manifest is being received',
    example: 'Chittagong Hub',
  })
  @IsNotEmpty()
  @IsString()
  hubLocation: string;

  @ApiProperty({
    description: 'Notes about condition or discrepancies',
    example: 'All shipments received in good condition',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
