'use client';

import { useState, type ReactNode } from 'react';
import { useAuthStore } from '@/src/features/auth/stores';
import { Header } from '@/src/common/components/layout/Header';
import { Sidebar } from '@/src/common/components/layout/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user && !user.isVerified) {
      router.replace('/verify-otp');
    }
  }, [isAuthenticated, user, router]);

  // Show loading while checking auth or redirecting
  if (!isAuthenticated || (user && !user.isVerified)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 pt-16 md:pl-64 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
