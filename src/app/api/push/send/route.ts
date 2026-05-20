import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

type PushDeliveryError = {
  statusCode?: number;
};

type QuietHoursSettings = {
  enabled?: boolean;
  start?: string;
  end?: string;
  timeZone?: string;
};

function isExpiredPushSubscription(reason: unknown) {
  const statusCode = (reason as PushDeliveryError | null)?.statusCode;
  return statusCode === 404 || statusCode === 410;
}

function timeToMinutes(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const [hours, minutes] = value.split(':').map(Number);

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function getCurrentMinutes(timeZone: string) {
  const parts = (() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone,
      }).formatToParts(new Date());
    } catch {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC',
      }).formatToParts(new Date());
    }
  })();
  const hours = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minutes = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);

  return hours * 60 + minutes;
}

function isWithinQuietHours(settings: QuietHoursSettings | undefined) {
  if (!settings?.enabled || !settings.start || !settings.end || settings.start === settings.end) {
    return false;
  }

  const current = getCurrentMinutes(settings.timeZone || 'UTC');
  const start = timeToMinutes(settings.start);
  const end = timeToMinutes(settings.end);

  if (start === null || end === null) {
    return false;
  }

  if (start < end) {
    return current >= start && current < end;
  }

  return current >= start || current < end;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vapidEmail = process.env.VAPID_EMAIL;
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!vapidEmail || !vapidPublicKey || !vapidPrivateKey) {
    return NextResponse.json({ error: 'Push notifications are not configured' }, { status: 503 });
  }

  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

  const { title, body, url, ignoreQuietHours } = await request.json();

  if (!title || !body) {
    return NextResponse.json({ error: 'Missing notification title or body' }, { status: 400 });
  }

  const quietHours = user.user_metadata?.notification_quiet_hours as QuietHoursSettings | undefined;

  if (!ignoreQuietHours && isWithinQuietHours(quietHours)) {
    return NextResponse.json({ sent: 0, failed: 0, removed: 0, muted: true });
  }

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', user.id);

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ message: 'No subscriptions found' });
  }

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        JSON.stringify({ title, body, url })
      )
    )
  );

  const expiredEndpoints = results.flatMap((result, index) => {
    if (result.status === 'rejected' && isExpiredPushSubscription(result.reason)) {
      return subscriptions[index].endpoint;
    }

    return [];
  });

  if (expiredEndpoints.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .in('endpoint', expiredEndpoints);
  }

  return NextResponse.json({
    sent: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length,
    removed: expiredEndpoints.length,
  });
}
