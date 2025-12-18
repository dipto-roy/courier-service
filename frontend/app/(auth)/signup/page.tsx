import { Card } from '@/components/ui/card';
import { SignupForm } from '@/src/features/auth/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - FastX Courier',
  description: 'Create your FastX Courier account',
};

export default function SignupPage() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Create Account</h2>
        <p className="text-sm text-gray-600">
          Sign up to get started with FastX Courier
        </p>
      </div>
      <SignupForm />
    </Card>
  );
}
