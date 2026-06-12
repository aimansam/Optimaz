import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
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
  Gift,
  Clock,
  ClipboardList,
  AlertCircle,
  Layers,
  MonitorSmartphone,
  Wind,
  ShieldCheck,
  Lock,
  MapPin,
  Users,
  Link2,
} from 'lucide-react';

// Feature cards — reordered by purchase priority (Themes last)
const FEATURES = [
  {
    icon: ListTodo,
    title: 'Smart Task List',
    desc: 'Capture, prioritise and complete work. Sort by urgency, drag to reorder, filter by project — all in one view.',
    accent: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Target,
    title: 'Goals',
    desc: 'Set long-term outcomes, track progress with linked tasks, and see your completion rate over time.',
    accent: 'bg-sky-50 text-sky-600',
  },
  {
    icon: FolderOpen,
    title: 'Projects',
    desc: 'Group tasks into focused projects with support for sub-projects so your structure matches how you think.',
    accent: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Repeat2,
    title: 'Routines',
    desc: 'Set up daily habits and recurring tasks that rebuild themselves automatically when completed.',
    accent: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Kanban,
    title: 'Kanban Board',
    desc: 'Drag tasks across To Do → In Progress → Done. Visual workflow that stays in sync with your task list.',
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: CalendarDays,
    title: 'Calendar View',
    desc: 'See every due date on a clean timeline. Click any day to quickly add tasks.',
    accent: 'bg-rose-50 text-rose-600',
  },
  {
    icon: TrendingUp,
    title: 'Streak & Analytics',
    desc: 'Build consistency with a daily task streak. Track completions and progress at a glance.',
    accent: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Palette,
    title: '7 Beautiful Themes',
    desc: 'Cloud, Sand, Mint, Blossom, Midnight, Obsidian, Forest. Light and dark included.',
    accent: 'bg-pink-50 text-pink-600',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Capture everything',
    desc: 'Add tasks in seconds with the Quick-Add button or floater. Set priority, due date, and project without leaving the flow.',
    color: 'bg-indigo-500',
  },
  {
    step: '02',
    title: 'Organise your way',
    desc: 'Group by project, visualise in Kanban, schedule on calendar, or connect to long-term goals.',
    color: 'bg-violet-500',
  },
  {
    step: '03',
    title: 'Stay accountable',
    desc: 'A daily summary pops up on every dashboard visit. Your streak keeps you consistent day after day.',
    color: 'bg-indigo-600',
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

const WHY_REASONS = [
  {
    icon: Layers,
    title: 'Everything connected',
    desc: 'Tasks link to goals, projects, and routines. No more jumping between four different apps to understand your day.',
    accent: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: MonitorSmartphone,
    title: 'Works on every device',
    desc: 'No app store. No download. Installs as a PWA on iPhone, Android, and desktop in under 10 seconds.',
    accent: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Wind,
    title: 'Quiet by design',
    desc: 'No social feeds, no algorithm, no noise. A focused workspace built for deep work and calm thinking.',
    accent: 'bg-sky-50 text-sky-600',
  },
  {
    icon: ShieldCheck,
    title: 'Your data, your rules',
    desc: 'Export everything at any time. Delete your account with one click. PDPA compliant. Hosted in Singapore.',
    accent: 'bg-emerald-50 text-emerald-600',
  },
];

const COMPARISON = [
  { need: 'Task management',   other: 'Todoist / TickTick' },
  { need: 'Goal tracking',     other: 'Separate app' },
  { need: 'Recurring habits',  other: 'Habit tracker' },
  { need: 'Project boards',    other: 'Trello / Asana' },
  { need: 'Calendar view',     other: 'Calendar app' },
  { need: 'Daily summary',     other: 'Another dashboard' },
];

const TRUST_BADGES = [
  { icon: Lock,       label: 'HTTPS Encrypted' },
  { icon: ShieldCheck, label: 'PDPA Compliant' },
  { icon: MapPin,     label: 'Hosted in Singapore' },
  { icon: Users,      label: 'Google & GitHub Auth' },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Beta banner ──────────────────────────────────────── */}
      <div className="border-b border-indigo-100 bg-indigo-50 py-2.5 text-center text-xs font-medium text-indigo-700">
        <Gift className="inline h-3.5 w-3.5 align-middle mr-1" />
        <span className="font-semibold">Beta offer:</span>{' '}
        Lock in <span className="font-bold text-indigo-900">RM15/mo forever</span> — beta pricing ends at launch.{' '}
        <Link href="/auth/login" className="ml-1 font-semibold underline underline-offset-2 hover:text-indigo-900">
          Claim it →
        </Link>
      </div>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/icon-192x192.png" alt="Optimaz" className="h-8 w-8 rounded-xl shadow-sm" />
            <span className="text-base font-bold tracking-tight text-slate-900">Optimaz</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="#features" className="hidden text-sm text-slate-500 transition-colors hover:text-slate-900 sm:block">
              Features
            </Link>
            <Link href="#compare" className="hidden text-sm text-slate-500 transition-colors hover:text-slate-900 sm:block">
              Compare
            </Link>
            <Link href="#pricing" className="hidden text-sm text-slate-500 transition-colors hover:text-slate-900 sm:block">
              Pricing
            </Link>
            <Link href="/auth/login" className="text-sm text-slate-500 transition-colors hover:text-slate-900">
              Sign in
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600/95 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 ring-1 ring-indigo-400/30 backdrop-blur-sm transition-all hover:bg-indigo-500"
            >
              Get started free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" />
          Now in beta — free Pro month for early users
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Tasks, goals, routines, and projects —{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            organized in one place
          </span>{' '}
          so you can focus on execution.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
          Built for people who want to get things done, not manage software. Trusted by students, freelancers, and founders organizing thousands of tasks during beta.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/auth/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600/95 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 ring-1 ring-indigo-400/30 backdrop-blur-sm transition-all hover:bg-indigo-500 sm:w-auto"
          >
            <Zap className="h-4 w-4" />
            Start free — 1 month Pro included
          </Link>
          <Link
            href="#compare"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 sm:w-auto"
          >
            See how it compares →
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-400">No credit card needed. Beta pricing locks in at RM15/mo — rising to RM29/mo after launch.</p>
      </section>

      {/* ── Connected strip ───────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            Everything is connected
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-center">
            {[
              { icon: ListTodo, label: 'Task', color: 'bg-indigo-100 text-indigo-700' },
              { icon: FolderOpen, label: 'Project', color: 'bg-violet-100 text-violet-700' },
              { icon: Target, label: 'Goal', color: 'bg-sky-100 text-sky-700' },
              { icon: Repeat2, label: 'Routine', color: 'bg-amber-100 text-amber-700' },
            ].map(({ icon: Icon, label, color }, i, arr) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{label}</span>
                </div>
                {i < arr.length - 1 && (
                  <Link2 className="h-4 w-4 shrink-0 text-slate-300 sm:rotate-0 rotate-90" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            Update a task — the linked project, goal, and routine stay in sync automatically.
          </p>
        </div>
      </section>

      {/* ── App preview mockup ────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#0f0f16] shadow-2xl shadow-slate-900/20">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-amber-500/70" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
              <span className="ml-3 text-xs font-medium text-white/30">optimaz.app/dashboard</span>
            </div>
            {/* Fake task list UI */}
            <div className="flex">
              {/* Sidebar strip */}
              <div className="hidden w-48 border-r border-white/5 p-4 sm:block">
                <div className="mb-4 flex items-center gap-2">
                  <img src="/icon-192x192.png" alt="" className="h-6 w-6 rounded-lg" />
                  <span className="text-xs font-bold text-white/80">Optimaz</span>
                </div>
                {['Dashboard', 'Tasks', 'Projects', 'Goals', 'Kanban', 'Calendar', 'Routines'].map((item, i) => (
                  <div
                    key={item}
                    className={`mb-1 rounded-lg px-3 py-1.5 text-xs font-medium ${i === 1 ? 'bg-indigo-600/80 text-white' : 'text-white/40'}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="flex-1 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/80">Today&apos;s Tasks</span>
                  <span className="rounded-full bg-indigo-600/40 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300">6 tasks</span>
                </div>
                {[
                  { title: 'Finish landing page redesign', priority: 'bg-red-500', done: true, project: 'Launch' },
                  { title: 'Review onboarding flow', priority: 'bg-amber-500', done: false, project: 'Product' },
                  { title: 'Write weekly update email', priority: 'bg-indigo-500', done: false, project: 'Marketing' },
                  { title: 'Sync with design team', priority: 'bg-slate-500', done: false, project: 'Team' },
                ].map(({ title, priority, done, project }) => (
                  <div key={title} className="mb-2 flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-2.5">
                    <div className={`h-3 w-3 shrink-0 rounded-full border-2 ${done ? 'border-emerald-400 bg-emerald-500' : 'border-white/20'}`} />
                    <span className={`flex-1 text-xs font-medium ${done ? 'text-white/30 line-through' : 'text-white/80'}`}>{title}</span>
                    <div className={`h-2 w-2 shrink-0 rounded-full ${priority}`} />
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/30">{project}</span>
                  </div>
                ))}
                <div className="mt-4 flex gap-3">
                  <div className="flex-1 rounded-xl border border-white/5 bg-white/5 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Streak</p>
                    <p className="mt-1 text-2xl font-black text-indigo-400">14 🔥</p>
                  </div>
                  <div className="flex-1 rounded-xl border border-white/5 bg-white/5 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Done today</p>
                    <p className="mt-1 text-2xl font-black text-emerald-400">3/6</p>
                  </div>
                  <div className="flex-1 rounded-xl border border-white/5 bg-white/5 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Active goals</p>
                    <p className="mt-1 text-2xl font-black text-sky-400">4</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">Dashboard overview — tasks, streak, and active goals in one view</p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Every tool you need — nothing you don&apos;t
            </h2>
            <p className="mt-3 text-slate-500">Eight purpose-built views. One login. Zero bloat.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc, accent }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
              >
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-slate-900">{title}</h3>
                <p className="text-xs leading-5 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Optimaz ──────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Why Optimaz?
            </h2>
            <p className="mt-3 text-slate-500">Four reasons people make it their default workspace.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_REASONS.map(({ icon: Icon, title, desc, accent }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-slate-300"
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
                <p className="text-xs leading-5 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ───────────────────────────────────────── */}
      <section id="compare" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Replace 5 apps with one
            </h2>
            <p className="mt-3 text-slate-500">
              Most people piece together productivity from multiple tools. Optimaz brings it all together.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Your need</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Separate apps</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-widest text-indigo-600">Optimaz</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(({ need, other }, i) => (
                  <tr key={need} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{need}</td>
                    <td className="px-5 py-3.5 text-slate-400">{other}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        <Check className="mr-1 h-3 w-3" /> Included
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            One account. One interface. One monthly cost — or free forever on the Free plan.
          </p>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Built around how you actually work
            </h2>
            <p className="mt-3 text-slate-500">Three simple phases. Infinite clarity.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map(({ step, title, desc, color }) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color} text-sm font-black text-white`}>
                  {step}
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">{title}</h3>
                <p className="text-sm leading-6 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Push notification highlight ──────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:grid-cols-2 sm:items-center sm:p-12">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <Bell className="h-3.5 w-3.5" />
                Smart Reminders
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Never miss a deadline again
              </h2>
              <p className="mt-3 leading-7 text-slate-500">
                Optimaz sends push notifications to your phone before tasks are due. Set time-aware reminders, get daily digests, and stay on top of overdue items — even when the app is closed.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { icon: Clock, text: 'Task due reminders (15 min, 1 hour, same day)', color: 'text-amber-500' },
                { icon: ClipboardList, text: 'Daily morning digest of your day ahead', color: 'text-indigo-500' },
                { icon: AlertCircle, text: 'Overdue task alerts so nothing slips through', color: 'text-red-500' },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Simple, honest pricing
            </h2>
            <p className="mt-3 text-slate-500">Start free. Upgrade when you&apos;re ready. Cancel any time.</p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">

            {/* Free */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Free</p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-5xl font-black text-slate-900">RM 0</span>
                  <span className="text-slate-400">/mo</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Forever free. No expiry.</p>
              </div>
              <Link
                href="/auth/login"
                className="mb-7 block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                Get started free
              </Link>
              <ul className="space-y-2.5">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
                <li className="flex items-center gap-2.5 text-sm text-slate-400">
                  <X className="h-4 w-4 shrink-0 text-slate-300" />Kanban board
                </li>
                <li className="flex items-center gap-2.5 text-sm text-slate-400">
                  <X className="h-4 w-4 shrink-0 text-slate-300" />Recurring routines
                </li>
                <li className="flex items-center gap-2.5 text-sm text-slate-400">
                  <X className="h-4 w-4 shrink-0 text-slate-300" />Push notifications
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl border-2 border-indigo-500 bg-white p-8 shadow-lg shadow-indigo-100">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-indigo-600 px-5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-200 inline-flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5" /> 1 Month Free for Beta Users
              </div>
              <div className="mb-6 mt-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Pro</p>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">Best Value</span>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-base font-semibold text-slate-400 line-through">RM 29</span>
                  <span className="ml-1 text-5xl font-black text-slate-900">RM 15</span>
                  <span className="text-slate-400">/mo</span>
                </div>
                <p className="mt-1 text-xs font-medium text-indigo-600">Beta pricing — lock it in before launch.{' '}
                  <span className="font-bold text-indigo-700">Price rises to RM 29 after.</span>
                </p>
              </div>
              <Link
                href="/auth/login"
                className="mb-7 block w-full rounded-xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-500"
              >
                Claim free month + lock beta rate
              </Link>
              <ul className="space-y-2.5">
                {PRO_FEATURES.map((f, i) => (
                  <li key={f} className={`flex items-center gap-2.5 text-sm ${i === 0 ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                    <Check className="h-4 w-4 shrink-0 text-indigo-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Beta users who sign up now keep RM15/mo forever. After launch the Pro plan will be RM29/mo.
          </p>
        </div>
      </section>

      {/* ── Founder Story ────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <img src="/icon-192x192.png" alt="Optimaz" className="h-10 w-10 rounded-xl" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Why we built Optimaz
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            We were tired of managing tasks in Todoist, goals in Notion, habits in a separate tracker, and projects in Trello — switching between four different apps just to understand our own work. Optimaz was built to bring everything into one focused workspace where a task can belong to a project, link to a goal, and reset as a routine. One place for your entire work life.
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-900">— The Optimaz team, Mavora Digital · Malaysia</p>
        </div>
      </section>

      {/* ── Trust badges ─────────────────────────────────────── */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 text-center">
                <Icon className="h-5 w-5 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-600 py-20 text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5" />
            Beta pricing locks in today
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Stop managing apps. Start getting things done.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Join beta users who replaced 5 different tools with one focused workspace. First month free, then RM15/mo — locked in before the price rises to RM29.
          </p>
          <Link
            href="/auth/login"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white/15 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 ring-1 ring-white/30 backdrop-blur-md transition-all hover:bg-white/25"
          >
            <Zap className="h-4 w-4" />
            Start free — claim your Pro month
          </Link>
          <p className="mt-3 text-xs text-indigo-200">Takes under 30 seconds. No credit card required.</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-400 sm:flex-row">
            <div className="flex items-center gap-2">
              <img src="/icon-192x192.png" alt="Optimaz" className="h-5 w-5 rounded-md" />
              <span className="font-medium text-slate-600">Optimaz</span>
              <span className="text-slate-300">·</span>
              <span>by Mavora Digital</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#features" className="transition-colors hover:text-slate-700">Features</Link>
              <Link href="#compare" className="transition-colors hover:text-slate-700">Compare</Link>
              <Link href="#pricing" className="transition-colors hover:text-slate-700">Pricing</Link>
              <Link href="/privacy" className="transition-colors hover:text-slate-700">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:text-slate-700">Terms</Link>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-300 sm:text-right">
            © {new Date().getFullYear()} Mavora Digital. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
