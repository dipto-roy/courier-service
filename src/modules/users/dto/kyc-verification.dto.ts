import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class KYCVerificationDto {
  @ApiProperty({ example: true, description: 'KYC verification status' })
  @IsBoolean()
  @IsNotEmpty()
  isKYCVerified: boolean;

  @ApiPropertyOptional({ example: 'KYC documents verified successfully', description: 'Verification remarks' })
  @IsString()
  @IsOptional()
  kycRemarks?: string;
}
