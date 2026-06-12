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
  Zap,
  Bell,
  Palette,
  ListTodo,
  TrendingUp,
  Check,
  X,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ListTodo,
    title: 'Smart Task List',
    desc: 'Capture, prioritise and complete work. Sort by urgency, filter by project, drag to reorder — all in one view.',
    accent: 'indigo',
  },
  {
    icon: FolderOpen,
    title: 'Projects',
    desc: 'Group tasks into focused projects. Support for sub-projects so your structure matches how you actually think.',
    accent: 'violet',
  },
  {
    icon: Target,
    title: 'Goals',
    desc: 'Set long-term outcomes, track progress with linked tasks, and see your completion rate over time.',
    accent: 'sky',
  },
  {
    icon: Kanban,
    title: 'Kanban Board',
    desc: 'Drag tasks across To Do → In Progress → Done. A visual workflow that stays in sync with your task list.',
    accent: 'emerald',
  },
  {
    icon: Repeat2,
    title: 'Routines',
    desc: 'Set up daily habits and recurring tasks that automatically rebuild themselves when completed.',
    accent: 'amber',
  },
  {
    icon: CalendarDays,
    title: 'Calendar View',
    desc: 'See every due date on a clean timeline. Quickly add tasks to any day by clicking the calendar.',
    accent: 'rose',
  },
  {
    icon: TrendingUp,
    title: 'Streak & Analytics',
    desc: 'Build consistency with a daily task streak. Track completions, overdue count, and progress at a glance.',
    accent: 'orange',
  },
  {
    icon: Palette,
    title: '7 Beautiful Themes',
    desc: 'Cloud, Sand, Mint, Blossom, Midnight, Obsidian, Forest. Your workspace, your look — light and dark included.',
    accent: 'pink',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Capture everything',
    desc: 'Add tasks in seconds with the Quick-Add button or the floating action button. Set priority, due date, and project without leaving the flow.',
  },
  {
    step: '02',
    title: 'Organise your way',
    desc: 'Group by project, view in Kanban, schedule on the calendar, or set long-term goals. Your system, your rules.',
  },
  {
    step: '03',
    title: 'Stay accountable',
    desc: 'Daily summary auto-pops when you open the dashboard. Your streak keeps you consistent day after day.',
  },
];

const FREE_FEATURES = [
  'Unlimited tasks',
  'Calendar view',
  'Goals tracking',
  '3 projects',
  'Mobile PWA',
  'Daily streak',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited projects',
  'Kanban board',
  'Recurring routines',
  'Push notifications & reminders',
  'Full analytics dashboard',
  '7 premium themes',
  'Priority support',
];

