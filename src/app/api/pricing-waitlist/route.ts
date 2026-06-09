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

  // Send email notification
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const notifyTo = process.env.FEEDBACK_NOTIFY_EMAIL ?? 'hello@mavoralabs.com';
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@mavoralabs.com';
    const intent = normalizeIntent(payload.intent);
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from: `Optimaz Waitlist <${fromEmail}>`,
          to: [notifyTo],
          subject: '[Optimaz Beta] New pricing waitlist signup',
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
              <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a">New waitlist signup</h2>
              <p style="margin:0 0 8px;font-size:13px;color:#475569"><strong>Email:</strong> ${email}</p>
              ${intent ? `<p style="margin:0 0 8px;font-size:13px;color:#475569"><strong>Intent:</strong> ${intent}</p>` : ''}
              <p style="margin-top:24px;font-size:12px;color:#94a3b8">Sent from Optimaz beta</p>
            </div>
          `,
        }),
      });
      const resBody = await emailRes.json().catch(() => ({}));
      console.log('[pricing-waitlist] Email notification:', emailRes.status, JSON.stringify(resBody));
    } catch (err) {
      console.error('[pricing-waitlist] Email notification error:', err);
    }
  } else {
    console.warn('[pricing-waitlist] RESEND_API_KEY not set, skipping notification');
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
