import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateOTPDto {
  @ApiProperty({ description: 'Shipment AWB number', example: 'FX20250128000001' })
  @IsString()
  @IsNotEmpty()
  awbNumber: string;
}
