'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShipmentList, ShipmentFilters, BulkUploadDialog } from '@/src/features/shipments/components';
import { useShipments, useExportShipments } from '@/src/features/shipments/hooks';
import type { ShipmentFiltersFormData } from '@/src/features/shipments/types';
import { Card } from '@/components/ui/card';
import { Package, Upload, Plus, Download } from 'lucide-react';

export default function ShipmentsPage() {
  const [filters, setFilters] = useState<ShipmentFiltersFormData>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const { data, isLoading, error, refetch } = useShipments(filters);
  const { mutate: exportShipments, isPending: isExporting } = useExportShipments();

  const handleFilterChange = (newFilters: ShipmentFiltersFormData) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev: ShipmentFiltersFormData) => ({ ...prev, page }));
  };

  const handleExport = () => {
    exportShipments(filters);
  };

  const handleBulkUploadSuccess = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Shipments</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your shipments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsBulkUploadOpen(true)}
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Link href="/dashboard/shipments/create">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </Link>
        </div>
      </div>

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        onSuccess={handleBulkUploadSuccess}
      />

      {/* Filters */}
      <Card className="p-4">
        <ShipmentFilters
          onFilterChange={handleFilterChange}
          defaultValues={filters}
        />
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">
            {error instanceof Error ? error.message : 'Failed to load shipments'}
          </p>
        </Card>
      )}

      {/* Shipment List */}
      {data && (
        <>
          <div className="text-sm text-muted-foreground">
            Showing {data.data.length} of {data.meta.total} shipments
          </div>
          <ShipmentList
            shipments={data.data}
            currentPage={data.meta.currentPage}
            totalPages={data.meta.totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </>
      )}

      {/* Loading State */}
      {isLoading && !data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && data?.data.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No shipments found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or create a new shipment</p>
        </Card>
      )}
    </div>
  );
}
