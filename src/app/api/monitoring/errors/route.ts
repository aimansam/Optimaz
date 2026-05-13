import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ErrorSource = 'client' | 'server' | 'manual';

interface ErrorPayload {
  source?: ErrorSource;
  message?: string;
  stack?: string;
  digest?: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

function truncate(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return undefined;
  return value.slice(0, maxLength);
}

function isValidSource(source: unknown): source is ErrorSource {
  return source === 'client' || source === 'server' || source === 'manual';
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, {
    keyPrefix: 'monitoring-errors',
    maxRequests: 20,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many error reports' },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  let payload: ErrorPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const source = isValidSource(payload.source) ? payload.source : 'client';
  const message = truncate(payload.message, 1000)?.trim();

  if (!message) {
    return NextResponse.json({ error: 'Missing error message' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('app_errors').insert({
    user_id: user?.id ?? null,
    source,
    message,
    stack: truncate(payload.stack, 8000),
    digest: truncate(payload.digest, 255),
    path: truncate(payload.path, 500),
    user_agent: truncate(request.headers.get('user-agent'), 500),
    metadata: payload.metadata ?? {},
  });

  if (error) {
    return NextResponse.json({ error: 'Could not record error' }, { status: 500 });
  }

  return NextResponse.json(
    { success: true },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}