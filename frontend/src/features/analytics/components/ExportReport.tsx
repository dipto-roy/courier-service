import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExportReport, useDownloadReport } from '@/src/services/analytics/hooks';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import type {
  AnalyticsFilters,
  ReportType,
  ExportFormat,
} from '@/src/services/analytics/types';

interface ExportReportProps {
  filters?: AnalyticsFilters;
}

export function ExportReport({ filters }: ExportReportProps) {
  const [reportType, setReportType] = useState<ReportType>('shipment' as ReportType);
  const [format, setFormat] = useState<ExportFormat>('csv' as ExportFormat);

  const { mutate: exportReport, isPending: isExporting } = useExportReport();
  const { mutate: downloadReport, isPending: isDownloading } = useDownloadReport();

  const handleExport = () => {
    exportReport(
      {
        reportType,
        format,
        filters,
        includeCharts: format === 'pdf',
      },
      {
        onSuccess: (response) => {
          // Auto-download the file
          downloadReport(response.url);
        },
        onError: (error) => {
          console.error('Export failed:', error);
          alert('Failed to export report. Please try again.');
        },
      }
    );
  };

  const isLoading = isExporting || isDownloading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Report Type
            </label>
            <Select
              value={reportType}
              onValueChange={(value) => setReportType(value as ReportType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shipment">Shipment Report</SelectItem>
                <SelectItem value="revenue">Revenue Report</SelectItem>
                <SelectItem value="performance">Performance Report</SelectItem>
                <SelectItem value="cod">COD Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Format</label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as ExportFormat)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleExport}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isExporting ? 'Generating...' : 'Downloading...'}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Reports include data based on your current filters
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
