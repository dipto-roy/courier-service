import { useAuthStore } from '../stores';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { authService } from '../services';

export function useAuth() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, logout: storeLogout } = useAuthStore();

  const logout = useCallback(async () => {
    try {
      // Call logout API
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state
      storeLogout();

      // Redirect to login
      router.push('/login');
    }
  }, [router, storeLogout]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isVerified: user?.isVerified ?? false,
    logout,
  };
}
