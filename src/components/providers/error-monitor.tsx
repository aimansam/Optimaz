'use client';

import { useEffect } from 'react';
import { reportAppError } from '@/lib/error-reporting';

function getErrorDetails(reason: unknown) {
  if (reason instanceof Error) {
    return { message: reason.message, stack: reason.stack };
  }

  if (typeof reason === 'string') {
    return { message: reason };
  }

  return { message: 'Unknown client error', metadata: { reason } };
}

export function ErrorMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const report = (reason: unknown, metadata: Record<string, unknown> = {}) => {
      const details = getErrorDetails(reason);

      void reportAppError({
        source: 'client',
        message: details.message,
        stack: details.stack,
        path: window.location.pathname,
        metadata: { ...details.metadata, ...metadata },
      });
    };

    const handleError = (event: ErrorEvent) => {
      report(event.error ?? event.message, { type: 'error' });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      report(event.reason, { type: 'unhandledrejection' });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}