import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';
import { UserRole } from '@/src/common/types';

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

const mockUser = {
  id: 'user-uuid-1',
  name: 'Test User',
  email: 'test@example.com',
  role: UserRole.CUSTOMER,
  isVerified: true,
  phone: '+8801700000001',
};

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  describe('setAuth', () => {
    it('sets user and authentication state', () => {
      useAuthStore.getState().setAuth(mockUser as any, 'access.token', 'refresh.token');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('access.token');
    });
  });

  describe('logout', () => {
    it('clears auth state', () => {
      useAuthStore.getState().setAuth(mockUser as any, 'token', 'refresh');
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
    });
  });

  describe('initial state', () => {
    it('starts unauthenticated', () => {
      // Fresh store (after logout from beforeEach)
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });
});
