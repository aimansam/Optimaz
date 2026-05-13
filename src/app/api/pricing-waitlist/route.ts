import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface PricingWaitlistPayload {
  email?: string;
  intent?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeIntent(value: unknown) {
  if (typeof value !== 'string') return null;
  const intent = value.trim();
  return intent ? intent.slice(0, 500) : null;
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, {
    keyPrefix: 'pricing-waitlist',
    maxRequests: 10,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many waitlist attempts' },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  let payload: PricingWaitlistPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = normalizeEmail(payload.email);

  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('pricing_waitlist').insert({
    user_id: user?.id ?? null,
    email,
    intent: normalizeIntent(payload.intent),
  });

  if (error?.code === '23505') {
    return NextResponse.json({ success: true, duplicate: true });
  }

  if (error) {
    return NextResponse.json({ error: 'Could not join waitlist' }, { status: 500 });
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