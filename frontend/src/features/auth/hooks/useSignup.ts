import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '../services';
import { useAuthStore } from '../stores';
import type { SignupRequest } from '@/src/common/types';
import { parseErrorMessage } from '@/src/common/lib/utils';

export function useSignup() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (userData: SignupRequest) => authService.signup(userData),
    onSuccess: (data) => {
      // Store auth data
      setAuth(data.user, data.accessToken, data.refreshToken);

      // Redirect to OTP verification
      router.push('/verify-otp');
    },
    onError: (error) => {
      const message = parseErrorMessage(error);
      console.error('Signup error:', message);
      // Error will be handled by the component
    },
  });
}
