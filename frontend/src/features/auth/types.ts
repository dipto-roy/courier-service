import type { User } from '@/src/common/types';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  clearAuth: () => void;
}

export type AuthStore = AuthState & AuthActions;
