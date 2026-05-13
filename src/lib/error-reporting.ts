interface ReportAppErrorInput {
  source?: 'client' | 'server' | 'manual';
  message: string;
  stack?: string;
  digest?: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

export async function reportAppError(input: ReportAppErrorInput) {
  try {
    await fetch('/api/monitoring/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      keepalive: true,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Could not report app error', error);
    }
  }
}