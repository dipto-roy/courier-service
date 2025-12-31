'use client';

import { ShipmentCard } from './ShipmentCard';
import { Button } from '@/components/ui/button';
import type { Shipment } from '@/src/common/types';

interface ShipmentListProps {
  shipments: Shipment[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function ShipmentList({
  shipments,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: ShipmentListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-48 bg-gray-100 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (shipments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No shipments found</p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your filters or create a new shipment
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Shipment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {shipments.map((shipment) => (
          <ShipmentCard key={shipment.id} shipment={shipment} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => onPageChange(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page}>...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
