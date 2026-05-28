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
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          // Lightweight cookie for middleware route guard (non-httpOnly, JS-writable).
          document.cookie = 'fastx_logged_in=1; path=/; max-age=604800; SameSite=Lax';
        }

        eventBus.emit(EVENT_NAMES.AUTH.LOGIN, user);
      },

      setUser: (user) => {
        set({ user });
      },

      updateTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });

        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }

        eventBus.emit(EVENT_NAMES.AUTH.TOKEN_REFRESH);
      },

      logout: () => {
        set(initialState);

        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          document.cookie = 'fastx_logged_in=; path=/; max-age=0; SameSite=Lax';
        }

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
