import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DeliveryType, PaymentMethod, ShipmentStatus } from '../../../common/enums';

class UpdateAddressDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '01712345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Gulshan' })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional({ example: 'House 12, Road 5' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 23.7808875 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 90.4161712 })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class UpdateShipmentDto {
  @ApiPropertyOptional({ type: UpdateAddressDto })
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  @IsOptional()
  sender?: UpdateAddressDto;

  @ApiPropertyOptional({ type: UpdateAddressDto })
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  @IsOptional()
  receiver?: UpdateAddressDto;

  @ApiPropertyOptional({ enum: DeliveryType })
  @IsEnum(DeliveryType)
  @IsOptional()
  deliveryType?: DeliveryType;

  @ApiPropertyOptional({ example: 1.5 })
  @IsNumber()
  @Min(0.1)
  @Max(50)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ example: 'Electronics' })
  @IsString()
  @IsOptional()
  productCategory?: string;

  @ApiPropertyOptional({ example: 'Samsung Galaxy Phone' })
  @IsString()
  @IsOptional()
  productDescription?: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  declaredValue?: number;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 2500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  codAmount?: number;

  @ApiPropertyOptional({ example: 'Handle with care' })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}
