import { Card } from '@/components/ui/card';
import { OTPInput } from '@/src/features/auth/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify OTP - FastX Courier',
  description: 'Verify your email address',
};

export default function VerifyOTPPage() {
  return (
    <Card className="p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">Verify Your Email</h2>
        <p className="text-sm text-gray-600">
          We&apos;ve sent a verification code to your email
        </p>
      </div>
      <OTPInput />
    </Card>
  );
}
