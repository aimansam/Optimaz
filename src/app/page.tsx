import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HeroDashboardMockup } from '@/components/landing/HeroDashboardMockup';
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
  Smartphone,
} from 'lucide-react';

// ── Static design tokens (landing page never changes with user theme)
const C = {
  bg:          '#ffffff',
  bgAlt:       '#f7f6fb',
  fg:          '#0f0b1a',
  muted:       '#6b7280',
  accent:      '#7C3AED',
  accentLight: 'rgba(124,58,237,0.1)',
  accentBorder:'rgba(124,58,237,0.2)',
  accentGlow:  'rgba(124,58,237,0.28)',
  cardBg:      '#ffffff',
  cardBorder:  '#e5e7eb',
};

// Reusable gradient-text style (Apple-style heading treatment)
const GT = {
  background: 'linear-gradient(135deg, #5b21b6 0%, #7C3AED 45%, #a78bfa 80%, #6d28d9 100%)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  backgroundClip: 'text' as const,
};

const FEATURES = [
  { icon: ListTodo,    title: 'Smart Task List',    desc: 'Capture, prioritize, organize, and complete work without clutter. Quickly sort by urgency, project, or due date.',                            color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
  { icon: Target,      title: 'Goals',              desc: 'Turn long-term ambitions into measurable progress. Connect goals directly to the tasks that move them forward.',                              color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
  { icon: FolderOpen,  title: 'Projects',           desc: 'Organize work into focused projects and sub-projects so everything has a place.',                                                             color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  { icon: Repeat2,     title: 'Routines',           desc: 'Build habits that stick with recurring tasks that automatically reset when completed.',                                                        color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { icon: Kanban,      title: 'Kanban Board',       desc: 'Visualize work from To Do to Done with a simple drag-and-drop workflow.',                                                                     color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  { icon: CalendarDays,title: 'Calendar View',      desc: 'See upcoming deadlines at a glance and plan your week with confidence.',                                                                      color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  { icon: TrendingUp,  title: 'Streaks & Analytics',desc: 'Track consistency, celebrate progress, and understand how you work over time.',                                                               color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  { icon: Palette,     title: 'Beautiful Themes',   desc: 'Choose from seven carefully designed themes built for focus, day or night.',                                                                  color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
];

const STEPS = [
  { step: '01', title: 'Capture Everything',  desc: 'Add tasks in seconds. Set priorities, due dates, projects, and reminders without breaking your flow.',               color: '#7C3AED' },
  { step: '02', title: 'Organize Your Way',   desc: 'Manage work however you prefer — list, Kanban, calendar, goals, or projects.',                                       color: '#8b5cf6' },
  { step: '03', title: 'Stay Accountable',    desc: 'Daily summaries, streaks, and progress tracking help you stay consistent every day.',                                 color: '#7C3AED' },
];

const FREE_FEATURES = ['Unlimited tasks', 'Calendar view', 'Goals tracking', '3 projects', 'Mobile PWA', 'Daily streak'];
const PRO_FEATURES  = ['Everything in Free', 'Unlimited projects', 'Kanban board', 'Recurring routines', 'Push notifications & reminders', 'Full analytics dashboard', '7 premium themes', 'Priority support'];

const WHY_REASONS = [
  { icon: Layers,           title: 'Everything connected',  desc: 'See the full picture. Tasks, goals, projects, and routines work together instead of living in separate apps.',    color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
  { icon: Smartphone,       title: 'Works on every device', desc: 'Install in seconds on desktop, Android, iPhone, and tablet. No app store required.',                              color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  { icon: Wind,             title: 'Built for focus',       desc: 'No social feeds. No distractions. Just a clean workspace designed for meaningful work.',                          color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
  { icon: ShieldCheck,      title: 'Your data stays yours', desc: 'Export your data anytime. Delete your account anytime. Full control from day one.',                               color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
];

const COMPARISON = [
  { need: 'Tasks',          other: 'Todoist / TickTick' },
  { need: 'Goals',          other: 'Notion / Goal Tracker' },
  { need: 'Habits',         other: 'Habit Tracker' },
  { need: 'Projects',       other: 'Trello / Asana' },
  { need: 'Calendar',       other: 'Calendar App' },
  { need: 'Daily Planning', other: 'Another Dashboard' },
];

const TRUST_BADGES = [
  { icon: Lock,        label: 'HTTPS Encrypted' },
  { icon: ShieldCheck, label: 'PDPA Compliant' },
  { icon: MapPin,      label: 'Hosted in Singapore' },
  { icon: Users,       label: 'Google & GitHub Auth' },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.fg }}>

      {/* ── Beta banner ── */}
      <div
        className="py-2.5 text-center text-xs font-medium"
        style={{ background: C.accentLight, borderBottom: `1px solid ${C.accentBorder}`, color: C.accent }}
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
        style={{ background: 'rgba(255,255,255,0.92)', borderBottom: `1px solid ${C.cardBorder}`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `linear-gradient(135deg, ${C.accent}, rgba(124,58,237,0.7))`, boxShadow: `0 2px 8px ${C.accentGlow}` }}
            >
              <img src="/icon-192x192.png" alt="Optimaz" className="h-6 w-6 rounded-lg" />
            </div>
            <span className="text-base font-bold tracking-tight" style={{ color: C.fg }}>Optimaz</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="#features" className="hidden text-sm transition-opacity hover:opacity-60 sm:block" style={{ color: C.muted }}>Features</Link>
            <Link href="#compare"  className="hidden text-sm transition-opacity hover:opacity-60 sm:block" style={{ color: C.muted }}>Compare</Link>
            <Link href="#pricing"  className="hidden text-sm transition-opacity hover:opacity-60 sm:block" style={{ color: C.muted }}>Pricing</Link>
            <Link href="/auth/login" className="text-sm transition-opacity hover:opacity-60" style={{ color: C.muted }}>Sign in</Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${C.accent}, rgba(124,58,237,0.85))`, boxShadow: `0 2px 10px ${C.accentGlow}` }}
            >
              Get started free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero — pure-code dashboard background ── */}
      <section
        className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{ backgroundColor: C.bgAlt }}
      >
        <HeroDashboardMockup />
        <div className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-8">
          {/* Glass card container — Apple-style frosted panel */}
          <div
            className="max-w-xl rounded-3xl p-8 sm:p-10"
            style={{
              background: 'rgba(255,255,255,0.60)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.72)',
              boxShadow: '0 8px 40px rgba(124,58,237,0.10), 0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            {/* Social proof line */}
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.muted }}>
              Used by students, freelancers, founders &amp; high-performers
            </p>

            {/* Badge */}
            <div
              className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{ background: C.accentLight, border: `1px solid ${C.accentBorder}`, color: C.accent }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Now in beta — free Pro month for early users
            </div>

            {/* Headline — gradient text */}
            <h1
              className="font-black uppercase leading-[0.9] tracking-tight"
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 4rem)',
                background: 'linear-gradient(135deg, #5b21b6 0%, #7C3AED 40%, #a78bfa 80%, #6d28d9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              RECLAIM YOUR<br />
              FOCUS. OPTIMIZE<br />
              YOUR DAY.
            </h1>

            {/* Sub-headline */}
            <p className="mt-7 max-w-md text-base leading-7 sm:text-lg" style={{ color: C.muted }}>
              The single source of truth for your tasks, goals, and project progress. Beautifully organized.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, #5b21b6, ${C.accent})`,
                  boxShadow: `0 6px 28px ${C.accentGlow}`,
                  letterSpacing: '0.06em',
                }}
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-xs" style={{ color: C.muted }}>No credit card required. Free 14-day trial.</p>
            </div>

            {/* Avatar social proof */}
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                {(['#7C3AED','#ec4899','#0ea5e9','#10b981'] as const).map((color, i) => (
                  <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white"
                    style={{ background: color, borderColor: 'rgba(255,255,255,0.8)' }}>
                    {['A','B','C','D'][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs font-medium" style={{ color: C.muted }}>
                Used by <span style={{ color: C.fg, fontWeight: 700 }}>10,000+</span> high-performers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Connected strip ── */}
      <section className="py-16" style={{ borderTop: `1px solid ${C.cardBorder}`, borderBottom: `1px solid ${C.cardBorder}`, background: C.bgAlt }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={GT}>Everything stays connected.</h2>
          <p className="mt-4 max-w-xl mx-auto text-sm leading-7" style={{ color: C.muted }}>
            Most productivity tools live in separate silos. In Optimaz, a task can belong to a project, contribute to a goal, and repeat as a routine — all at the same time. Update it once. Everything stays connected.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-center">
            {[
              { icon: ListTodo,   label: 'Task',    color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
              { icon: FolderOpen, label: 'Project', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
              { icon: Target,     label: 'Goal',    color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
              { icon: Repeat2,    label: 'Routine', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
            ].map(({ icon: Icon, label, color, bg }, i, arr) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: bg, border: `1px solid ${C.cardBorder}` }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: C.fg }}>{label}</span>
                </div>
                {i < arr.length - 1 && <Link2 className="h-4 w-4 shrink-0 sm:rotate-0 rotate-90" style={{ color: C.cardBorder }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20" style={{ background: C.bgAlt, borderBottom: `1px solid ${C.cardBorder}` }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: C.accent }}>Everything you need to stay organized</p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={GT}>Tasks. Goals. Projects. Habits. Calendar.</h2>
            <p className="mt-3 max-w-xl mx-auto" style={{ color: C.muted }}>
              One workspace built to help you focus on execution instead of managing software.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="rounded-2xl p-5 transition-all hover:shadow-lg" style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: bg }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide" style={{ color: C.fg }}>{title}</h3>
                <p className="text-xs leading-5" style={{ color: C.muted }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Optimaz ── */}
      <section className="py-20" style={{ background: C.bg }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={GT}>Why Optimaz?</h2>
            <p className="mt-3" style={{ color: C.muted }}>Four reasons people make it their default workspace.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_REASONS.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="rounded-2xl p-6 transition-all hover:shadow-lg" style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: bg }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="mb-2 text-sm font-semibold" style={{ color: C.fg }}>{title}</h3>
                <p className="text-xs leading-5" style={{ color: C.muted }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section id="compare" className="py-20" style={{ background: C.bgAlt, borderTop: `1px solid ${C.cardBorder}`, borderBottom: `1px solid ${C.cardBorder}` }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={GT}>Replace 5 Apps With One</h2>
            <p className="mt-3 max-w-lg mx-auto" style={{ color: C.muted }}>
              Stop paying for five productivity apps. Most people manage tasks, goals, habits, projects, and planning across multiple tools. Optimaz combines everything into one focused workspace.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl" style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: C.muted }}>Your Need</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: C.muted }}>Separate Apps</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-widest" style={{ color: C.accent }}>Optimaz</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(({ need, other }, i) => (
                  <tr key={need} style={{ borderBottom: `1px solid ${C.cardBorder}`, background: i % 2 === 1 ? C.bgAlt : 'transparent' }}>
                    <td className="px-5 py-3.5 font-medium" style={{ color: C.fg }}>{need}</td>
                    <td className="px-5 py-3.5" style={{ color: C.muted }}>{other}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                        <Check className="mr-1 h-3 w-3" /> Included
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs" style={{ color: C.muted }}>One workspace. One login. One monthly subscription.</p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20" style={{ background: C.bg }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={GT}>Built Around How You Actually Work</h2>
            <p className="mt-3" style={{ color: C.muted }}>Three simple phases. Infinite clarity.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map(({ step, title, desc, color }) => (
              <div key={step} className="rounded-2xl p-7" style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 2px 10px ${color}40` }}>
                  {step}
                </div>
                <h3 className="mb-2 text-base font-semibold" style={{ color: C.fg }}>{title}</h3>
                <p className="text-sm leading-6" style={{ color: C.muted }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Push notification highlight ── */}
      <section className="py-20" style={{ background: C.bgAlt, borderTop: `1px solid ${C.cardBorder}`, borderBottom: `1px solid ${C.cardBorder}` }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 rounded-2xl p-8 sm:grid-cols-2 sm:items-center sm:p-12"
            style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}>
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#d97706' }}>
                <Bell className="h-3.5 w-3.5" />
                Smart Reminders
              </div>
              <h2 className="text-2xl font-bold tracking-tight" style={GT}>Never miss a deadline again.</h2>
              <p className="mt-3 leading-7" style={{ color: C.muted }}>
                Optimaz keeps important work visible before it becomes urgent. Stay on top of your work even when the app is closed.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { icon: Clock,         text: 'Due task reminders',                   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                { icon: ClipboardList, text: 'Daily morning summary',                color: C.accent,  bg: C.accentLight },
                { icon: AlertCircle,   text: 'Overdue task alerts',                  color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
                { icon: Bell,          text: 'Push notifications on all devices',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
              ].map(({ icon: Icon, text, color, bg }) => (
                <div key={text} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                  style={{ background: bg, border: `1px solid ${C.cardBorder}`, color: C.fg }}>
                  <Icon className="h-5 w-5 shrink-0" style={{ color }} />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20" style={{ background: C.bg }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={GT}>Simple, honest pricing</h2>
            <p className="mt-3" style={{ color: C.muted }}>Start free. Upgrade when you&apos;re ready. Cancel any time.</p>
          </div>
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">

            {/* Free */}
            <div className="rounded-2xl p-8" style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: C.muted }}>Free</p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-5xl font-black" style={{ color: C.fg }}>RM 0</span>
                  <span style={{ color: C.muted }}>/mo</span>
                </div>
                <p className="mt-2 text-sm" style={{ color: C.muted }}>Forever free. No expiry.</p>
              </div>
              <Link href="/auth/login"
                className="mb-7 block w-full rounded-full py-3 text-center text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: C.bgAlt, border: `1px solid ${C.cardBorder}`, color: C.fg }}>
                Get started free
              </Link>
              <ul className="space-y-2.5">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: C.fg }}>
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />{f}
                  </li>
                ))}
                {['Kanban board', 'Recurring routines', 'Push notifications'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: C.muted }}>
                    <X className="h-4 w-4 shrink-0" style={{ opacity: 0.4 }} />{f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl p-8"
              style={{ background: C.cardBg, border: `2px solid ${C.accentBorder}`, boxShadow: `0 4px 24px ${C.accentGlow}` }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-5 py-1.5 text-xs font-bold text-white inline-flex items-center gap-1.5"
                style={{ background: `linear-gradient(135deg, ${C.accent}, rgba(124,58,237,0.85))`, boxShadow: `0 2px 8px ${C.accentGlow}` }}>
                <Gift className="h-3.5 w-3.5" /> 1 Month Free for Beta Users
              </div>
              <div className="mb-6 mt-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: C.accent }}>Pro</p>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: C.accentLight, color: C.accent }}>Best Value</span>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-base font-semibold line-through" style={{ color: C.muted }}>RM 29</span>
                  <span className="ml-1 text-5xl font-black" style={{ color: C.fg }}>RM 15</span>
                  <span style={{ color: C.muted }}>/mo</span>
                </div>
                <p className="mt-1 text-xs font-medium" style={{ color: C.accent }}>
                  Beta pricing — lock it in before launch.{' '}
                  <span className="font-bold">Price rises to RM 29 after.</span>
                </p>
              </div>
              <Link href="/auth/login"
                className="mb-7 block w-full rounded-full py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${C.accent}, rgba(124,58,237,0.85))`, boxShadow: `0 4px 16px ${C.accentGlow}` }}>
                Claim free month + lock beta rate
              </Link>
              <ul className="space-y-2.5">
                {PRO_FEATURES.map((f, i) => (
                  <li key={f} className={`flex items-center gap-2.5 text-sm ${i === 0 ? 'font-semibold' : ''}`} style={{ color: C.fg }}>
                    <Check className="h-4 w-4 shrink-0" style={{ color: C.accent }} />{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-6 text-center text-xs" style={{ color: C.muted }}>
            Beta users who sign up now keep RM15/mo forever. After launch the Pro plan will be RM29/mo.
          </p>
        </div>
      </section>

      {/* ── Founder Story ── */}
      <section className="py-20" style={{ background: C.bgAlt, borderTop: `1px solid ${C.cardBorder}`, borderBottom: `1px solid ${C.cardBorder}` }}>
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: `linear-gradient(135deg, ${C.accent}, rgba(124,58,237,0.7))`, boxShadow: `0 4px 16px ${C.accentGlow}` }}>
            <img src="/icon-192x192.png" alt="Optimaz" className="h-10 w-10 rounded-xl" />
          </div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl" style={GT}>Why We Built Optimaz</h2>
          <p className="mt-4 text-sm leading-7 sm:text-base" style={{ color: C.muted }}>
            We were tired of switching between Todoist for tasks, Notion for goals, Trello for projects, and separate habit trackers just to understand what needed attention.
          </p>
          <p className="mt-3 text-sm leading-7 sm:text-base" style={{ color: C.muted }}>
            The more tools we added, the harder it became to stay organized. So we built Optimaz — a single workspace where tasks, goals, projects, routines, and planning finally work together.
          </p>
          <p className="mt-4 text-sm font-semibold" style={{ color: C.fg }}>Less app switching. More meaningful progress.</p>
          <p className="mt-2 text-sm" style={{ color: C.muted }}>— Mavora Digital, Malaysia</p>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="py-12" style={{ background: C.bg }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-center"
                style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}>
                <Icon className="h-5 w-5" style={{ color: C.accent }} />
                <span className="text-xs font-semibold" style={{ color: C.fg }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 text-center"
        style={{ background: `linear-gradient(135deg, ${C.accent} 0%, rgba(124,58,237,0.75) 100%)`, boxShadow: `0 -4px 40px ${C.accentGlow}` }}>
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5" />
            Beta pricing locks in today
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Stop managing apps. Start getting things done.</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Join beta users who replaced 5 different tools with one focused workspace. First month free, then RM15/mo — locked in before the price rises to RM29.
          </p>
          <Link href="/auth/login"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/15 px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white ring-1 ring-white/30 backdrop-blur-md transition-all hover:bg-white/25"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)', letterSpacing: '0.06em' }}>
            <Zap className="h-4 w-4" />
            Start free — claim your Pro month
          </Link>
          <p className="mt-3 text-xs text-white/60">Takes under 30 seconds. No credit card required.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${C.cardBorder}`, background: C.bg }}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs sm:flex-row" style={{ color: C.muted }}>
            <div className="flex items-center gap-2">
              <img src="/icon-192x192.png" alt="Optimaz" className="h-5 w-5 rounded-md" />
              <span className="font-medium" style={{ color: C.fg }}>Optimaz</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>by Mavora Digital</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#features" className="transition-opacity hover:opacity-60">Features</Link>
              <Link href="#compare"  className="transition-opacity hover:opacity-60">Compare</Link>
              <Link href="#pricing"  className="transition-opacity hover:opacity-60">Pricing</Link>
              <Link href="/privacy"  className="transition-opacity hover:opacity-60">Privacy</Link>
              <Link href="/terms"    className="transition-opacity hover:opacity-60">Terms</Link>
            </div>
          </div>
          <p className="mt-4 text-center text-xs sm:text-right" style={{ color: C.muted, opacity: 0.5 }}>
            © {new Date().getFullYear()} Mavora Digital. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
