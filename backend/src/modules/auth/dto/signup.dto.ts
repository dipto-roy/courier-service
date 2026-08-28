import {
  IsEmail,
  IsString,
  MinLength,
  IsIn,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

/**
 * Roles a stranger may claim on the public signup endpoint. Staff roles
 * (ADMIN, AGENT, HUB_STAFF, FINANCE, SUPPORT) are provisioned by an admin —
 * accepting the whole UserRole enum here would let anyone self-register as one.
 */
export const PUBLIC_SIGNUP_ROLES: readonly UserRole[] = [
  UserRole.CUSTOMER,
  UserRole.MERCHANT,
  UserRole.RIDER,
];

export class SignupDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '01712345678' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    enum: PUBLIC_SIGNUP_ROLES,
    default: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsIn(PUBLIC_SIGNUP_ROLES, {
    message: `role must be one of: ${PUBLIC_SIGNUP_ROLES.join(', ')}`,
  })
  role?: UserRole;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Gulshan' })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional({ example: 'House 10, Road 5, Gulshan-1' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'FastX Mart', description: 'For merchants' })
  @IsOptional()
  @IsString()
  merchantBusinessName?: string;
}
