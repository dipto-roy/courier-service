'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addressSchema, type AddressFormData } from '../types';

interface AddressFormProps {
  title: string;
  defaultValues?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => void;
  onBack?: () => void;
  submitLabel?: string;
}

export function AddressForm({
  title,
  defaultValues,
  onSubmit,
  onBack,
  submitLabel = 'Continue',
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="md:col-span-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="John Doe"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="01712345678"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Address Line 1 */}
          <div className="md:col-span-2">
            <Label htmlFor="addressLine1">Address Line 1 *</Label>
            <Input
              id="addressLine1"
              {...register('addressLine1')}
              placeholder="House/Building number, Street"
              disabled={isSubmitting}
            />
            {errors.addressLine1 && (
              <p className="text-sm text-red-500 mt-1">
                {errors.addressLine1.message}
              </p>
            )}
          </div>

          {/* Address Line 2 */}
          <div className="md:col-span-2">
            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
            <Input
              id="addressLine2"
              {...register('addressLine2')}
              placeholder="Area, Landmark"
              disabled={isSubmitting}
            />
          </div>

          {/* City */}
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              {...register('city')}
              placeholder="Dhaka"
              disabled={isSubmitting}
            />
            {errors.city && (
              <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
            )}
          </div>

          {/* State */}
          <div>
            <Label htmlFor="state">State/Division *</Label>
            <Input
              id="state"
              {...register('state')}
              placeholder="Dhaka"
              disabled={isSubmitting}
            />
            {errors.state && (
              <p className="text-sm text-red-500 mt-1">
                {errors.state.message}
              </p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              {...register('postalCode')}
              placeholder="1000"
              disabled={isSubmitting}
            />
            {errors.postalCode && (
              <p className="text-sm text-red-500 mt-1">
                {errors.postalCode.message}
              </p>
            )}
          </div>

          {/* Landmark */}
          <div>
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              {...register('landmark')}
              placeholder="Near XYZ School"
              disabled={isSubmitting}
            />
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
