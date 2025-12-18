'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { packageDetailsSchema, type PackageDetailsFormData } from '../types';

interface PackageDetailsFormProps {
  defaultValues?: Partial<PackageDetailsFormData>;
  onSubmit: (data: PackageDetailsFormData) => void;
  onBack?: () => void;
  submitLabel?: string;
}

export function PackageDetailsForm({
  defaultValues,
  onSubmit,
  onBack,
  submitLabel = 'Continue',
}: PackageDetailsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PackageDetailsFormData>({
    resolver: zodResolver(packageDetailsSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Package Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Description */}
          <div className="md:col-span-2">
            <Label htmlFor="description">Package Description *</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Electronics, Documents, Clothing, etc."
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Weight */}
          <div>
            <Label htmlFor="weight">Weight (kg) *</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              {...register('weight', { valueAsNumber: true })}
              placeholder="1.5"
              disabled={isSubmitting}
            />
            {errors.weight && (
              <p className="text-sm text-red-500 mt-1">
                {errors.weight.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              placeholder="1"
              disabled={isSubmitting}
              defaultValue={1}
            />
            {errors.quantity && (
              <p className="text-sm text-red-500 mt-1">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Dimensions */}
          <div className="md:col-span-2">
            <Label>Dimensions (Optional)</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div>
                <Input
                  type="number"
                  step="0.1"
                  {...register('length', { valueAsNumber: true })}
                  placeholder="Length (cm)"
                  disabled={isSubmitting}
                />
                {errors.length && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.length.message}
                  </p>
                )}
              </div>
              <div>
                <Input
                  type="number"
                  step="0.1"
                  {...register('width', { valueAsNumber: true })}
                  placeholder="Width (cm)"
                  disabled={isSubmitting}
                />
                {errors.width && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.width.message}
                  </p>
                )}
              </div>
              <div>
                <Input
                  type="number"
                  step="0.1"
                  {...register('height', { valueAsNumber: true })}
                  placeholder="Height (cm)"
                  disabled={isSubmitting}
                />
                {errors.height && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.height.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Value */}
          <div>
            <Label htmlFor="invoiceValue">Invoice Value (₹) (Optional)</Label>
            <Input
              id="invoiceValue"
              type="number"
              step="0.01"
              {...register('invoiceValue', { valueAsNumber: true })}
              placeholder="1000"
              disabled={isSubmitting}
            />
            {errors.invoiceValue && (
              <p className="text-sm text-red-500 mt-1">
                {errors.invoiceValue.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              For insurance and customs purposes
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="ml-auto">
          {isSubmitting ? 'Processing...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
