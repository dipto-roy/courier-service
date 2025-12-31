export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'FastX Courier';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

// Date formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy hh:mm a';
export const TIME_FORMAT = 'hh:mm a';

// Status colors
export const STATUS_COLORS = {
  PENDING: 'bg-yellow-500',
  PICKED_UP: 'bg-blue-500',
  IN_TRANSIT: 'bg-purple-500',
  OUT_FOR_DELIVERY: 'bg-indigo-500',
  DELIVERED: 'bg-green-500',
  FAILED: 'bg-red-500',
  RETURNED: 'bg-orange-500',
  CANCELLED: 'bg-gray-500',
} as const;

// Role labels
export const ROLE_LABELS = {
  MERCHANT: 'Merchant',
  RIDER: 'Rider',
  CUSTOMER: 'Customer',
  ADMIN: 'Admin',
  AGENT: 'Agent',
  HUB_STAFF: 'Hub Staff',
  SUPPORT: 'Support',
  FINANCE: 'Finance',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
} as const;
