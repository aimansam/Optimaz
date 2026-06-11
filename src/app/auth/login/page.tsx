'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, FolderOpen, Target, ArrowLeft } from 'lucide-react';

const supabase = createClient();

export default function LoginPage() {
  const [loading, setLoading] = useState<'google' | null>(null);
  const [accepted, setAccepted] = useState(false);

  const signIn = async (provider: 'google') => {
    if (!accepted) return;
    setLoading(provider);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
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
            <button
              onClick={() => signIn('google')}
              disabled={!!loading || !accepted}
              title={!accepted ? 'Please accept the Terms of Service and Privacy Policy to continue' : undefined}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/12 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading === 'google' ? (
                <span className="text-slate-400">Connecting...</span>
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
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            Curious about paid features?{' '}
            <Link href="/pricing" className="text-slate-300 hover:text-white">Join the pricing waitlist</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

