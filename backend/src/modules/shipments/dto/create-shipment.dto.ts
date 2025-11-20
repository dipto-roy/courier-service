import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DeliveryType, PaymentMethod } from '../../../common/enums';

class AddressDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '01712345678', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Dhaka', description: 'City name' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Gulshan', description: 'Area name' })
  @IsString()
  @IsNotEmpty()
  area: string;

  @ApiProperty({ example: 'House 12, Road 5', description: 'Full address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({
    example: 23.7808875,
    description: 'Latitude coordinate',
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    example: 90.4161712,
    description: 'Longitude coordinate',
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class CreateShipmentDto {
  @ApiProperty({ type: AddressDto, description: 'Sender information' })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  sender: AddressDto;

  @ApiProperty({ type: AddressDto, description: 'Receiver information' })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  receiver: AddressDto;

  @ApiProperty({
    enum: DeliveryType,
    example: DeliveryType.NORMAL,
    description: 'Delivery type',
  })
  @IsEnum(DeliveryType)
  @IsNotEmpty()
  deliveryType: DeliveryType;

  @ApiProperty({
    example: 1.5,
    description: 'Package weight in kg (0.1 - 50)',
  })
  @IsNumber()
  @Min(0.1)
  @Max(50)
  @IsNotEmpty()
  weight: number;

  @ApiPropertyOptional({
    example: 'Electronics',
    description: 'Product category',
  })
  @IsString()
  @IsOptional()
  productCategory?: string;

  @ApiPropertyOptional({
    example: 'Samsung Galaxy Phone',
    description: 'Product description',
  })
  @IsString()
  @IsOptional()
  productDescription?: string;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Declared value of product',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  declaredValue?: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.COD,
    description: 'Payment method',
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    example: 2500,
    description: 'COD amount to collect',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  codAmount?: number;

  @ApiPropertyOptional({
    example: 'Handle with care',
    description: 'Special instructions',
  })
  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @ApiPropertyOptional({
    example: 'INV-12345',
    description: 'Merchant invoice number',
  })
  @IsString()
  @IsOptional()
  merchantInvoice?: string;
}
