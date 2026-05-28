export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sentry: any = await import('@sentry/nextjs' as string);
    sentry.init({
      dsn,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
      environment: process.env.NODE_ENV ?? 'development',
      enabled: process.env.NODE_ENV === 'production',
    });
  } catch {
    // @sentry/nextjs not installed — monitoring disabled
  }
}
