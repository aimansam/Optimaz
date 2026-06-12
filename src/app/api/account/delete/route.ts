import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 3 attempts per hour (defensive against abuse)
  const rateLimit = checkRateLimit(request, {
    keyPrefix: `account-delete:${user.id}`,
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: 'Account deletion is not configured' }, { status: 503 });
  }

  // ── Step 1: Best-effort cleanup of peripheral data (parallel) ─────────────
  // These are non-critical rows. If a table doesn't exist or errors, we log and
  // continue — the auth user delete in step 4 is the authoritative cleanup.
  const step1 = await Promise.allSettled([
    admin.from('notification_deliveries').delete().eq('user_id', user.id),
    admin.from('push_subscriptions').delete().eq('user_id', user.id),
    admin.from('analytics_events').delete().eq('user_id', user.id),
    admin.from('feedback').delete().eq('user_id', user.id),
    admin.from('app_errors').delete().eq('user_id', user.id),
    admin.from('saved_views').delete().eq('user_id', user.id),
    admin.from('beta_access').delete().eq('user_id', user.id),
    // Remove waitlist entry if it was their email
    ...(user.email
      ? [admin.from('pricing_waitlist').delete().eq('email', user.email)]
      : []),
  ]);

  const step1Errors = step1
    .filter((r) => r.status === 'fulfilled' && (r.value as { error?: { message: string } }).error)
    .map((r) => (r as PromiseFulfilledResult<{ error?: { message: string } }>).value.error?.message);

  if (step1Errors.filter(Boolean).length > 0) {
    // Log but do not abort — peripheral tables may not exist yet or be empty
    console.warn('[account/delete] Step 1 non-fatal warnings:', step1Errors);
  }

  // ── Step 2: Delete subtasks before tasks (FK: subtasks.task_id → tasks.id) ─
  const { error: subtasksError } = await admin
    .from('subtasks')
    .delete()
    .eq('user_id', user.id);

  if (subtasksError) {
    console.error('[account/delete] subtasks error:', subtasksError.message);
    return NextResponse.json({ error: 'Could not remove subtasks' }, { status: 500 });
  }

  // ── Step 3: Delete tasks ───────────────────────────────────────────────────
  const { error: tasksError } = await admin
    .from('tasks')
    .delete()
    .eq('user_id', user.id);

  if (tasksError) {
    console.error('[account/delete] tasks error:', tasksError.message);
    return NextResponse.json({ error: 'Could not remove tasks' }, { status: 500 });
  }

  // ── Step 3b: Best-effort delete of top-level content (parallel) ───────────
  const step3b = await Promise.allSettled([
    admin.from('projects').delete().eq('user_id', user.id),
    admin.from('goals').delete().eq('user_id', user.id),
  ]);

  const step3bErrors = step3b
    .filter((r) => r.status === 'fulfilled' && (r.value as { error?: { message: string } }).error)
    .map((r) => (r as PromiseFulfilledResult<{ error?: { message: string } }>).value.error?.message);

  if (step3bErrors.filter(Boolean).length > 0) {
    console.warn('[account/delete] Step 3b non-fatal warnings:', step3bErrors);
  }

  // ── Step 4: Delete the auth user record ───────────────────────────────────
  // This is the authoritative deletion — Supabase cascades any FK-linked rows.
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteUserError) {
    console.error('[account/delete] auth user delete error:', deleteUserError.message);
    return NextResponse.json({ error: 'Could not delete account' }, { status: 500 });
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
