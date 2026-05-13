'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { reportAppError } from '@/lib/error-reporting';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void reportAppError({
      source: 'client',
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      path: window.location.pathname,
      metadata: { boundary: 'global-error' },
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
          <section className="w-full max-w-md space-y-4 text-center">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">The error was recorded. Try again when you are ready.</p>
            <Button type="button" onClick={reset}>Try again</Button>
          </section>
        </main>
      </body>
    </html>
  );
}
