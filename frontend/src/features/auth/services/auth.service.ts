import apiClient from '@/src/common/lib/apiClient';
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  VerifyOTPRequest,
} from '@/src/common/types';

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/login',
      credentials,
    );
    return data;
  },

  /**
   * Signup new user
   */
  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/signup',
      userData,
    );
    return data;
  },

  /**
   * Verify OTP
   */
  async verifyOTP(otpData: VerifyOTPRequest): Promise<void> {
    await apiClient.post('/auth/verify-otp', otpData);
  },

  /**
   * Refresh access token
   */
  async refreshToken(
    refreshToken: string,
  ): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  /**
   * Resend OTP
   */
  async resendOTP(email: string): Promise<void> {
    await apiClient.post('/auth/resend-otp', { email });
  },
};
