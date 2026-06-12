import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

// How long the OTP is valid (keep in sync with the countdown on the login page)
const OTP_TTL_MINUTES = 10;
// Max send attempts per IP per hour (simple abuse prevention)
const MAX_SENDS_PER_IP = 5;

function generateOtp(): string {
  // Cryptographically secure 6-digit code
  return String(crypto.randomInt(100000, 1000000)).padStart(6, '0');
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalised)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // --- Rate-limit check (IP-based, via pending_otps created_at) ---
    const admin = createAdminClient();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from('pending_otps')
      .select('id', { count: 'exact', head: true })
      .eq('email', normalised)
      .gte('created_at', oneHourAgo);

    if ((count ?? 0) >= MAX_SENDS_PER_IP) {
      return NextResponse.json(
        { error: 'Too many code requests. Please wait a while before trying again.' },
        { status: 429 },
      );
    }

    // --- Generate OTP ---
    const code = generateOtp();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    // Upsert: replace any existing pending OTP for this email
    const { error: upsertError } = await admin
      .from('pending_otps')
      .upsert(
        { email: normalised, code_hash: codeHash, expires_at: expiresAt, attempts: 0 },
        { onConflict: 'email' },
      );

    if (upsertError) {
      console.error('[send-otp] upsert error:', upsertError);
      return NextResponse.json({ error: 'Failed to generate code. Please try again.' }, { status: 500 });
    }

    // --- Send email via Resend ---
    const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'noreply@optimaz.app';

    const { error: emailError } = await resend.emails.send({
      from: fromAddress,
      to: normalised,
      subject: `${code} is your Optimaz sign-in code`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #fff;">
          <img src="https://optimaz.app/icon-192x192.png" alt="Optimaz" width="48" height="48" style="border-radius: 12px; margin-bottom: 24px;" />
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Your sign-in code</h2>
          <p style="font-size: 14px; color: #64748b; margin: 0 0 24px;">Use the code below to sign in to Optimaz. It expires in ${OTP_TTL_MINUTES} minutes.</p>
          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 0.35em; color: #0f172a; font-variant-numeric: tabular-nums;">${code}</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">If you didn't request this, you can safely ignore this email. Someone may have typed your address by mistake.</p>
        </div>
      `,
      text: `Your Optimaz sign-in code is: ${code}\n\nIt expires in ${OTP_TTL_MINUTES} minutes.\n\nIf you didn't request this, ignore this email.`,
    });

    if (emailError) {
      console.error('[send-otp] resend error:', emailError);
      // Clean up the pending_otps row we just created so the user can retry
      await admin.from('pending_otps').delete().eq('email', normalised);
      return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[send-otp] unexpected error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
