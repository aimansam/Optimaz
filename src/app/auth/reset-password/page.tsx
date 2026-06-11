'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AuthChangeEvent } from '@supabase/supabase-js';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

const supabase = createClient();

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase exchanges the recovery token in the URL hash automatically
  // on the client — we just need to wait for the session to be established.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessionReady(true);
      }
    });
    // Also check if a session already exists (e.g. page reload after recovery link)
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) setSessionReady(true);
    }
    void checkSession();
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (!password) { setError('Please enter a new password.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    setSuccess(true);
    setTimeout(() => router.replace('/dashboard'), 2000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f] p-4">
      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">

          {/* Icon + heading */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10">
              <KeyRound className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Set new password</h1>
              <p className="mt-1 text-sm text-slate-400">Choose a strong password for your account</p>
            </div>
          </div>

          {success ? (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-400">
              Password updated! Redirecting to your dashboard…
            </div>
          ) : (
            <div className="space-y-4">
              {!sessionReady && (
                <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-400 text-center">
                  Verifying reset link…
                </p>
              )}

              {/* New password */}
              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-xs font-medium text-slate-400">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                    placeholder="Min. 8 characters"
                    disabled={loading || !sessionReady}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500/60 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                    placeholder="Re-enter new password"
                    disabled={loading || !sessionReady}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500/60 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
              )}

              <button
                onClick={handleReset}
                disabled={loading || !sessionReady || !password || !confirm}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? 'Updating password…' : 'Update password'}
              </button>

              <div className="text-center">
                <button
                  onClick={() => router.replace('/auth/login')}
                  className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-300 transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
