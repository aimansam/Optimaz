import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function selectUserRows(supabase: Awaited<ReturnType<typeof createClient>>, table: string, columns = '*') {
  const { data, error } = await supabase.from(table).select(columns).order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [projects, goals, tasks, subtasks, feedback, analyticsEvents, appErrors, pushSubscriptions] = await Promise.all([
      selectUserRows(supabase, 'projects'),
      selectUserRows(supabase, 'goals'),
      selectUserRows(supabase, 'tasks'),
      selectUserRows(supabase, 'subtasks'),
      selectUserRows(supabase, 'feedback'),
      selectUserRows(supabase, 'analytics_events', 'event_name, metadata, created_at'),
      selectUserRows(supabase, 'app_errors', 'source, message, stack, digest, path, user_agent, metadata, created_at'),
      selectUserRows(supabase, 'push_subscriptions', 'endpoint, created_at'),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      profile: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        user_metadata: user.user_metadata,
      },
      data: {
        projects,
        goals,
        tasks,
        subtasks,
        feedback,
        analytics_events: analyticsEvents,
        app_errors: appErrors,
        push_subscriptions: pushSubscriptions,
      },
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename="taskflow-export-${user.id}.json"`,
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Could not export account data' }, { status: 500 });
  }
}