const ACCENT_MAP: Record<string, string> = {
  indigo: 'text-indigo-400 bg-indigo-500/10',
  violet: 'text-violet-400 bg-violet-500/10',
  sky: 'text-sky-400 bg-sky-500/10',
  emerald: 'text-emerald-400 bg-emerald-500/10',
  amber: 'text-amber-400 bg-amber-500/10',
  rose: 'text-rose-400 bg-rose-500/10',
  orange: 'text-orange-400 bg-orange-500/10',
  pink: 'text-pink-400 bg-pink-500/10',
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* ── Beta offer banner ────────────────────────────────── */}
      <div className="border-b border-white/5 bg-gradient-to-r from-indigo-950/60 via-violet-950/40 to-indigo-950/60 py-2 text-center text-xs font-medium text-slate-300">
        🎁 <span className="text-indigo-300 font-semibold">Beta offer:</span> Sign up now and get your first month of Pro <span className="text-white font-semibold">completely free</span> — no credit card required.
        <Link href="/auth/login" className="ml-2 text-indigo-400 underline underline-offset-2 hover:text-indigo-300">
          Claim it →
        </Link>
      </div>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/icon-192x192.png" alt="Optimaz" className="h-8 w-8 rounded-xl" />
            <span className="text-base font-bold tracking-tight">Optimaz</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="#features" className="hidden text-sm text-slate-400 transition-colors hover:text-white sm:block">
              Features
            </Link>
            <Link href="#pricing" className="hidden text-sm text-slate-400 transition-colors hover:text-white sm:block">
              Pricing
            </Link>
            <Link href="/auth/login" className="text-sm text-slate-400 transition-colors hover:text-white">
              Sign in
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-400"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          Now in beta — free Pro month for early users
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Stop juggling apps.{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            One workspace
          </span>{' '}
          for tasks, goals & projects.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
          Optimaz brings your daily to-dos, long-term goals, recurring routines, and project boards together in one calm, focused space. Less switching, more doing.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/auth/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 sm:w-auto"
          >
            <Zap className="h-4 w-4" />
            Start free — 1 month Pro included
          </Link>
          <Link
            href="#pricing"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition-all hover:border-white/20 hover:text-white sm:w-auto"
          >
            See pricing →
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-500">No credit card needed. Beta users get Pro free for 30 days.</p>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Every tool you need — nothing you don&apos;t
          </h2>
          <p className="mt-3 text-slate-400">Eight purpose-built views. One login. Zero bloat.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc, accent }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-white/10 hover:bg-white/[0.05]"
            >
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${ACCENT_MAP[accent]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-white">{title}</h3>
              <p className="text-xs leading-5 text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Built around how you actually work
          </h2>
          <p className="mt-3 text-slate-400">Three simple phases. Infinite clarity.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ step, title, desc }) => (
            <div key={step} className="relative rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <div className="mb-4 text-4xl font-black text-white/5">{step}</div>
              <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
              <p className="text-sm leading-6 text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Simple, honest pricing
          </h2>
          <p className="mt-3 text-slate-400">Start free. Upgrade when you&apos;re ready. Cancel any time.</p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">

          {/* Free tier */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-white">Free</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">RM 0</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">Everything you need to get started.</p>
            </div>
            <Link
              href="/auth/login"
              className="mb-6 block w-full rounded-xl border border-white/10 py-2.5 text-center text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/5"
            >
              Get started free
            </Link>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  {f}
                </li>
              ))}
              <li className="flex items-center gap-2.5 text-sm text-slate-500">
                <X className="h-4 w-4 shrink-0 text-slate-600" />
                Kanban board
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-500">
                <X className="h-4 w-4 shrink-0 text-slate-600" />
                Recurring routines
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-500">
                <X className="h-4 w-4 shrink-0 text-slate-600" />
                Push notifications
              </li>
            </ul>
          </div>

          {/* Pro tier */}
          <div className="relative rounded-2xl border border-indigo-500/40 bg-gradient-to-b from-indigo-500/10 to-violet-500/5 p-7">
            {/* Beta badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-indigo-500/30">
              🎁 1 Month Free for Beta Users
            </div>

            <div className="mb-5">
              <h3 className="text-lg font-bold text-white">Pro</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-sm text-slate-400 line-through">RM 15</span>
                <span className="ml-1.5 text-4xl font-black text-white">RM 0</span>
                <span className="text-slate-400">/first month</span>
              </div>
              <p className="mt-1 text-xs text-indigo-400 font-medium">then RM 15/mo — cancel any time</p>
            </div>
            <Link
              href="/auth/login"
              className="mb-6 block w-full rounded-xl bg-indigo-500 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400"
            >
              Claim free month
            </Link>
            <ul className="space-y-2.5">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                  <Check className="h-4 w-4 shrink-0 text-indigo-400" />
                  {f === 'Everything in Free' ? <span className="font-medium">{f}</span> : f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Beta pricing is subject to change. Existing users keep their current rate.
        </p>
      </section>

      {/* ── Push notifications highlight ──────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-6 rounded-2xl border border-white/5 bg-white/[0.03] p-8 sm:grid-cols-2 sm:items-center sm:p-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
              <Bell className="h-3.5 w-3.5" />
              Smart Reminders
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Never miss a deadline again
            </h2>
            <p className="mt-3 text-slate-400 leading-7">
              Optimaz sends push notifications to your phone before tasks are due. Set time-aware reminders, get daily digests, and stay on top of overdue items — even when the app is closed.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { emoji: '⏰', text: 'Task due reminders (15 min, 1 hour, same day)' },
              { emoji: '📋', text: 'Daily morning digest of your day ahead' },
              { emoji: '🔴', text: 'Overdue task alerts so nothing slips through' },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                <span className="text-lg">{emoji}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            Limited time beta offer
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Join the beta. Get Pro free.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Sign in with Google and unlock 30 days of Pro — Kanban, routines, reminders, all themes, and analytics included. No card, no catch.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100"
            >
              <Zap className="h-4 w-4" />
              Start free — claim your Pro month
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-500">Takes under 30 seconds. No credit card required.</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
            <div className="flex items-center gap-2">
              <img src="/icon-192x192.png" alt="Optimaz" className="h-5 w-5 rounded-md" />
              <span className="font-medium text-slate-400">Optimaz</span>
              <span className="text-slate-600">·</span>
              <span>by Mavora Digital</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#features" className="transition-colors hover:text-slate-300">Features</Link>
              <Link href="#pricing" className="transition-colors hover:text-slate-300">Pricing</Link>
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
