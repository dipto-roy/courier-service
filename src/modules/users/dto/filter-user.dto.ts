import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto';
import { UserRole } from '../../../common/enums';

export class FilterUserDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Search by name, email, or phone' })
  @IsString()
  @IsOptional()
  declare search?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.MERCHANT, description: 'Filter by role' })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Filter by email verification status' })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Filter by phone verification status' })
  @IsBoolean()
  @IsOptional()
  isPhoneVerified?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Filter by KYC verification status' })
  @IsBoolean()
  @IsOptional()
  isKYCVerified?: boolean;

  @ApiPropertyOptional({ example: 'Dhaka', description: 'Filter by city' })
  @IsString()
  @IsOptional()
  city?: string;
}
