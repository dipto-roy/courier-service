import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '../services';
import { useAuthStore } from '../stores';
import type { VerifyOTPRequest } from '@/src/common/types';
import { parseErrorMessage } from '@/src/common/lib/utils';

export function useVerifyOTP() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (otpData: VerifyOTPRequest) => authService.verifyOTP(otpData),
    onSuccess: () => {
      // Update user verification status
      if (user) {
        setUser({ ...user, isVerified: true });
      }

      // Redirect to dashboard
      router.push('/dashboard');
    },
    onError: (error) => {
      const message = parseErrorMessage(error);
      console.error('OTP verification error:', message);
      // Error will be handled by the component
    },
  });
}

export function useResendOTP() {
  return useMutation({
    mutationFn: (email: string) => authService.resendOTP(email),
    onError: (error) => {
      const message = parseErrorMessage(error);
      console.error('Resend OTP error:', message);
    },
  });
}
