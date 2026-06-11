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
  user_id: string;
  event_name: string;
  created_at: string;
};

type NotificationDeliveryRow = {
  id: string;
  user_id: string;
  task_id: string;
  delivery_type: string;
  reminder_key: string;
  sent_at: string;
};

type WaitlistRow = {
  id: string;
  email: string;
  intent: string | null;
  created_at: string;
};

type BetaUserRow = {
  id: string;
  email: string | undefined;
  created_at: string;
  last_sign_in_at: string | undefined;
};

type QueryResultWithError = {
  error: { message: string } | null;
};

function getAdminEmails() {
  return (process.env.OPTIMAZ_ADMIN_EMAILS ?? '')
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

function getCount(result: { count: number | null }) {
  return result.count ?? 0;
}

function getEventCounts(events: AnalyticsRow[]) {
  return events.reduce<Record<string, number>>((counts, event) => {
    counts[event.event_name] = (counts[event.event_name] ?? 0) + 1;
    return counts;
  }, {});
}

function getQueryErrors(results: [string, QueryResultWithError][]) {
  return results
    .filter(([, result]) => result.error)
    .map(([label, result]) => `${label}: ${result.error?.message}`);
}

function getMonitoringWindows() {
  const now = Date.now();

  return {
    since24Hours: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    since7Days: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
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

  const { since24Hours, since7Days } = getMonitoringWindows();

  // Fetch signed-up users via auth admin API (separate from DB queries)
  const usersResult = await admin.auth.admin.listUsers({ page: 1, perPage: 50 });
  const allUsersPage = usersResult.data?.users ?? [];
  const totalUsers = usersResult.data?.total ?? allUsersPage.length;
  const newUsers7d = allUsersPage.filter(u => u.created_at && u.created_at >= since7Days).length;
  const recentUsers: BetaUserRow[] = [...allUsersPage]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)
    .map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? undefined,
    }));

  const [
    feedbackResult,
    errorsResult,
    analyticsResult,
    deliveriesResult,
    waitlistResult,
    projectsCount,
    tasksCount,
    goalsCount,
    feedbackCount,
    errorsCount,
    analyticsCount,
    deliveriesCount,
    waitlistCount,
    feedback24hCount,
    errors24hCount,
    analytics24hCount,
    deliveries24hCount,
    analytics7dResult,
  ] = await Promise.all([
    admin.from('feedback').select('id, user_id, category, message, page_path, created_at').order('created_at', { ascending: false }).limit(20),
    admin.from('app_errors').select('id, user_id, source, message, path, created_at').order('created_at', { ascending: false }).limit(20),
    admin.from('analytics_events').select('user_id, event_name, created_at').order('created_at', { ascending: false }).limit(500),
    admin.from('notification_deliveries').select('id, user_id, task_id, delivery_type, reminder_key, sent_at').order('sent_at', { ascending: false }).limit(20),
    admin.from('pricing_waitlist').select('id, email, intent, created_at').order('created_at', { ascending: false }).limit(20),
    admin.from('projects').select('*', { count: 'exact', head: true }),
    admin.from('tasks').select('*', { count: 'exact', head: true }),
    admin.from('goals').select('*', { count: 'exact', head: true }),
    admin.from('feedback').select('*', { count: 'exact', head: true }),
    admin.from('app_errors').select('*', { count: 'exact', head: true }),
    admin.from('analytics_events').select('*', { count: 'exact', head: true }),
    admin.from('notification_deliveries').select('*', { count: 'exact', head: true }),
    admin.from('pricing_waitlist').select('*', { count: 'exact', head: true }),
    admin.from('feedback').select('*', { count: 'exact', head: true }).gte('created_at', since24Hours),
    admin.from('app_errors').select('*', { count: 'exact', head: true }).gte('created_at', since24Hours),
    admin.from('analytics_events').select('*', { count: 'exact', head: true }).gte('created_at', since24Hours),
    admin.from('notification_deliveries').select('*', { count: 'exact', head: true }).gte('sent_at', since24Hours),
    admin.from('analytics_events').select('user_id, event_name, created_at').gte('created_at', since7Days).limit(1000),
  ]);

  const feedback = (feedbackResult.data ?? []) as FeedbackRow[];
  const appErrors = (errorsResult.data ?? []) as AppErrorRow[];
  const analyticsEvents = (analyticsResult.data ?? []) as AnalyticsRow[];
  const notificationDeliveries = (deliveriesResult.data ?? []) as NotificationDeliveryRow[];
  const waitlist = (waitlistResult.data ?? []) as WaitlistRow[];
  const activeUsers7d = new Set(((analytics7dResult.data ?? []) as AnalyticsRow[]).map(event => event.user_id)).size;
  const eventCounts = getEventCounts(analyticsEvents);
  const topEvents = Object.entries(eventCounts).sort(([, firstCount], [, secondCount]) => secondCount - firstCount).slice(0, 8);
  const queryErrors = getQueryErrors([
    ['Feedback', feedbackResult],
    ['Errors', errorsResult],
    ['Analytics', analyticsResult],
    ['Notification deliveries', deliveriesResult],
    ['Waitlist', waitlistResult],
  ]);
  const totalCards = [
    ['Projects', getCount(projectsCount)],
    ['Tasks', getCount(tasksCount)],
    ['Goals', getCount(goalsCount)],
    ['Feedback', getCount(feedbackCount)],
    ['Errors', getCount(errorsCount)],
    ['Events', getCount(analyticsCount)],
    ['Reminders', getCount(deliveriesCount)],
    ['Waitlist', getCount(waitlistCount)],
  ];
  const healthCards = [
    ['Errors 24h', getCount(errors24hCount), 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300'],
    ['Feedback 24h', getCount(feedback24hCount), 'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'],
    ['Events 24h', getCount(analytics24hCount), 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300'],
    ['Reminders 24h', getCount(deliveries24hCount), 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300'],
    ['Active users 7d', activeUsers7d, 'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'],
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Admin Monitoring</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Usage, feedback, errors, waitlist, and reminder delivery signals for beta operations.</p>
        </section>

        {queryErrors.length > 0 && (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
            <h3 className="font-semibold">Some monitoring data could not load</h3>
            <div className="mt-2 space-y-1 text-sm">
              {queryErrors.map(errorMessage => <p key={errorMessage}>{errorMessage}</p>)}
            </div>
          </section>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {totalCards.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Beta Users</h3>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{totalUsers} total</Badge>
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300 opacity-80">Total signed up</p>
              <p className="mt-2 text-2xl font-semibold text-indigo-900 dark:text-indigo-100">{totalUsers}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 opacity-80">New this week</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">{newUsers7d}</p>
            </div>
          </div>
          {recentUsers.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Joined</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Last seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="max-w-[220px] truncate px-3 py-2 text-slate-700 dark:text-slate-300">{u.email ?? '(no email)'}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-500 dark:text-slate-400">{formatDate(u.created_at)}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-500 dark:text-slate-400">{u.last_sign_in_at ? formatDate(u.last_sign_in_at) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No users have signed up yet.</p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Operational Health</h3>
            <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Last 24 hours</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {healthCards.map(([label, value, className]) => (
              <div key={label} className={`rounded-lg border p-3 ${className}`}>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
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

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Recent Reminder Deliveries</h3>
            <div className="space-y-3">
              {notificationDeliveries.length > 0 ? notificationDeliveries.map(item => (
                <article key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{item.delivery_type}</Badge>
                    <span className="text-xs text-slate-400">{formatDate(item.sent_at)}</span>
                  </div>
                  <p className="truncate text-sm text-slate-700 dark:text-slate-300">Reminder key: {item.reminder_key}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">Task {item.task_id}</p>
                </article>
              )) : <p className="text-sm text-slate-400">No reminders delivered yet.</p>}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Recent Waitlist</h3>
            <div className="space-y-3">
              {waitlist.length > 0 ? waitlist.map(item => (
                <article key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Pricing</Badge>
                    <span className="text-xs text-slate-400">{formatDate(item.created_at)}</span>
                  </div>
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{item.email}</p>
                  {item.intent && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.intent}</p>}
                </article>
              )) : <p className="text-sm text-slate-400">No waitlist signups yet.</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}