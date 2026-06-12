import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 10 exports per user per hour (prevents DB hammering)
  const rateLimit = checkRateLimit(request, {
    keyPrefix: `account-export:${user.id}`,
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many export requests' },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  const [
    goalsResult,
    projectsResult,
    tasksResult,
    subtasksResult,
    savedViewsResult,
  ] = await Promise.all([
    supabase.from('goals').select('*').eq('user_id', user.id).order('created_at'),
    supabase.from('projects').select('*').eq('user_id', user.id).order('created_at'),
    supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at'),
    supabase.from('subtasks').select('*').eq('user_id', user.id).order('created_at'),
    supabase.from('saved_views').select('*').eq('user_id', user.id).order('created_at'),
  ]);

  const errors = [
    goalsResult, projectsResult, tasksResult, subtasksResult, savedViewsResult,
  ]
    .map((r) => r.error?.message)
    .filter(Boolean);

  if (errors.length > 0) {
    return NextResponse.json({ error: `Export failed: ${errors.join(', ')}` }, { status: 500 });
  }

  const exportData = {
    exported_at: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    goals: goalsResult.data ?? [],
    projects: projectsResult.data ?? [],
    tasks: tasksResult.data ?? [],
    subtasks: subtasksResult.data ?? [],
    saved_views: savedViewsResult.data ?? [],
  };

  const filename = `optimaz-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
