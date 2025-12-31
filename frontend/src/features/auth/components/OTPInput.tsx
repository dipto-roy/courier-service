'use client';

import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVerifyOTP, useResendOTP } from '../hooks';
import { useAuthStore } from '../stores';

export function OTPInput() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const user = useAuthStore((state) => state.user);

  const { mutate: verifyOTP, isPending, error } = useVerifyOTP();
  const { mutate: resendOTP, isPending: isResending, error: resendError, isSuccess: resendSuccess } = useResendOTP();

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = () => {
    const otpString = otp.join('');
    console.log('OTP Submit clicked:', { otpString, userEmail: user?.email, length: otpString.length });
    
    if (otpString.length === 6 && user?.email) {
      console.log('Verifying OTP...');
      verifyOTP({ email: user.email, otpCode: otpString });
    } else {
      console.error('Cannot verify:', { 
        otpLength: otpString.length, 
        hasEmail: !!user?.email,
        user 
      });
    }
  };

  const handleResend = () => {
    console.log('Resend clicked:', { hasEmail: !!user?.email, email: user?.email });
    
    if (!user?.email) {
      console.error('No user email found in store');
      return;
    }
    
    setSuccessMessage(null);
    resendOTP(user.email, {
      onSuccess: () => {
        setSuccessMessage('OTP sent successfully! Check your email.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      },
    });
  };

  const isComplete = otp.every((digit) => digit !== '');

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error instanceof Error ? error.message : 'Invalid OTP. Please try again.'}
        </div>
      )}

      {resendError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {resendError instanceof Error ? resendError.message : 'Failed to resend OTP. Please try again.'}
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          {successMessage}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-center text-sm text-gray-600">
          Enter the 6-digit code sent to
        </p>
        <p className="text-center font-medium">{user?.email}</p>
      </div>

      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="h-12 w-12 text-center text-lg font-semibold"
            disabled={isPending}
          />
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isComplete || isPending}
        className="w-full"
      >
        {isPending ? 'Verifying...' : 'Verify OTP'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
        >
          {isResending ? 'Sending...' : "Didn't receive code? Resend"}
        </button>
      </div>
    </div>
  );
}
