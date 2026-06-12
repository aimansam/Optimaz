import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Cron: Prune analytics_events and app_errors older than 90 days.
 * Schedule in vercel.json: "0 3 * * 0" (every Sunday at 03:00 UTC)
 * Protected by CRON_SECRET bearer token.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: 'Admin client not configured' }, { status: 503 });
  }

  const retainDays = 90;

  const { data, error } = await admin.rpc('prune_operational_data', {
    retain_days: retainDays,
  });

  if (error) {
    console.error('[prune-data] RPC error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = Array.isArray(data) ? data[0] : data;
  console.log(`[prune-data] Pruned: analytics=${result?.deleted_analytics ?? 0}, errors=${result?.deleted_app_errors ?? 0}`);

  return NextResponse.json({
    ok: true,
    retain_days: retainDays,
    deleted_analytics: result?.deleted_analytics ?? 0,
    deleted_app_errors: result?.deleted_app_errors ?? 0,
  });
}
