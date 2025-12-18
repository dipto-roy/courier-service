'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CSVUploader } from './CSVUploader';
import { ValidationPreview } from './ValidationPreview';
import { ErrorList } from './ErrorList';
import {
  useBulkUpload,
  useDownloadTemplate,
} from '../hooks';
import { bulkShipmentRowSchema } from '../types';
import type { BulkShipmentRow } from '../types';

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ValidationError {
  row: number;
  field?: string;
  message: string;
}

export function BulkUploadDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkUploadDialogProps) {
  const [, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<BulkShipmentRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    successful: number;
    failed: number;
  } | null>(null);

  const { mutate: bulkUpload, isPending: isUploading } = useBulkUpload();
  const { mutate: downloadTemplate } = useDownloadTemplate();

  const parseCSV = useCallback(async (file: File) => {
    setIsProcessing(true);
    setUploadError(null);
    setValidationErrors([]);
    setParsedData([]);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        setUploadError('CSV file is empty or has no data rows');
        setIsProcessing(false);
        return;
      }

      // Parse CSV (simple parser - assumes no commas in values or proper quoting)
      const headers = lines[0].split(',').map((h) => h.trim());
      const rows: BulkShipmentRow[] = [];
      const errors: ValidationError[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        const rowData: Record<string, string | number> = {};

        headers.forEach((header, index) => {
          const value = values[index];
          // Convert numeric fields
          if (
            [
              'weight',
              'length',
              'width',
              'height',
              'quantity',
              'invoiceValue',
              'codAmount',
            ].includes(header)
          ) {
            rowData[header] = parseFloat(value) || 0;
          } else {
            rowData[header] = value || '';
          }
        });

        // Validate row
        const result = bulkShipmentRowSchema.safeParse(rowData);
        if (result.success) {
          rows.push(result.data);
        } else {
          result.error.issues.forEach((err) => {
            errors.push({
              row: i + 1,
              field: err.path.join('.'),
              message: err.message,
            });
          });
        }
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
      } else {
        setParsedData(rows);
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Failed to parse CSV file'
      );
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      setFile(selectedFile);
      parseCSV(selectedFile);
    },
    [parseCSV]
  );

  const handleUpload = () => {
    if (parsedData.length === 0) return;

    bulkUpload(parsedData, {
      onSuccess: (response) => {
        setUploadSuccess(true);
        setUploadResults({
          successful: response.success.length,
          failed: response.failed.length,
        });
        onSuccess?.();
      },
      onError: (error) => {
        setUploadError(
          error instanceof Error ? error.message : 'Failed to upload shipments'
        );
      },
    });
  };

  const handleClose = () => {
    // Reset state
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadResults(null);
    onOpenChange(false);
  };

  const handleDownloadTemplate = () => {
    downloadTemplate();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Shipments</DialogTitle>
          <DialogDescription>
            Upload a CSV file with multiple shipments. Download the template to see
            the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template Button */}
          <div>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download CSV Template
            </Button>
          </div>

          {/* Success Message */}
          {uploadSuccess && uploadResults && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-green-900">
                    Upload Completed!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Successfully created {uploadResults.successful} shipments.
                    {uploadResults.failed > 0 &&
                      ` ${uploadResults.failed} failed.`}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={handleClose}>Close</Button>
              </div>
            </div>
          )}

          {!uploadSuccess && (
            <>
              {/* CSV Uploader */}
              <CSVUploader
                onFileSelect={handleFileSelect}
                isProcessing={isProcessing}
                error={uploadError}
              />

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <ErrorList errors={validationErrors} />
              )}

              {/* Preview */}
              {parsedData.length > 0 && validationErrors.length === 0 && (
                <>
                  <ValidationPreview data={parsedData} />

                  {/* Upload Button */}
                  <div className="flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={isUploading}>
                      {isUploading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Uploading...
                        </>
                      ) : (
                        `Upload ${parsedData.length} Shipments`
                      )}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
