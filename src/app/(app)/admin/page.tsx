import { Badge } from '@/components/ui/badge';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

type FeedbackRow = {
  id: string;
  user_id: string;
  category: string;
  message: string;
  page_path: string | null;
  created_at: string;
};

type AppErrorRow = {
  id: string;
  user_id: string | null;
  source: string;
  message: string;
  path: string | null;
  created_at: string;
};

type AnalyticsRow = {
  event_name: string;
  created_at: string;
};

function getAdminEmails() {
  return (process.env.TASKFLOW_ADMIN_EMAILS ?? '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getEventCounts(events: AnalyticsRow[]) {
  return events.reduce<Record<string, number>>((counts, event) => {
    counts[event.event_name] = (counts[event.event_name] ?? 0) + 1;
    return counts;
  }, {});
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  const adminEmails = getAdminEmails();

  if (error || !user?.email || !adminEmails.includes(user.email.toLowerCase())) {
    notFound();
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          <h2 className="font-semibold">Admin access is not configured</h2>
          <p className="mt-2 text-sm">Add SUPABASE_SERVICE_ROLE_KEY in Vercel to load feedback, errors, and usage signals.</p>
        </div>
      </div>
    );
  }

  const [feedbackResult, errorsResult, analyticsResult, projectsCount, tasksCount, goalsCount, feedbackCount, errorsCount] = await Promise.all([
    admin.from('feedback').select('id, user_id, category, message, page_path, created_at').order('created_at', { ascending: false }).limit(20),
    admin.from('app_errors').select('id, user_id, source, message, path, created_at').order('created_at', { ascending: false }).limit(20),
    admin.from('analytics_events').select('event_name, created_at').order('created_at', { ascending: false }).limit(500),
    admin.from('projects').select('*', { count: 'exact', head: true }),
    admin.from('tasks').select('*', { count: 'exact', head: true }),
    admin.from('goals').select('*', { count: 'exact', head: true }),
    admin.from('feedback').select('*', { count: 'exact', head: true }),
    admin.from('app_errors').select('*', { count: 'exact', head: true }),
  ]);

  const feedback = (feedbackResult.data ?? []) as FeedbackRow[];
  const appErrors = (errorsResult.data ?? []) as AppErrorRow[];
  const analyticsEvents = (analyticsResult.data ?? []) as AnalyticsRow[];
  const eventCounts = getEventCounts(analyticsEvents);
  const topEvents = Object.entries(eventCounts).sort(([, firstCount], [, secondCount]) => secondCount - firstCount).slice(0, 8);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Admin Insights</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Feedback, errors, and usage signals for beta operations.</p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Projects', projectsCount.count ?? 0],
            ['Tasks', tasksCount.count ?? 0],
            ['Goals', goalsCount.count ?? 0],
            ['Feedback', feedbackCount.count ?? 0],
            ['Errors', errorsCount.count ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Top Recent Events</h3>
            <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{analyticsEvents.length} events</Badge>
          </div>
          {topEvents.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {topEvents.map(([eventName, count]) => (
                <div key={eventName} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{eventName}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{count}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No tracked events yet.</p>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Recent Feedback</h3>
            <div className="space-y-3">
              {feedback.length > 0 ? feedback.map(item => (
                <article key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.category}</Badge>
                    <span className="text-xs text-slate-400">{formatDate(item.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item.message}</p>
                  {item.page_path && <p className="mt-2 text-xs text-slate-400">{item.page_path}</p>}
                </article>
              )) : <p className="text-sm text-slate-400">No feedback yet.</p>}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Recent Errors</h3>
            <div className="space-y-3">
              {appErrors.length > 0 ? appErrors.map(item => (
                <article key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">{item.source}</Badge>
                    <span className="text-xs text-slate-400">{formatDate(item.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item.message}</p>
                  {item.path && <p className="mt-2 text-xs text-slate-400">{item.path}</p>}
                </article>
              )) : <p className="text-sm text-slate-400">No recorded errors yet.</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}