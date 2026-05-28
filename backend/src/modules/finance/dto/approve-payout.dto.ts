import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApprovePayoutDto {
  @ApiPropertyOptional({ example: 'TXN-REF-12345' })
  @IsString()
  @IsOptional()
  referenceNumber?: string;
}
