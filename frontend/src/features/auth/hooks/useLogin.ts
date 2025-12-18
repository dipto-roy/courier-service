import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '../services';
import { useAuthStore } from '../stores';
import type { LoginRequest } from '@/src/common/types';
import { parseErrorMessage } from '@/src/common/lib/utils';

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      console.log('🎯 Login successful:', { 
        user: data.user?.email,
        role: data.user?.role,
        isVerified: data.user?.isVerified,
        hasTokens: !!(data.accessToken && data.refreshToken)
      });

      // Store auth data
      setAuth(data.user, data.accessToken, data.refreshToken);

      // Redirect based on user role
      if (!data.user.isVerified) {
        console.log('📧 User not verified, redirecting to OTP');
        router.push('/verify-otp');
      } else {
        console.log('✅ User verified, redirecting to dashboard');
        router.push('/dashboard');
      }
    },
    onError: (error) => {
      const message = parseErrorMessage(error);
      console.error('❌ Login error:', message);
      // Error will be handled by the component
    },
  });
}
