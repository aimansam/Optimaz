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

  // ── Pre-cleanup: best-effort deletion of all user data ────────────────────
  // All steps below are non-fatal. We log any errors and continue so that the
  // auth user delete in the final step can proceed. Supabase will cascade any
  // remaining FK-linked rows when the auth.users record is removed.
  //
  // Order matters for FK constraints:
  //   1. notification_deliveries (refs task_id)
  //   2. subtasks (refs task_id)
  //   3. tasks (refs project_id, goal_id)
  //   4. projects, goals (top-level content)
  //   5. everything else (no FK deps on above)

  // Step 1 — leaf tables (no FK children among user data)
  const step1 = await Promise.allSettled([
    admin.from('notification_deliveries').delete().eq('user_id', user.id),
    admin.from('push_subscriptions').delete().eq('user_id', user.id),
    admin.from('analytics_events').delete().eq('user_id', user.id),
    admin.from('feedback').delete().eq('user_id', user.id),
    admin.from('app_errors').delete().eq('user_id', user.id),
    admin.from('saved_views').delete().eq('user_id', user.id),
    admin.from('beta_access').delete().eq('user_id', user.id),
    ...(user.email
      ? [admin.from('pricing_waitlist').delete().eq('email', user.email)]
      : []),
  ]);
  const step1Errors = step1
    .filter((r) => r.status === 'fulfilled' && (r.value as { error?: { message: string } }).error)
    .map((r) => (r as PromiseFulfilledResult<{ error?: { message: string } }>).value.error?.message);
  if (step1Errors.filter(Boolean).length > 0) {
    console.warn('[account/delete] Step 1 warnings:', step1Errors);
  }

  // Step 2 — subtasks (before tasks, FK: subtasks.task_id → tasks.id)
  const { error: subtasksError } = await admin.from('subtasks').delete().eq('user_id', user.id);
  if (subtasksError) console.warn('[account/delete] subtasks warning:', subtasksError.message);

  // Step 3 — tasks
  const { error: tasksError } = await admin.from('tasks').delete().eq('user_id', user.id);
  if (tasksError) console.warn('[account/delete] tasks warning:', tasksError.message);

  // Step 4 — top-level content
  const step4 = await Promise.allSettled([
    admin.from('projects').delete().eq('user_id', user.id),
    admin.from('goals').delete().eq('user_id', user.id),
  ]);
  const step4Errors = step4
    .filter((r) => r.status === 'fulfilled' && (r.value as { error?: { message: string } }).error)
    .map((r) => (r as PromiseFulfilledResult<{ error?: { message: string } }>).value.error?.message);
  if (step4Errors.filter(Boolean).length > 0) {
    console.warn('[account/delete] Step 4 warnings:', step4Errors);
  }

  // ── Final step: delete the auth user record ────────────────────────────────
  // This is the only hard-fail. If this succeeds, the account is gone.
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteUserError) {
    console.error('[account/delete] auth user delete error:', deleteUserError.message);
    return NextResponse.json({ error: 'Could not delete account' }, { status: 500 });
  }

  return NextResponse.json(
    { success: true },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
