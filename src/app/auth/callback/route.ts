import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/welcome-email';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Detect new user: created_at within the last 60 seconds
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && user.created_at) {
        const ageMs = Date.now() - new Date(user.created_at).getTime();
        if (ageMs < 60_000) {
          // Fire and forget — don't await so it doesn't delay the redirect
          sendWelcomeEmail(user.email).catch(() => {});
        }
      }

      // Check if user has MFA enrolled and needs to complete a second factor challenge
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
        return NextResponse.redirect(`${origin}/auth/mfa`);
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
