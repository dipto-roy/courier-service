export declare class BulkUploadDto {
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
