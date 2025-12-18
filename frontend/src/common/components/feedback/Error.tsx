'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/src/common/lib/utils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// Error fallback component
interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
  className?: string;
}

export function ErrorFallback({ error, onReset, className }: ErrorFallbackProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center',
        className
      )}
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Something went wrong</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {onReset && (
        <Button onClick={onReset} variant="outline" className="mt-6 gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// Simple error display for non-boundary errors
interface ErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function Error({ title = 'Error', message, onRetry, className }: ErrorProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-destructive/20 bg-destructive/5 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-medium text-destructive">{title}</h4>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-4 gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

// Inline error for form fields
export function FieldError({ message }: { message: string }) {
  return (
    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      {message}
    </p>
  );
}
