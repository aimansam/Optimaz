import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

type PushDeliveryError = {
  statusCode?: number;
};

function isExpiredPushSubscription(reason: unknown) {
  const statusCode = (reason as PushDeliveryError | null)?.statusCode;
  return statusCode === 404 || statusCode === 410;
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

  const { title, body, url } = await request.json();

  if (!title || !body) {
    return NextResponse.json({ error: 'Missing notification title or body' }, { status: 400 });
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
