import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShipmentStatus } from '../../../common/enums';

export class UpdateStatusDto {
  @ApiProperty({
    enum: ShipmentStatus,
    example: ShipmentStatus.IN_TRANSIT,
    description: 'New shipment status',
  })
  @IsEnum(ShipmentStatus)
  @IsNotEmpty()
  status: ShipmentStatus;

  @ApiPropertyOptional({
    example: 'Package received at hub',
    description: 'Status update remarks',
  })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiPropertyOptional({ example: 'Dhaka Hub', description: 'Current location' })
  @IsString()
  @IsOptional()
  location?: string;
}
