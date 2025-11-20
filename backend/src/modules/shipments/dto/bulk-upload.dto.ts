import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'CSV file with shipment data',
  })
  @IsNotEmpty()
  file: any;
}

export interface BulkUploadResult {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: Array<{
    row: number;
    awb?: string;
    error: string;
  }>;
  shipments: Array<{
    awb: string;
    receiverName: string;
    receiverPhone: string;
  }>;
}
