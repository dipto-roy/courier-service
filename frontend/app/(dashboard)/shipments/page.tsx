'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShipmentList, ShipmentFilters, BulkUploadDialog } from '@/src/features/shipments/components';
import { useShipments, useExportShipments } from '@/src/features/shipments/hooks';
import type { ShipmentFiltersFormData } from '@/src/features/shipments/types';

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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
          <p className="text-gray-600">
            Manage and track all your shipments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsBulkUploadOpen(true)}
          >
            Bulk Upload
          </Button>
          <Link href="/dashboard/shipments/create">
            <Button>Create Shipment</Button>
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
      <ShipmentFilters
        onFilterChange={handleFilterChange}
        defaultValues={filters}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">
            {error instanceof Error ? error.message : 'Failed to load shipments'}
          </p>
        </div>
      )}

      {/* Shipment List */}
      {data && (
        <>
          <div className="mb-4 text-sm text-gray-600">
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
              className="h-48 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
}
