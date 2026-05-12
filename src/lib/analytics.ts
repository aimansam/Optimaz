import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type AnalyticsEventName =
  | 'feedback_submitted'
  | 'goal_created'
  | 'onboarding_completed'
  | 'project_created'
  | 'pwa_install_accepted'
  | 'pwa_install_dismissed'
  | 'task_completed'
  | 'task_created';

export async function trackEvent(eventName: AnalyticsEventName, metadata: Record<string, unknown> = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name: eventName,
      metadata,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Analytics event failed', error);
    }
  }
}
