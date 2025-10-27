import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '01712345678', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Password@123', description: 'User password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.MERCHANT, description: 'User role' })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: 'Dhaka', description: 'City name' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Gulshan', description: 'Area name' })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional({ example: 'House 12, Road 5', description: 'Detailed address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'ABC Company Ltd.', description: 'Company name (for Merchant)' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ example: 'www.abccompany.com', description: 'Business website' })
  @IsString()
  @IsOptional()
  businessWebsite?: string;

  @ApiPropertyOptional({ example: true, description: 'Email verification status' })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Phone verification status' })
  @IsBoolean()
  @IsOptional()
  isPhoneVerified?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Account active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 5000, description: 'Wallet balance' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  walletBalance?: number;
}
