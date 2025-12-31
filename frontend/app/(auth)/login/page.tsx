import { Card } from '@/components/ui/card';
import { LoginForm } from '@/src/features/auth/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - FastX Courier',
  description: 'Login to your FastX Courier account',
};

export default function LoginPage() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <p className="text-sm text-gray-600">
          Login to access your dashboard
        </p>
      </div>
      <LoginForm />
    </Card>
  );
}
