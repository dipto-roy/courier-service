'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/src/common/lib/utils';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
  onClose: () => void;
}

const variantStyles = {
  default: 'bg-background border-border',
  success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
};

const variantTextStyles = {
  default: 'text-foreground',
  success: 'text-green-900 dark:text-green-100',
  error: 'text-red-900 dark:text-red-100',
  warning: 'text-yellow-900 dark:text-yellow-100',
};

export function Toast({
  title,
  description,
  variant = 'default',
  onClose,
}: ToastProps) {
  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-md rounded-lg border p-4 shadow-lg transition-all',
        variantStyles[variant]
      )}
    >
      <div className="flex-1">
        {title && (
          <div className={cn('text-sm font-semibold', variantTextStyles[variant])}>
            {title}
          </div>
        )}
        {description && (
          <div className={cn('mt-1 text-sm', variantTextStyles[variant])}>
            {description}
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className={cn(
          'ml-4 inline-flex rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10',
          variantTextStyles[variant]
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed top-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="mb-4 animate-in slide-in-from-top-full sm:slide-in-from-bottom-full"
        >
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
}
