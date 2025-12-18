'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  shipmentFiltersSchema,
  type ShipmentFiltersFormData,
} from '../types';
import { ShipmentStatus } from '@/src/common/types';

interface ShipmentFiltersProps {
  onFilterChange: (filters: ShipmentFiltersFormData) => void;
  defaultValues?: Partial<ShipmentFiltersFormData>;
}

const STATUS_OPTIONS: { value: ShipmentStatus; label: string }[] = [
  { value: ShipmentStatus.PENDING, label: 'Pending' },
  { value: ShipmentStatus.PICKED_UP, label: 'Picked Up' },
  { value: ShipmentStatus.IN_TRANSIT, label: 'In Transit' },
  { value: ShipmentStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery' },
  { value: ShipmentStatus.DELIVERED, label: 'Delivered' },
  { value: ShipmentStatus.FAILED, label: 'Failed' },
  { value: ShipmentStatus.RETURNED, label: 'Returned' },
  { value: ShipmentStatus.CANCELLED, label: 'Cancelled' },
];

export function ShipmentFilters({
  onFilterChange,
  defaultValues,
}: ShipmentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<ShipmentFiltersFormData>({
    resolver: zodResolver(shipmentFiltersSchema),
    defaultValues,
  });

  const onSubmit = (data: ShipmentFiltersFormData) => {
    onFilterChange(data);
    setIsOpen(false);
  };

  const handleReset = () => {
    reset({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    onFilterChange({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Search by AWB number or receiver..."
          {...register('search')}
          className="max-w-md"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Hide' : 'Show'} Filters
        </Button>
      </div>

      {isOpen && (
        <Card className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                >
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  {...register('paymentMethod')}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                >
                  <option value="">All</option>
                  <option value="PREPAID">Prepaid</option>
                  <option value="COD">Cash on Delivery</option>
                </select>
              </div>

              {/* Service Type */}
              <div>
                <Label htmlFor="serviceType">Service Type</Label>
                <select
                  id="serviceType"
                  {...register('serviceType')}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                >
                  <option value="">All</option>
                  <option value="STANDARD">Standard</option>
                  <option value="EXPRESS">Express</option>
                  <option value="SAME_DAY">Same Day</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <Label htmlFor="dateFrom">Date From</Label>
                <Input id="dateFrom" type="date" {...register('dateFrom')} />
              </div>

              {/* Date To */}
              <div>
                <Label htmlFor="dateTo">Date To</Label>
                <Input id="dateTo" type="date" {...register('dateTo')} />
              </div>

              {/* Sort By */}
              <div>
                <Label htmlFor="sortBy">Sort By</Label>
                <select
                  id="sortBy"
                  {...register('sortBy')}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="updatedAt">Updated Date</option>
                  <option value="deliveryFee">Delivery Fee</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button type="submit">Apply Filters</Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
