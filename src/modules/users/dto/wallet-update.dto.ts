import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WalletOperationType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export class WalletUpdateDto {
  @ApiProperty({ enum: WalletOperationType, example: WalletOperationType.CREDIT, description: 'Operation type' })
  @IsEnum(WalletOperationType)
  @IsNotEmpty()
  operation: WalletOperationType;

  @ApiProperty({ example: 1000, description: 'Amount to credit or debit' })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ example: 'Payment for delivery charges', description: 'Transaction remarks' })
  @IsString()
  @IsOptional()
  remarks?: string;
}
