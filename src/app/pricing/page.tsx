import Link from 'next/link';
import { CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { PricingWaitlistForm } from '@/components/pricing/pricing-waitlist-form';

const signals = [
  'Project, task, goal, and Kanban workflows stay free during beta.',
  'Paid plans should focus on high-value power features, not basic access.',
  'Waitlist feedback decides whether recurring tasks, calendar view, reminders, or team sharing comes first.',
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-[#0a0a0f] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-8 flex items-center justify-between gap-4 text-sm">
          <Link href="/auth/login" className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              <Zap className="h-4 w-4" fill="currentColor" />
            </span>
            TaskFlow
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">Privacy</Link>
            <Link href="/auth/login" className="font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Sign in</Link>
          </div>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <section className="pt-4">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <Sparkles className="h-3.5 w-3.5" />
              Beta pricing research
            </div>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">TaskFlow is free during beta</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
              Join the pricing waitlist if you want a paid plan later and tell us which upgrade would actually matter to your workflow.
            </p>

            <div className="mt-6 space-y-3">
              {signals.map(signal => (
                <div key={signal} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{signal}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Join the waitlist</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">No payment required. This only helps prioritize what should become a paid upgrade.</p>
            <div className="mt-5">
              <PricingWaitlistForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}