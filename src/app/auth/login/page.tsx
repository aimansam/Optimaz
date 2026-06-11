'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, CheckCircle2, FolderOpen, Mail, ShieldCheck, Target } from 'lucide-react';

const supabase = createClient();

// OTP expires in 2 minutes — match this with Supabase Dashboard:
// Authentication → Configuration → OTP Expiry → set to 120
const OTP_EXPIRY_SECONDS = 120;

type OAuthProvider = 'google' | 'github';
type LoadingState = OAuthProvider | 'send_otp' | 'verify_otp' | null;
type EmailStep = 'input' | 'verify';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<LoadingState>(null);
  const [accepted, setAccepted] = useState(false);

  // OAuth
  const signInWithOAuth = async (provider: OAuthProvider) => {
    if (!accepted) return;
    setLoading(provider);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  // Email OTP state
  const [email, setEmail] = useState('');
  const [emailStep, setEmailStep] = useState<EmailStep>('input');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const isExpired = emailStep === 'verify' && countdown === 0;

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  function startCountdown() {
    setCountdown(OTP_EXPIRY_SECONDS);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  function fmt(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  const sendOTP = async () => {
    if (!accepted || !email.trim()) { setError('Please enter your email address.'); return; }
    setError('');
    setLoading('send_otp');
    // No emailRedirectTo — instructs Supabase to send a 6-digit OTP code, not a magic link URL
    const { error: sendError } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setLoading(null);
    if (sendError) { setError(sendError.message); return; }
    setEmailStep('verify');
    setOtpCode('');
    startCountdown();
    setTimeout(() => otpInputRef.current?.focus(), 80);
  };

  const verifyOTP = async () => {
    if (isExpired) { setError('Code has expired. Please request a new one.'); return; }
    if (otpCode.length !== 6) { setError('Enter the 6-digit code from your email.'); return; }
    setError('');
    setLoading('verify_otp');
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otpCode,
      type: 'email',
    });
    setLoading(null);
    if (verifyError) { setError(verifyError.message); setOtpCode(''); return; }
    router.replace('/dashboard');
  };

  const resendOTP = () => {
    setOtpCode('');
    setError('');
    sendOTP();
  };

  const resetEmail = () => {
    setEmailStep('input');
    setOtpCode('');
    setError('');
    setCountdown(0);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f] p-4">
      <div className="relative w-full max-w-sm">
        {/* Back button */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">

          {emailStep === 'verify' ? (
            /* ── Step 2: OTP verify ── */
            <>
              <div className="mb-6 flex flex-col items-center gap-3 text-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors ${isExpired ? 'border-red-500/30 bg-red-500/10' : 'border-indigo-500/30 bg-indigo-500/10'}`}>
                  <ShieldCheck className={`h-7 w-7 ${isExpired ? 'text-red-400' : 'text-indigo-400'}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Check your email</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    We sent a 6-digit code to <span className="text-slate-200">{email}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Countdown */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Code valid for</span>
                  {isExpired ? (
                    <span className="font-semibold text-red-400">Expired</span>
                  ) : (
                    <span className={`font-semibold tabular-nums ${countdown <= 30 ? 'text-amber-400' : 'text-slate-300'}`}>
                      {fmt(countdown)}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-1 rounded-full transition-all duration-1000 ${isExpired ? 'bg-red-500' : countdown <= 30 ? 'bg-amber-400' : 'bg-indigo-500'}`}
                    style={{ width: isExpired ? '0%' : `${(countdown / OTP_EXPIRY_SECONDS) * 100}%` }}
                  />
                </div>

                {/* Code input */}
                <div>
                  <label htmlFor="otp-code" className="mb-1.5 block text-xs font-medium text-slate-400">
                    Verification code
                  </label>
                  <input
                    id="otp-code"
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && verifyOTP()}
                    placeholder="000000"
                    disabled={!!loading || isExpired}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-2xl tracking-[0.5em] text-white placeholder-slate-600 outline-none transition-colors focus:border-indigo-500/60 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </div>

                {error && (
                  <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
                )}

                {isExpired ? (
                  <button
                    onClick={resendOTP}
                    disabled={!!loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/12 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading === 'send_otp' ? 'Sending…' : 'Send new code'}
                  </button>
                ) : (
                  <button
                    onClick={verifyOTP}
                    disabled={!!loading || otpCode.length !== 6}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading === 'verify_otp' ? 'Verifying…' : 'Verify & sign in'}
                  </button>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button onClick={resetEmail} className="underline underline-offset-2 hover:text-slate-300">
                    Use a different email
                  </button>
                  {!isExpired && (
                    <button onClick={resendOTP} disabled={!!loading} className="underline underline-offset-2 hover:text-slate-300 disabled:opacity-40">
                      Resend code
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ── Step 1: Login options ── */
            <>
              {/* Logo */}
              <div className="mb-8 flex flex-col items-center gap-4">
                <Link href="/" className="flex flex-col items-center gap-4 group">
                  <img src="/icon-192x192.png" alt="Optimaz" className="h-14 w-14 rounded-2xl shadow-lg shadow-black/40 transition-opacity group-hover:opacity-80" />
                  <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-white group-hover:opacity-80 transition-opacity">Optimaz</h1>
                  </div>
                </Link>
                <p className="text-sm text-slate-400">Plan tasks, projects, and goals in one quiet workspace</p>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
                {[
                  [CheckCircle2, 'Tasks'],
                  [FolderOpen, 'Projects'],
                  [Target, 'Goals'],
                ].map(([Icon, label]) => (
                  <div key={label as string} className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2">
                    <Icon className="mx-auto mb-1 h-3.5 w-3.5 text-slate-300" />
                    <span>{label as string}</span>
                  </div>
                ))}
              </div>

              {/* Terms & Privacy acceptance */}
              <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${accepted ? 'border-indigo-500 bg-indigo-500' : 'border-white/30 bg-white/5'}`}>
                    {accepted && (
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs leading-relaxed text-slate-400">
                  I agree to the{' '}
                  <Link href="/terms" onClick={(e) => e.stopPropagation()} className="text-slate-200 underline underline-offset-2 hover:text-white">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" onClick={(e) => e.stopPropagation()} className="text-slate-200 underline underline-offset-2 hover:text-white">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <div className="space-y-3">
                {/* Google */}
                <button
                  onClick={() => signInWithOAuth('google')}
                  disabled={!!loading || !accepted}
                  title={!accepted ? 'Please accept the Terms of Service and Privacy Policy to continue' : undefined}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/12 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading === 'google' ? (
                    <span className="text-slate-400">Connecting…</span>
                  ) : (
                    <>
                      <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                {/* GitHub */}
                <button
                  onClick={() => signInWithOAuth('github')}
                  disabled={!!loading || !accepted}
                  title={!accepted ? 'Please accept the Terms of Service and Privacy Policy to continue' : undefined}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/12 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading === 'github' ? (
                    <span className="text-slate-400">Connecting…</span>
                  ) : (
                    <>
                      <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                      </svg>
                      Continue with GitHub
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-slate-500">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Email OTP */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && sendOTP()}
                      placeholder="your@email.com"
                      disabled={!!loading || !accepted}
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500/60 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
                    />
                    <button
                      onClick={sendOTP}
                      disabled={!!loading || !accepted || !email.trim()}
                      title={!accepted ? 'Please accept the Terms of Service and Privacy Policy to continue' : undefined}
                      className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/12 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {loading === 'send_otp' ? (
                        <span className="text-slate-400 text-xs">Sending…</span>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 shrink-0" />
                          <span>Send code</span>
                        </>
                      )}
                    </button>
                  </div>
                  {error && (
                    <p className="text-xs text-red-400">{error}</p>
                  )}
                  <p className="text-[11px] text-slate-500 text-center">
                    Passwordless — we&apos;ll email you a 6-digit code (valid 2 min)
                  </p>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-slate-500">
                Curious about paid features?{' '}
                <Link href="/pricing" className="text-slate-300 hover:text-white">Join the pricing waitlist</Link>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
