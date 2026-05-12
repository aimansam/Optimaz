import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const sentryDsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

export async function POST(request: NextRequest) {
  const testToken = process.env.SENTRY_TEST_TOKEN;
  const providedToken = request.headers.get('x-sentry-test-token');

  if (!testToken || providedToken !== testToken) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!sentryDsn) {
    return NextResponse.json({ error: 'Sentry is not configured' }, { status: 503 });
  }

  const eventId = Sentry.captureException(new Error('TaskFlow Sentry verification event'), {
    tags: {
      taskflow_monitoring_test: 'true',
    },
  });
  const flushed = await Sentry.flush(2_000);

  return NextResponse.json(
    { eventId, flushed },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
