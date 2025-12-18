import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data remains fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus in development
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Show error notifications by default
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Query key factory for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
  // Shipments
  shipments: {
    all: ['shipments'] as const,
    lists: () => [...queryKeys.shipments.all, 'list'] as const,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list: (filters?: Record<string, any>) =>
      [...queryKeys.shipments.lists(), filters] as const,
    details: () => [...queryKeys.shipments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.shipments.details(), id] as const,
    byAwb: (awb: string) => [...queryKeys.shipments.all, 'awb', awb] as const,
  },
  // Tracking
  tracking: {
    all: ['tracking'] as const,
    detail: (awb: string) => [...queryKeys.tracking.all, awb] as const,
    history: (awb: string) => [...queryKeys.tracking.all, awb, 'history'] as const,
    locations: (awb: string) => [...queryKeys.tracking.all, awb, 'locations'] as const,
    eta: (awb: string) => [...queryKeys.tracking.all, awb, 'eta'] as const,
  },
  // Rider
  rider: {
    all: ['rider'] as const,
    // Manifests (from /rider/manifests)
    manifests: (status?: string) =>
      [...queryKeys.rider.all, 'manifests', { status }] as const,
    manifest: (id: string | number) => [...queryKeys.rider.all, 'manifest', id] as const,
    // Shipments (from /rider/shipments)
    shipments: (status?: string) =>
      [...queryKeys.rider.all, 'shipments', { status }] as const,
    shipment: (awb: string) => [...queryKeys.rider.all, 'shipment', awb] as const,
    // Statistics (from /rider/statistics)
    statistics: () => [...queryKeys.rider.all, 'statistics'] as const,
    // Location history (from /rider/location-history)
    locationHistory: (limit?: number) =>
      [...queryKeys.rider.all, 'location-history', { limit }] as const,
  },
  // Hub
  hub: {
    all: ['hub'] as const,
    // Manifests (from /hub/manifests)
    manifests: (filters?: Record<string, unknown>) =>
      [...queryKeys.hub.all, 'manifests', filters] as const,
    manifest: (id: string) => [...queryKeys.hub.all, 'manifest', id] as const,
    // Statistics (from /hub/manifests/statistics)
    statistics: (hubLocation?: string) =>
      [...queryKeys.hub.all, 'statistics', { hubLocation }] as const,
  },
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list: (filters: Record<string, any>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
  },
  // Payments
  payments: {
    all: ['payments'] as const,
    // Transactions
    transactions: (filters?: Record<string, unknown>) =>
      [...queryKeys.payments.all, 'transactions', filters] as const,
    transaction: (id: string) =>
      [...queryKeys.payments.all, 'transaction', id] as const,
    // COD Collections
    pendingCollections: (merchantId: string) =>
      [...queryKeys.payments.all, 'pending-collections', merchantId] as const,
    pendingBalance: (merchantId: string) =>
      [...queryKeys.payments.all, 'pending-balance', merchantId] as const,
    // Statistics
    merchantStats: (merchantId?: string) =>
      [...queryKeys.payments.all, 'merchant-stats', { merchantId }] as const,
    overallStats: () => [...queryKeys.payments.all, 'overall-stats'] as const,
  },
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    count: () => [...queryKeys.notifications.all, 'count'] as const,
  },
} as const;
