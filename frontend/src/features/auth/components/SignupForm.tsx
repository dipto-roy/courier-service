'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignup } from '../hooks';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { UserRole } from '@/src/common/types';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(11, 'Phone number must be at least 11 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRole),
  city: z.string().optional(),
  area: z.string().optional(),
  address: z.string().optional(),
  merchantBusinessName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => {
  // If role is MERCHANT, require business name
  if (data.role === UserRole.MERCHANT) {
    return data.merchantBusinessName && data.merchantBusinessName.length > 0;
  }
  return true;
}, {
  message: 'Business name is required for merchants',
  path: ['merchantBusinessName'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { mutate: signup, isPending, error } = useSignup();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: UserRole.CUSTOMER,
    },
  });

  const role = watch('role');

  const onSubmit = (data: SignupFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...signupData } = data;
    signup(signupData);
  };

  return (
    <>
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error instanceof Error ? error.message : 'Signup failed. Please try again.'}
          </div>
        )}

        {/* Role Selection */}
        <div className="space-y-2">
          <Label>I want to sign up as</Label>
          <div className="grid grid-cols-3 gap-2">
            {[UserRole.MERCHANT, UserRole.RIDER, UserRole.CUSTOMER].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setValue('role', r)}
                className={`rounded-lg border-2 p-3 text-center transition-colors ${
                  role === r
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value={r}
                  {...register('role')}
                  className="hidden"
                />
                <div className="font-medium capitalize">{r.replace('_', ' ')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            {...register('name')}
            disabled={isPending}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            disabled={isPending}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="01XXXXXXXXX"
            {...register('phone')}
            disabled={isPending}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Business Details (for MERCHANT only) */}
        {role === UserRole.MERCHANT && (
          <div className="space-y-2">
            <Label htmlFor="merchantBusinessName">Business Name</Label>
            <Input
              id="merchantBusinessName"
              type="text"
              placeholder="Enter your business name"
              {...register('merchantBusinessName')}
              disabled={isPending}
            />
            {errors.merchantBusinessName && (
              <p className="text-sm text-red-500">{errors.merchantBusinessName.message}</p>
            )}
          </div>
        )}

        {/* Address Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              placeholder="e.g., Dhaka"
              {...register('city')}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Area</Label>
            <Input
              id="area"
              type="text"
              placeholder="e.g., Gulshan"
              {...register('area')}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            placeholder="Enter your full address"
            {...register('address')}
            disabled={isPending}
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              {...register('password')}
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            {...register('confirmPassword')}
            disabled={isPending}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Creating account...' : 'Sign Up'}
        </Button>

        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </div>
      </form>
    </>
  );
}
