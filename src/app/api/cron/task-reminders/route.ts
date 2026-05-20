import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

type ReminderUserMetadata = {
  notification_lead_time_minutes?: number;
};

type ReminderTask = {
  id: string;
  user_id: string;
  title: string;
  due_date: string;
  due_time: string | null;
  due_timezone: string | null;
};

type PushDeliveryError = {
  statusCode?: number;
};

const VALID_LEAD_TIMES = new Set([0, 15, 60, 1440]);
const DEFAULT_REMINDER_HOUR = 9;

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getLocalDateParts(date: Date, timeZone: string) {
  const parts = (() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone,
      }).formatToParts(date);
    } catch {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC',
      }).formatToParts(date);
    }
  })();

  const getPart = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
    hour: getPart('hour'),
    minute: getPart('minute'),
  };
}

function getCurrentLocalMs(timeZone: string) {
  const parts = getLocalDateParts(new Date(), timeZone);
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}

function getTaskLocalMs(dueDate: string, dueTime?: string | null, fallbackHour = DEFAULT_REMINDER_HOUR, fallbackMinute = 0) {
  const [year, month, day] = dueDate.split('-').map(Number);
  const [hour, minute] = dueTime ? dueTime.split(':').map(Number) : [fallbackHour, fallbackMinute];

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return Date.UTC(year, month - 1, day, fallbackHour, fallbackMinute);
  }

  return Date.UTC(year, month - 1, day, hour, minute);
}

function normalizeLeadTime(value: unknown) {
  return typeof value === 'number' && VALID_LEAD_TIMES.has(value) ? value : 60;
}

function isTaskReadyForReminder(task: ReminderTask, metadata: ReminderUserMetadata) {
  const leadTimeMinutes = normalizeLeadTime(metadata.notification_lead_time_minutes);
  const timeZone = task.due_timezone || 'UTC';
  const nowLocalMs = getCurrentLocalMs(timeZone);
  const reminderLocalMs = getTaskLocalMs(task.due_date, task.due_time) - leadTimeMinutes * 60 * 1000;
  const dueDayEndLocalMs = getTaskLocalMs(task.due_date, null, 23, 59);

  return nowLocalMs >= reminderLocalMs && nowLocalMs <= dueDayEndLocalMs;
}

function isExpiredPushSubscription(reason: unknown) {
  const statusCode = (reason as PushDeliveryError | null)?.statusCode;
  return statusCode === 404 || statusCode === 410;
}

async function listUsersById(userIds: string[]) {
  const supabase = createAdminClient();
  const users = new Map<string, ReminderUserMetadata>();
  let page = 1;

  while (users.size < userIds.length) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });

    if (error) throw error;
    if (data.users.length === 0) break;

    for (const user of data.users) {
      if (userIds.includes(user.id)) {
        users.set(user.id, user.user_metadata as ReminderUserMetadata);
      }
    }

    page += 1;
  }

  return users;
}

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization');

  return Boolean(cronSecret && authorization === `Bearer ${cronSecret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vapidEmail = process.env.VAPID_EMAIL;
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!vapidEmail || !vapidPublicKey || !vapidPrivateKey) {
    return NextResponse.json({ error: 'Push notifications are not configured' }, { status: 503 });
  }

  const supabase = createAdminClient();
  const today = new Date();
  const fromDate = getDateKey(addDays(today, -1));
  const toDate = getDateKey(addDays(today, 2));

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, user_id, title, due_date, due_time, due_timezone')
    .not('due_date', 'is', null)
    .neq('status', 'done')
    .is('archived_at', null)
    .gte('due_date', fromDate)
    .lte('due_date', toDate)
    .limit(1000);

  if (tasksError) {
    return NextResponse.json({ error: tasksError.message }, { status: 500 });
  }

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ checked: 0, due: 0, sent: 0, failed: 0, removed: 0, skipped: 0 });
  }

  const userIds = [...new Set(tasks.map((task) => task.user_id))];
  const users = await listUsersById(userIds);
  const dueTasks = (tasks as ReminderTask[]).filter((task) => {
    const metadata = users.get(task.user_id) ?? {};
    return isTaskReadyForReminder(task, metadata);
  });

  if (dueTasks.length === 0) {
    return NextResponse.json({ checked: tasks.length, due: 0, sent: 0, failed: 0, removed: 0, skipped: 0 });
  }

  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', [...new Set(dueTasks.map((task) => task.user_id))]);

  if (subscriptionsError) {
    return NextResponse.json({ error: subscriptionsError.message }, { status: 500 });
  }

  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

  let sent = 0;
  let failed = 0;
  let removed = 0;
  let skipped = 0;

  for (const task of dueTasks) {
    const metadata = users.get(task.user_id) ?? {};

    const leadTimeMinutes = normalizeLeadTime(metadata.notification_lead_time_minutes);
    const reminderKey = `${task.due_date}:${task.due_time || '09:00'}:${task.due_timezone || 'UTC'}:${leadTimeMinutes}`;
    const { error: deliveryError } = await supabase.from('notification_deliveries').insert({
      user_id: task.user_id,
      task_id: task.id,
      delivery_type: 'task_reminder',
      reminder_key: reminderKey,
    });

    if (deliveryError) {
      skipped += 1;
      continue;
    }

    const userSubscriptions = subscriptions?.filter((subscription) => subscription.user_id === task.user_id) ?? [];

    if (userSubscriptions.length === 0) {
      failed += 1;
      continue;
    }

    const results = await Promise.allSettled(
      userSubscriptions.map((subscription) =>
        webpush.sendNotification(
          { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
          JSON.stringify({
            title: 'Task reminder',
            body: task.title,
            url: '/dashboard',
          })
        )
      )
    );

    const expiredEndpoints = results.flatMap((result, index) => {
      if (result.status === 'rejected' && isExpiredPushSubscription(result.reason)) {
        return userSubscriptions[index].endpoint;
      }

      return [];
    });

    if (expiredEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', task.user_id)
        .in('endpoint', expiredEndpoints);
      removed += expiredEndpoints.length;
    }

    sent += results.filter((result) => result.status === 'fulfilled').length;
    failed += results.filter((result) => result.status === 'rejected').length;
  }

  return NextResponse.json({ checked: tasks.length, due: dueTasks.length, sent, failed, removed, skipped });
}