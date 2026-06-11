'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient();

export default function MFAChallengePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function initChallenge() {
      const { data, error: factorError } = await supabase.auth.mfa.listFactors();
      if (factorError || !data?.totp?.length) {
        // No MFA factors — send to dashboard (shouldn't normally reach here)
        router.replace('/dashboard');
        return;
      }
      const fId = data.totp[0].id;
      setFactorId(fId);
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: fId });
      if (challengeError) {
        setError(challengeError.message);
        return;
      }
      setChallengeId(challengeData.id);
      inputRef.current?.focus();
    }
    initChallenge();
  }, [router]);

  const handleVerify = async () => {
    if (!factorId || !challengeId) return;
    if (code.length !== 6) { setError('Enter the 6-digit code from your authenticator app.'); return; }
    setLoading(true);
    setError('');
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      setCode('');
      inputRef.current?.focus();
    } else {
      router.replace('/dashboard');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/login');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f] p-4">
      <div className="relative w-full max-w-sm">
        <button
          onClick={handleSignOut}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </button>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10">
              <ShieldCheck className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Two-factor authentication</h1>
              <p className="mt-1 text-sm text-slate-400">Open your authenticator app and enter the 6-digit code</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="totp-code" className="mb-1.5 block text-xs font-medium text-slate-400">
                Authentication code
              </label>
              <input
                id="totp-code"
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="000000"
                disabled={loading || !challengeId}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-2xl tracking-[0.5em] text-white placeholder-slate-600 outline-none transition-colors focus:border-indigo-500/60 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || !challengeId || code.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-slate-500">
            Lost access to your authenticator?{' '}
            <span className="text-slate-300">Contact support.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
