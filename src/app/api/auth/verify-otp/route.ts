import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWelcomeEmail } from '@/lib/welcome-email';
import crypto from 'crypto';

const MAX_ATTEMPTS = 5; // ban after this many wrong guesses

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code || typeof email !== 'string' || typeof code !== 'string') {
      return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();
    const admin = createAdminClient();

    // --- Look up the pending OTP ---
    const { data: row, error: fetchError } = await admin
      .from('pending_otps')
      .select('id, code_hash, expires_at, attempts')
      .eq('email', normalised)
      .maybeSingle();

    if (fetchError) {
      console.error('[verify-otp] fetch error:', fetchError);
      return NextResponse.json({ error: 'Failed to verify code. Please try again.' }, { status: 500 });
    }

    if (!row) {
      return NextResponse.json({ error: 'No code was requested for this email. Please request a new one.' }, { status: 400 });
    }

    // --- Check expiry ---
    if (new Date(row.expires_at) < new Date()) {
      await admin.from('pending_otps').delete().eq('id', row.id);
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 });
    }

    // --- Check attempt count ---
    if (row.attempts >= MAX_ATTEMPTS) {
      await admin.from('pending_otps').delete().eq('id', row.id);
      return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new code.' }, { status: 400 });
    }

    // --- Verify the code ---
    const inputHash = hashCode(code.trim());
    if (inputHash !== row.code_hash) {
      // Increment attempt counter
      await admin
        .from('pending_otps')
        .update({ attempts: row.attempts + 1 })
        .eq('id', row.id);

      const remaining = MAX_ATTEMPTS - row.attempts - 1;
      return NextResponse.json(
        { error: remaining > 0 ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` : 'Too many incorrect attempts. Please request a new code.' },
        { status: 400 },
      );
    }

    // --- Code is correct — delete the pending OTP row ---
    await admin.from('pending_otps').delete().eq('id', row.id);

    // --- Create or retrieve Supabase user ---
    // Check if user already exists
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
    if (listError) {
      console.error('[verify-otp] listUsers error:', listError);
      return NextResponse.json({ error: 'Failed to process sign-in. Please try again.' }, { status: 500 });
    }

    const existingUser = users.find(u => u.email?.toLowerCase() === normalised);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create confirmed user (no password, email already verified)
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: normalised,
        email_confirm: true,
      });

      if (createError || !newUser.user) {
        console.error('[verify-otp] createUser error:', createError);
        return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
      }

      userId = newUser.user.id;
      // Send welcome email (fire-and-forget — don't block the sign-in response)
      sendWelcomeEmail(normalised).catch(() => {});
    }

    // --- Generate a magic link / session token for the user ---
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: normalised,
    });

    if (linkError || !linkData.properties?.hashed_token) {
      console.error('[verify-otp] generateLink error:', linkError);
      return NextResponse.json({ error: 'Failed to create session. Please try again.' }, { status: 500 });
    }

    // Return the magic link token so the client can exchange it for a session
    return NextResponse.json({
      ok: true,
      token: linkData.properties.hashed_token,
      email: normalised,
    });
  } catch (err) {
    console.error('[verify-otp] unexpected error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
