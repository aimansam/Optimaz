import * as Sentry from '@sentry/nextjs';

const sentryDsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

function getTracesSampleRate() {
  const value = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1');

  return Number.isFinite(value) ? value : 0.1;
}

export async function register() {
  if (!sentryDsn) {
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: getTracesSampleRate(),
    sendDefaultPii: false,
  });
}

export const onRequestError = Sentry.captureRequestError;
