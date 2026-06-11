import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  CheckCircle2,
  FolderOpen,
  Target,
  Kanban,
  Repeat2,
  CalendarDays,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const FEATURES = [
  {
    icon: CheckCircle2,
    title: 'Tasks',
    desc: 'Capture, prioritise, and complete your daily work. Subtasks, due dates, and priorities included.',
  },
  {
    icon: FolderOpen,
    title: 'Projects',
    desc: 'Group tasks into focused projects. Nest sub-projects to match how you actually think.',
  },
  {
    icon: Target,
    title: 'Goals',
    desc: 'Define long-term objectives and track your progress over days, weeks, and months.',
  },
  {
    icon: Kanban,
    title: 'Kanban',
    desc: 'Drag and drop tasks across columns. A visual board that stays in sync with your task list.',
  },
  {
    icon: Repeat2,
    title: 'Routines',
    desc: 'Set up repeating habits and recurring tasks that rebuild themselves automatically.',
  },
  {
    icon: CalendarDays,
    title: 'Calendar',
    desc: 'See everything with a due date on a clean timeline. Day, week, and month views.',
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/icon-192x192.png" alt="Optimaz" className="h-8 w-8 rounded-xl" />
            <span className="text-base font-bold tracking-tight">Optimaz</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/pricing"
              className="hidden text-sm text-slate-400 transition-colors hover:text-white sm:block"
            >
              Pricing
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100"
              >
                Go to app
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100"
                >
                  Get started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
        {/* Beta badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          Free during beta
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Your quiet workspace for{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            tasks, projects & goals
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
          Optimaz brings your daily tasks, long-term goals, and ongoing projects into one calm, focused workspace. Less noise, more done.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/auth/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 sm:w-auto"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition-all hover:border-white/20 hover:text-white sm:w-auto"
          >
            See pricing →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Everything you need to stay on track
          </h2>
          <p className="mt-3 text-slate-400">Six tools. One workspace. No friction.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 transition-all hover:border-white/10 hover:bg-white/[0.05]"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
              <p className="text-sm leading-6 text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to get organised?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Sign in with Google and start in under 30 seconds. No credit card needed.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
            <div className="flex items-center gap-2">
              <img src="/icon-192x192.png" alt="Optimaz" className="h-5 w-5 rounded-md" />
              <span className="font-medium text-slate-400">Optimaz</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/pricing" className="transition-colors hover:text-slate-300">Pricing</Link>
              <Link href="/privacy" className="transition-colors hover:text-slate-300">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:text-slate-300">Terms</Link>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-600 sm:text-right">
            © {new Date().getFullYear()} Mavora Digital. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
