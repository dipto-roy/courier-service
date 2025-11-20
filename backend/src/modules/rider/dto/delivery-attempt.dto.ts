import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeliveryAttemptDto {
  @ApiProperty({ description: 'Shipment AWB number', example: 'FX20250128000001' })
  @IsString()
  @IsNotEmpty()
  awbNumber: string;

  @ApiProperty({ description: 'Customer OTP for verification', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  otpCode: string;

  @ApiPropertyOptional({ description: 'Signature image URL', example: 'https://storage.example.com/signatures/abc123.jpg' })
  @IsString()
  @IsOptional()
  signatureUrl?: string;

  @ApiPropertyOptional({ description: 'POD (Proof of Delivery) photo URL', example: 'https://storage.example.com/pod/xyz789.jpg' })
  @IsString()
  @IsOptional()
  podPhotoUrl?: string;

  @ApiPropertyOptional({ description: 'COD amount collected from customer', example: 1500 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  codAmountCollected?: number;

  @ApiPropertyOptional({ description: 'Delivery notes from rider', example: 'Customer requested to leave at security desk' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  deliveryNote?: string;

  @ApiPropertyOptional({ description: 'Current latitude', example: 23.8103 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Current longitude', example: 90.4125 })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
