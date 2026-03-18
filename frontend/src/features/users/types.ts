import { z } from 'zod';
import { UserRole } from '@/src/common/types';

// ==================== Enums ====================

export enum WalletOperationType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

// ==================== Interfaces ====================

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  city?: string;
  area?: string;
  address?: string;
  companyName?: string;
  businessWebsite?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isKYCVerified: boolean;
  walletBalance: number;
  kycRemarks?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  recentSignups: number;
  kycPending: number;
  kycVerified: number;
}

export interface UsersListResponse {
  data: UserProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== Filter Types ====================

export interface UserFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isKYCVerified?: boolean;
  city?: string;
  page?: number;
  limit?: number;
}

// ==================== Zod Schemas ====================

export const createUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole),
  city: z.string().optional(),
  area: z.string().optional(),
  address: z.string().optional(),
  companyName: z.string().optional(),
  businessWebsite: z.string().optional(),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(UserRole).optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  address: z.string().optional(),
  companyName: z.string().optional(),
  businessWebsite: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const kycVerificationSchema = z.object({
  isKYCVerified: z.boolean(),
  kycRemarks: z.string().optional(),
});

export const walletUpdateSchema = z.object({
  operation: z.nativeEnum(WalletOperationType),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  remarks: z.string().optional(),
});

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  isPhoneVerified: z.boolean().optional(),
  isKYCVerified: z.boolean().optional(),
  city: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

// ==================== Form Types ====================

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type KYCVerificationInput = z.infer<typeof kycVerificationSchema>;
export type WalletUpdateInput = z.infer<typeof walletUpdateSchema>;
