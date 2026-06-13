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

const FEATURES = [
  { icon: ListTodo, title: 'Smart Task List', desc: 'Capture, prioritise and complete work. Sort by urgency, drag to reorder, filter by project — all in one view.', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  { icon: Target, title: 'Goals', desc: 'Set long-term outcomes, track progress with linked tasks, and see your completion rate over time.', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  { icon: FolderOpen, title: 'Projects', desc: 'Group tasks into focused projects with support for sub-projects so your structure matches how you think.', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { icon: Repeat2, title: 'Routines', desc: 'Set up daily habits and recurring tasks that rebuild themselves automatically when completed.', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { icon: Kanban, title: 'Kanban Board', desc: 'Drag tasks across To Do → In Progress → Done. Visual workflow that stays in sync with your task list.', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { icon: CalendarDays, title: 'Calendar View', desc: 'See every due date on a clean timeline. Click any day to quickly add tasks.', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { icon: TrendingUp, title: 'Streak & Analytics', desc: 'Build consistency with a daily task streak. Track completions and progress at a glance.', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  { icon: Palette, title: '7 Beautiful Themes', desc: 'Cloud, Sand, Mint, Blossom, Midnight, Obsidian, Forest. Light and dark included.', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
];

const STEPS = [
  { step: '01', title: 'Capture everything', desc: 'Add tasks in seconds with the Quick-Add button or floater. Set priority, due date, and project without leaving the flow.', color: '#7C3AED' },
  { step: '02', title: 'Organise your way', desc: 'Group by project, visualise in Kanban, schedule on calendar, or connect to long-term goals.', color: '#8b5cf6' },
  { step: '03', title: 'Stay accountable', desc: 'A daily summary pops up on every dashboard visit. Your streak keeps you consistent day after day.', color: '#7C3AED' },
];

const FREE_FEATURES = ['Unlimited tasks', 'Calendar view', 'Goals tracking', '3 projects', 'Mobile PWA', 'Daily streak'];
const PRO_FEATURES = ['Everything in Free', 'Unlimited projects', 'Kanban board', 'Recurring routines', 'Push notifications & reminders', 'Full analytics dashboard', '7 premium themes', 'Priority support'];

const WHY_REASONS = [
  { icon: Layers, title: 'Everything connected', desc: 'Tasks link to goals, projects, and routines. No more jumping between four different apps to understand your day.', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  { icon: MonitorSmartphone, title: 'Works on every device', desc: 'No app store. No download. Installs as a PWA on iPhone, Android, and desktop in under 10 seconds.', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { icon: Wind, title: 'Quiet by design', desc: 'No social feeds, no algorithm, no noise. A focused workspace built for deep work and calm thinking.', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  { icon: ShieldCheck, title: 'Your data, your rules', desc: 'Export everything at any time. Delete your account with one click. PDPA compliant. Hosted in Singapore.', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
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
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* ── Beta banner ── */}
      <div
        className="py-2.5 text-center text-xs font-medium"
        style={{
          background: 'rgb(var(--accent) / 0.08)',
          borderBottom: '1px solid rgb(var(--accent) / 0.15)',
          color: 'rgb(var(--accent))',
        }}
      >
        <Gift className="inline h-3.5 w-3.5 align-middle mr-1" />
        <span className="font-semibold">Beta offer:</span>{' '}
        Lock in <span className="font-bold">RM15/mo forever</span> — beta pricing ends at launch.{' '}
        <Link href="/auth/login" className="ml-1 font-semibold underline underline-offset-2 hover:opacity-70">
          Claim it →
        </Link>
      </div>

      {/* ── Nav ── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'var(--sidebar-bg)',
          borderBottom: '1px solid var(--sidebar-border)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.7))',
                boxShadow: '0 2px 8px var(--glow)',
              }}
            >
              <img src="/icon-192x192.png" alt="Optimaz" className="h-6 w-6 rounded-lg" />
            </div>
            <span className="text-base font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Optimaz</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="#features" className="hidden text-sm transition-colors hover:opacity-70 sm:block" style={{ color: 'var(--muted-fg)' }}>
              Features
            </Link>
            <Link href="#compare" className="hidden text-sm transition-colors hover:opacity-70 sm:block" style={{ color: 'var(--muted-fg)' }}>
              Compare
            </Link>
            <Link href="#pricing" className="hidden text-sm transition-colors hover:opacity-70 sm:block" style={{ color: 'var(--muted-fg)' }}>
              Pricing
            </Link>
            <Link href="/auth/login" className="text-sm transition-colors hover:opacity-70" style={{ color: 'var(--muted-fg)' }}>
              Sign in
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.85))',
                boxShadow: '0 2px 10px var(--glow)',
              }}
            >
              Get started free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Subtle radial glow behind hero */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 65% 50%, rgb(var(--accent) / 0.07) 0%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-0 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">

          {/* ── Left column ── */}
          <div className="flex flex-col items-start">
            {/* Badge */}
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{
                background: 'rgb(var(--accent) / 0.1)',
                border: '1px solid rgb(var(--accent) / 0.2)',
                color: 'rgb(var(--accent))',
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Now in beta — free Pro month for early users
            </div>

            {/* Billboard heading */}
            <h1
              className="text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl"
              style={{ color: 'var(--foreground)' }}
            >
              RECLAIM YOUR<br />
              FOCUS. OPTIMIZE<br />
              YOUR DAY.
            </h1>

            {/* Sub-headline */}
            <p className="mt-7 max-w-md text-base leading-7 sm:text-lg" style={{ color: 'var(--muted-fg)' }}>
              The single source of truth for your tasks, goals, and project progress. Beautifully organized.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.8))',
                  boxShadow: '0 6px 28px var(--glow)',
                  letterSpacing: '0.05em',
                }}
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>
                No credit card required. Free 14-day trial.
              </p>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-3">
              {/* Avatar cluster */}
              <div className="flex -space-x-2">
                {['#7C3AED','#ec4899','#0ea5e9','#10b981'].map((color, i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white"
                    style={{ background: color, borderColor: 'var(--background)' }}
                  >
                    {['A','B','C','D'][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs font-medium" style={{ color: 'var(--muted-fg)' }}>
                Used by <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>10,000+</span> high-performers
              </p>
            </div>
          </div>

          {/* ── Right column — device mockup ── */}
          <div className="relative mt-12 flex items-center justify-center lg:mt-0 lg:justify-end">
            <div
              className="relative w-full max-w-xl overflow-hidden rounded-3xl"
              style={{
                boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 8px 32px rgba(0,0,0,0.1)',
                transform: 'perspective(1200px) rotateY(-4deg) rotateX(2deg)',
              }}
            >
              <img
                src="/hero-background.png"
                alt="Optimaz app preview"
                className="w-full"
                style={{ display: 'block' }}
              />
            </div>
            {/* Glow behind image */}
            <div
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background: 'radial-gradient(ellipse 80% 60% at 60% 50%, rgb(var(--accent) / 0.15) 0%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />
          </div>

        </div>
      </section>

      {/* ── Connected strip ── */}
      <section
        className="py-10"
        style={{
          borderTop: '1px solid var(--card-border)',
          borderBottom: '1px solid var(--card-border)',
          background: 'var(--muted-bg)',
        }}
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)' }}>
            Everything is connected
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-center">
            {[
              { icon: ListTodo, label: 'Task', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
              { icon: FolderOpen, label: 'Project', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
              { icon: Target, label: 'Goal', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
              { icon: Repeat2, label: 'Routine', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            ].map(({ icon: Icon, label, color, bg }, i, arr) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: bg, border: '1px solid var(--card-border)' }}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{label}</span>
                </div>
                {i < arr.length - 1 && (
                  <Link2 className="h-4 w-4 shrink-0 sm:rotate-0 rotate-90" style={{ color: 'var(--card-border)' }} />
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted-fg)' }}>
            Update a task — the linked project, goal, and routine stay in sync automatically.
          </p>
        </div>
      </section>

      {/* ── App preview mockup ── */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0f0f16] shadow-2xl shadow-black/20">
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
                    className={`mb-1 rounded-lg px-3 py-1.5 text-xs font-medium ${i === 1 ? 'text-white' : 'text-white/40'}`}
                    style={i === 1 ? { background: 'rgb(var(--accent) / 0.6)' } : {}}
                  >
                    {item}
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="flex-1 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/80">Today&apos;s Tasks</span>
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-purple-300" style={{ background: 'rgb(var(--accent) / 0.3)' }}>6 tasks</span>
                </div>
                {[
                  { title: 'Finish landing page redesign', priority: 'bg-red-500', done: true, project: 'Launch' },
                  { title: 'Review onboarding flow', priority: 'bg-amber-500', done: false, project: 'Product' },
                  { title: 'Write weekly update email', priority: 'bg-purple-500', done: false, project: 'Marketing' },
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
                    <p className="mt-1 text-2xl font-black text-purple-400">14 🔥</p>
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
          <p className="mt-3 text-center text-xs" style={{ color: 'var(--muted-fg)' }}>
            Dashboard overview — tasks, streak, and active goals in one view
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        className="py-20"
        style={{ background: 'var(--muted-bg)', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--foreground)' }}>
              Every tool you need — nothing you don&apos;t
            </h2>
            <p className="mt-3" style={{ color: 'var(--muted-fg)' }}>Eight purpose-built views. One login. Zero bloat.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="rounded-2xl p-5 transition-all hover:shadow-lg"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: bg }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h3>
                <p className="text-xs leading-5" style={{ color: 'var(--muted-fg)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Optimaz ── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--foreground)' }}>
              Why Optimaz?
            </h2>
            <p className="mt-3" style={{ color: 'var(--muted-fg)' }}>Four reasons people make it their default workspace.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_REASONS.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="rounded-2xl p-6 transition-all hover:shadow-lg"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ background: bg }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h3>
                <p className="text-xs leading-5" style={{ color: 'var(--muted-fg)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section
        id="compare"
        className="py-20"
        style={{ background: 'var(--muted-bg)', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--foreground)' }}>
              Replace 5 apps with one
            </h2>
            <p className="mt-3" style={{ color: 'var(--muted-fg)' }}>
              Most people piece together productivity from multiple tools. Optimaz brings it all together.
            </p>
          </div>

          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)' }}>Your need</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)' }}>Separate apps</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--accent))' }}>Optimaz</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(({ need, other }, i) => (
                  <tr key={need} style={{ borderBottom: '1px solid var(--card-border)', background: i % 2 === 1 ? 'var(--muted-bg)' : 'transparent' }}>
                    <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--foreground)' }}>{need}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--muted-fg)' }}>{other}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          background: 'rgba(16,185,129,0.12)',
                          color: '#10b981',
                        }}
                      >
                        <Check className="mr-1 h-3 w-3" /> Included
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs" style={{ color: 'var(--muted-fg)' }}>
            One account. One interface. One monthly cost — or free forever on the Free plan.
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--foreground)' }}>
              Built around how you actually work
            </h2>
            <p className="mt-3" style={{ color: 'var(--muted-fg)' }}>Three simple phases. Infinite clarity.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map(({ step, title, desc, color }) => (
              <div
                key={step}
                className="rounded-2xl p-7"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                    boxShadow: `0 2px 10px ${color}40`,
                  }}
                >
                  {step}
                </div>
                <h3 className="mb-2 text-base font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h3>
                <p className="text-sm leading-6" style={{ color: 'var(--muted-fg)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Push notification highlight ── */}
      <section
        className="py-20"
        style={{ background: 'var(--muted-bg)', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            className="grid gap-8 rounded-2xl p-8 sm:grid-cols-2 sm:items-center sm:p-12"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div>
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  color: '#d97706',
                }}
              >
                <Bell className="h-3.5 w-3.5" />
                Smart Reminders
              </div>
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
                Never miss a deadline again
              </h2>
              <p className="mt-3 leading-7" style={{ color: 'var(--muted-fg)' }}>
                Optimaz sends push notifications to your phone before tasks are due. Set time-aware reminders, get daily digests, and stay on top of overdue items — even when the app is closed.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { icon: Clock, text: 'Task due reminders (15 min, 1 hour, same day)', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                { icon: ClipboardList, text: 'Daily morning digest of your day ahead', color: 'rgb(var(--accent))', bg: 'rgb(var(--accent) / 0.1)' },
                { icon: AlertCircle, text: 'Overdue task alerts so nothing slips through', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
              ].map(({ icon: Icon, text, color, bg }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: bg,
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground)',
                  }}
                >
                  <Icon className="h-5 w-5 shrink-0" style={{ color }} />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--foreground)' }}>
              Simple, honest pricing
            </h2>
            <p className="mt-3" style={{ color: 'var(--muted-fg)' }}>Start free. Upgrade when you&apos;re ready. Cancel any time.</p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">

            {/* Free */}
            <div
              className="rounded-2xl p-8"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)' }}>Free</p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-5xl font-black" style={{ color: 'var(--foreground)' }}>RM 0</span>
                  <span style={{ color: 'var(--muted-fg)' }}>/mo</span>
                </div>
                <p className="mt-2 text-sm" style={{ color: 'var(--muted-fg)' }}>Forever free. No expiry.</p>
              </div>
              <Link
                href="/auth/login"
                className="mb-7 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  background: 'var(--muted-bg)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--foreground)',
                }}
              >
                Get started free
              </Link>
              <ul className="space-y-2.5">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--foreground)' }}>
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
                {['Kanban board', 'Recurring routines', 'Push notifications'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--muted-fg)' }}>
                    <X className="h-4 w-4 shrink-0" style={{ opacity: 0.4 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div
              className="relative rounded-2xl p-8"
              style={{
                background: 'var(--card-bg)',
                border: '2px solid rgb(var(--accent) / 0.5)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 24px var(--glow)',
              }}
            >
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-5 py-1.5 text-xs font-bold text-white inline-flex items-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.85))',
                  boxShadow: '0 2px 8px var(--glow)',
                }}
              >
                <Gift className="h-3.5 w-3.5" /> 1 Month Free for Beta Users
              </div>
              <div className="mb-6 mt-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--accent))' }}>Pro</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      background: 'rgb(var(--accent) / 0.12)',
                      color: 'rgb(var(--accent))',
                    }}
                  >
                    Best Value
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-base font-semibold line-through" style={{ color: 'var(--muted-fg)' }}>RM 29</span>
                  <span className="ml-1 text-5xl font-black" style={{ color: 'var(--foreground)' }}>RM 15</span>
                  <span style={{ color: 'var(--muted-fg)' }}>/mo</span>
                </div>
                <p className="mt-1 text-xs font-medium" style={{ color: 'rgb(var(--accent))' }}>
                  Beta pricing — lock it in before launch.{' '}
                  <span className="font-bold">Price rises to RM 29 after.</span>
                </p>
              </div>
              <Link
                href="/auth/login"
                className="mb-7 block w-full rounded-xl py-3 text-center text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.85))',
                  boxShadow: '0 4px 16px var(--glow)',
                }}
              >
                Claim free month + lock beta rate
              </Link>
              <ul className="space-y-2.5">
                {PRO_FEATURES.map((f, i) => (
                  <li
                    key={f}
                    className={`flex items-center gap-2.5 text-sm ${i === 0 ? 'font-semibold' : ''}`}
                    style={{ color: 'var(--foreground)' }}
                  >
                    <Check className="h-4 w-4 shrink-0" style={{ color: 'rgb(var(--accent))' }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-center text-xs" style={{ color: 'var(--muted-fg)' }}>
            Beta users who sign up now keep RM15/mo forever. After launch the Pro plan will be RM29/mo.
          </p>
        </div>
      </section>

      {/* ── Founder Story ── */}
      <section
        className="py-20"
        style={{ background: 'var(--muted-bg)', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}
      >
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div
            className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.7))',
              boxShadow: '0 4px 16px var(--glow)',
            }}
          >
            <img src="/icon-192x192.png" alt="Optimaz" className="h-10 w-10 rounded-xl" />
          </div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl" style={{ color: 'var(--foreground)' }}>
            Why we built Optimaz
          </h2>
          <p className="mt-4 text-sm leading-7 sm:text-base" style={{ color: 'var(--muted-fg)' }}>
            We were tired of managing tasks in Todoist, goals in Notion, habits in a separate tracker, and projects in Trello — switching between four different apps just to understand our own work. Optimaz was built to bring everything into one focused workspace where a task can belong to a project, link to a goal, and reset as a routine. One place for your entire work life.
          </p>
          <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            — The Optimaz team, Mavora Digital · Malaysia
          </p>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-center"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Icon className="h-5 w-5" style={{ color: 'rgb(var(--accent))' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        className="py-20 text-center"
        style={{
          background: `linear-gradient(135deg, rgb(var(--accent) / 0.9) 0%, rgb(var(--accent) / 0.65) 100%)`,
          boxShadow: '0 -4px 40px var(--glow)',
        }}
      >
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5" />
            Beta pricing locks in today
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Stop managing apps. Start getting things done.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Join beta users who replaced 5 different tools with one focused workspace. First month free, then RM15/mo — locked in before the price rises to RM29.
          </p>
          <Link
            href="/auth/login"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white/15 px-7 py-3 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur-md transition-all hover:bg-white/25"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
          >
            <Zap className="h-4 w-4" />
            Start free — claim your Pro month
          </Link>
          <p className="mt-3 text-xs text-white/60">Takes under 30 seconds. No credit card required.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--card-border)', background: 'var(--background)' }}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs sm:flex-row" style={{ color: 'var(--muted-fg)' }}>
            <div className="flex items-center gap-2">
              <img src="/icon-192x192.png" alt="Optimaz" className="h-5 w-5 rounded-md" />
              <span className="font-medium" style={{ color: 'var(--foreground)' }}>Optimaz</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>by Mavora Digital</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#features" className="transition-colors hover:opacity-70">Features</Link>
              <Link href="#compare" className="transition-colors hover:opacity-70">Compare</Link>
              <Link href="#pricing" className="transition-colors hover:opacity-70">Pricing</Link>
              <Link href="/privacy" className="transition-colors hover:opacity-70">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:opacity-70">Terms</Link>
            </div>
          </div>
          <p className="mt-4 text-center text-xs sm:text-right" style={{ color: 'var(--muted-fg)', opacity: 0.5 }}>
            © {new Date().getFullYear()} Mavora Digital. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
