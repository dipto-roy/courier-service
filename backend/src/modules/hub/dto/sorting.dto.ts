import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class SortingDto {
  @ApiProperty({
    description: 'Array of shipment AWB numbers to sort',
    example: ['FXC2025010001', 'FXC2025010002'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  awbNumbers: string[];

  @ApiProperty({
    description: 'Hub location where sorting is performed',
    example: 'Dhaka Hub',
  })
  @IsNotEmpty()
  @IsString()
  hubLocation: string;

  @ApiProperty({
    description: 'Destination hub for routing',
    example: 'Chittagong Hub',
  })
  @IsNotEmpty()
  @IsString()
  destinationHub: string;
}
