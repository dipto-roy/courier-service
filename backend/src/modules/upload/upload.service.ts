import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { parse } from 'csv-parse/sync';

export interface CsvShipmentRow {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  weight: string;
  codAmount: string;
  serviceType: string;
}

const REQUIRED_COLUMNS: (keyof CsvShipmentRow)[] = [
  'senderName',
  'senderPhone',
  'senderAddress',
  'receiverName',
  'receiverPhone',
  'receiverAddress',
  'receiverCity',
];

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  parseCsvShipments(buffer: Buffer): CsvShipmentRow[] {
    let rows: Record<string, string>[];

    try {
      rows = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (err) {
      throw new BadRequestException(
        `CSV parse error: ${(err as Error).message}`,
      );
    }

    if (rows.length === 0) {
      throw new BadRequestException('CSV file is empty');
    }

    if (rows.length > 500) {
      throw new BadRequestException('CSV exceeds 500 row limit per upload');
    }

    const missing = REQUIRED_COLUMNS.filter((col) => !(col in rows[0]));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing required columns: ${missing.join(', ')}`,
      );
    }

    this.logger.log(`Parsed ${rows.length} shipment rows from CSV`);
    return rows as unknown as CsvShipmentRow[];
  }

  buildFileResponse(file: Express.Multer.File) {
    return {
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      storedPath: file.path ?? null,
      buffer: file.path ? undefined : file.buffer?.toString('base64'),
    };
  }
}
