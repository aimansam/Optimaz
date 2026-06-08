import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

const NOTIFY_TO = 'feedback@mavoralabs.com';
const CATEGORY_LABELS: Record<string, string> = {
  general: 'General feedback',
  bug: 'Bug report',
  idea: 'Feature idea',
  pricing: 'Pricing feedback',
};

export async function POST(request: Request) {
  // Auth check — only logged-in users submit feedback
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 5 emails per user per hour
  const rateResult = checkRateLimit(request as Parameters<typeof checkRateLimit>[0], {
    keyPrefix: `feedback-notify:${user.id}`,
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: getRateLimitHeaders(rateResult) }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No email configured — silently skip so the app works without this env var
    return NextResponse.json({ skipped: true });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

  let body: { category?: string; message?: string; pagePath?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { category = 'general', message, pagePath } = body;
  if (!message || message.trim().length < 3) {
    return NextResponse.json({ error: 'Message too short' }, { status: 400 });
  }

  const categoryLabel = CATEGORY_LABELS[category] ?? category;
  const subject = `[Optimaz Beta] ${categoryLabel}`;
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a">New feedback submitted</h2>
      <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
        <tr>
          <td style="padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;width:120px;font-size:13px;font-weight:600;color:#475569">Category</td>
          <td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:13px;color:#0f172a">${categoryLabel}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;font-size:13px;font-weight:600;color:#475569">From</td>
          <td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:13px;color:#0f172a">${user.email ?? user.id}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;font-size:13px;font-weight:600;color:#475569">Page</td>
          <td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:13px;color:#0f172a">${pagePath ?? '—'}</td>
        </tr>
      </table>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
        <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.6;white-space:pre-wrap">${message.trim()}</p>
      </div>
      <p style="margin-top:24px;font-size:12px;color:#94a3b8">Sent from Optimaz beta feedback system</p>
    </div>
  `;

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: `Optimaz Beta <${fromEmail}>`,
      to: [NOTIFY_TO],
      subject,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const text = await resendResponse.text().catch(() => 'unknown error');
    console.error('[feedback/notify] Resend error:', resendResponse.status, text);
    return NextResponse.json({ error: 'Email delivery failed' }, { status: 502 });
  }

  return NextResponse.json({ sent: true });
}
