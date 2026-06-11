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

  // ── Step 1: Delete tables with no FK children (parallel) ──────────────────
  // Delete notification_deliveries before tasks (references task_id)
  const step1 = await Promise.allSettled([
    admin.from('notification_deliveries').delete().eq('user_id', user.id),
    admin.from('push_subscriptions').delete().eq('user_id', user.id),
    admin.from('analytics_events').delete().eq('user_id', user.id),
    admin.from('feedback').delete().eq('user_id', user.id),
    admin.from('app_errors').delete().eq('user_id', user.id),
    admin.from('saved_views').delete().eq('user_id', user.id),
    admin.from('beta_access').delete().eq('user_id', user.id),
    admin.from('task_completion_archive').delete().eq('user_id', user.id),
    // Remove waitlist entry if it was their email
    ...(user.email
      ? [admin.from('pricing_waitlist').delete().eq('email', user.email)]
      : []),
  ]);

  const step1Errors = step1
    .filter((r) => r.status === 'fulfilled' && (r.value as { error?: { message: string } }).error)
    .map((r) => (r as PromiseFulfilledResult<{ error?: { message: string } }>).value.error?.message);

  if (step1Errors.filter(Boolean).length > 0) {
    console.error('[account/delete] Step 1 errors:', step1Errors);
    return NextResponse.json({ error: 'Could not fully remove account data' }, { status: 500 });
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

  // ── Step 4: Delete top-level content (parallel) ───────────────────────────
  const step4 = await Promise.allSettled([
    admin.from('projects').delete().eq('user_id', user.id),
    admin.from('goals').delete().eq('user_id', user.id),
    admin.from('routines').delete().eq('user_id', user.id),
  ]);

  const step4Errors = step4
    .filter((r) => r.status === 'fulfilled' && (r.value as { error?: { message: string } }).error)
    .map((r) => (r as PromiseFulfilledResult<{ error?: { message: string } }>).value.error?.message);

  if (step4Errors.filter(Boolean).length > 0) {
    console.error('[account/delete] Step 4 errors:', step4Errors);
    return NextResponse.json({ error: 'Could not fully remove account data' }, { status: 500 });
  }

  // ── Step 5: Delete the auth user record ───────────────────────────────────
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteUserError) {
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
