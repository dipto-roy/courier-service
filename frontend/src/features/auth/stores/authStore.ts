import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStore } from '../types';
import { eventBus, EVENT_NAMES } from '@/src/common/lib/eventBus';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (user, accessToken, refreshToken) => {
        console.log('🔐 setAuth called:', { 
          user: user?.email, 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken 
        });

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        // Store tokens in localStorage for API client
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          console.log('✅ Tokens stored in localStorage');
        }

        // Emit login event
        eventBus.emit(EVENT_NAMES.AUTH.LOGIN, user);
      },

      setUser: (user) => {
        set({ user });
      },

      updateTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });

        // Update tokens in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Emit token refresh event
        eventBus.emit(EVENT_NAMES.AUTH.TOKEN_REFRESH);
      },

      logout: () => {
        set(initialState);

        // Clear tokens from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }

        // Emit logout event
        eventBus.emit(EVENT_NAMES.AUTH.LOGOUT);
      },

      clearAuth: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Listen to logout events from other parts of the app
if (typeof window !== 'undefined') {
  eventBus.on(EVENT_NAMES.AUTH.SESSION_EXPIRED, () => {
    useAuthStore.getState().logout();
  });
}
