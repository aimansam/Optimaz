import Link from 'next/link';
import {
  Check,
  X,
  Sparkles,
  Zap,
  ArrowLeft,
  Bell,
  Palette,
  BarChart3,
  Kanban,
  Repeat2,
  Gift,
} from 'lucide-react';

const FREE_FEATURES = [
  { text: 'Unlimited tasks', included: true },
  { text: 'Goals tracking', included: true },
  { text: 'Calendar view', included: true },
  { text: '3 projects', included: true },
  { text: 'Mobile PWA (installable)', included: true },
  { text: 'Daily task streak', included: true },
  { text: 'Kanban board', included: false },
  { text: 'Recurring routines', included: false },
  { text: 'Push notifications & reminders', included: false },
  { text: 'Analytics dashboard', included: false },
  { text: '7 premium themes', included: false },
  { text: 'Priority support', included: false },
];

const PRO_FEATURES = [
  { text: 'Everything in Free', bold: true },
  { text: 'Unlimited projects' },
  { text: 'Kanban board' },
  { text: 'Recurring routines & habits' },
  { text: 'Push notifications & smart reminders' },
  { text: 'Full analytics & productivity charts' },
  { text: '7 premium themes (light + dark)' },
  { text: 'Priority support' },
];

const FAQ = [
  {
    q: 'Is there really a free month of Pro?',
    a: 'Yes. Every user who signs up during the beta period gets 30 days of Pro access with no credit card required. After 30 days, your account continues on the Free plan unless you choose to upgrade.',
  },
  {
    q: 'When will paid plans start?',
    a: "We'll notify all beta users at least 30 days before any billing begins. You'll always have the option to stay on the Free plan.",
  },
  {
    q: 'Can I cancel at any time?',
    a: 'Absolutely. No lock-in, no cancellation fees. Cancel from Settings in one click.',
  },
  {
    q: 'What payment methods will you accept?',
    a: 'We plan to support credit/debit cards (Visa, Mastercard) and popular e-wallets. More options based on user feedback.',
  },
  {
    q: 'Is my data safe?',
    a: 'All data is stored securely with Supabase (PostgreSQL) on AWS infrastructure. Row-level security ensures only you can access your data.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* Nav */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'var(--sidebar-bg)',
          borderBottom: '1px solid var(--sidebar-border)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm transition-colors hover:opacity-70"
            style={{ color: 'var(--muted-fg)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
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
            <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Optimaz</span>
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: 'var(--muted-fg)' }}
          >
            Sign in →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">

        {/* Header */}
        <div className="mb-10 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
            style={{
              background: 'rgb(var(--accent) / 0.1)',
              border: '1px solid rgb(var(--accent) / 0.2)',
              color: 'rgb(var(--accent))',
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Beta offer active
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl" style={{ color: 'var(--foreground)' }}>
            Simple, honest pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl leading-7" style={{ color: 'var(--muted-fg)' }}>
            Start completely free. Upgrade when Optimaz becomes indispensable. Cancel any time with zero friction.
          </p>
        </div>

        {/* Beta banner */}
        <div
          className="mb-10 rounded-2xl px-6 py-4 text-center"
          style={{
            background: 'rgb(var(--accent) / 0.08)',
            border: '1px solid rgb(var(--accent) / 0.2)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            <Gift className="inline h-3.5 w-3.5 align-middle mr-1" style={{ color: 'rgb(var(--accent))' }} />
            <span className="font-bold">Beta users get 1 month of Pro FREE</span> — all features unlocked, no credit card needed.
          </p>
          <p className="mt-1 text-xs" style={{ color: 'rgb(var(--accent))' }}>Sign up today to lock in your free month before the offer ends.</p>
        </div>

        {/* Pricing cards */}
        <div id="compare" className="mb-16 grid gap-6 sm:grid-cols-2">

          {/* Free */}
          <div
            className="flex flex-col rounded-2xl p-8"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}
          >
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)' }}>Free</p>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-5xl font-black" style={{ color: 'var(--foreground)' }}>RM 0</span>
                <span style={{ color: 'var(--muted-fg)' }}>/month</span>
              </div>
              <p className="mt-2 text-sm" style={{ color: 'var(--muted-fg)' }}>Forever free. No expiry.</p>
            </div>
            <Link
              href="/auth/login"
              className="mb-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all hover:opacity-80"
              style={{
                background: 'var(--muted-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--foreground)',
              }}
            >
              Get started free
            </Link>
            <ul className="flex-1 space-y-3">
              {FREE_FEATURES.map(({ text, included }) => (
                <li key={text} className="flex items-center gap-3 text-sm" style={{ color: included ? 'var(--foreground)' : 'var(--muted-fg)' }}>
                  {included
                    ? <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    : <X className="h-4 w-4 shrink-0" style={{ color: 'var(--muted-fg)', opacity: 0.5 }} />
                  }
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div
            className="relative flex flex-col rounded-2xl p-8"
            style={{
              background: 'var(--card-bg)',
              border: '2px solid rgb(var(--accent) / 0.5)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px var(--glow), 0 8px 32px rgba(0,0,0,0.08)',
            }}
          >
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-5 py-1.5 text-xs font-bold text-white inline-flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.85))',
                boxShadow: '0 2px 8px var(--glow)',
              }}
            >
              <Gift className="h-3.5 w-3.5" /> First month FREE for beta users
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
                  Most Popular
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-5xl font-black" style={{ color: 'var(--foreground)' }}>RM 19</span>
                <span style={{ color: 'var(--muted-fg)' }}>/month</span>
              </div>
              <p className="mt-1 text-xs font-medium" style={{ color: 'rgb(var(--accent))' }}>
                or <strong>RM 15/mo</strong> billed yearly (save 21%) — cancel any time
              </p>
            </div>
            <Link
              href="/auth/login"
              className="mb-8 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.85))',
                boxShadow: '0 4px 16px var(--glow)',
              }}
            >
              <Zap className="h-4 w-4" />
              Claim your free month
            </Link>
            <ul className="flex-1 space-y-3">
              {PRO_FEATURES.map(({ text, bold }) => (
                <li key={text} className={`flex items-center gap-3 text-sm ${bold ? 'font-semibold' : ''}`} style={{ color: 'var(--foreground)' }}>
                  <Check className="h-4 w-4 shrink-0" style={{ color: 'rgb(var(--accent))' }} />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* What's in Pro */}
        <div
          className="mb-16 rounded-2xl p-8"
          style={{
            background: 'var(--muted-bg)',
            border: '1px solid var(--card-border)',
          }}
        >
          <h2 className="mb-6 text-center text-lg font-bold" style={{ color: 'var(--foreground)' }}>What&apos;s included in Pro?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Kanban, title: 'Kanban Board', desc: 'Drag tasks across visual columns. Perfect for project workflows.', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
              { icon: Repeat2, title: 'Recurring Routines', desc: 'Daily habits that auto-reset. Consistency made effortless.', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
              { icon: Bell, title: 'Smart Reminders', desc: 'Push notifications before deadlines. Never forget a task.', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
              { icon: Palette, title: '7 Themes', desc: 'Cloud, Sand, Mint, Blossom, Midnight, Obsidian, Forest.', color: 'rgb(var(--accent))', bg: 'rgb(var(--accent) / 0.1)' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="rounded-xl p-4"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: bg }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h3>
                <p className="text-xs leading-5" style={{ color: 'var(--muted-fg)' }}>{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div
              className="rounded-xl p-4"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'rgb(var(--accent) / 0.1)' }}>
                <BarChart3 className="h-4 w-4" style={{ color: 'rgb(var(--accent))' }} />
              </div>
              <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Full Analytics</h3>
              <p className="text-xs leading-5" style={{ color: 'var(--muted-fg)' }}>Complete productivity history and weekly completion charts.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-xl font-bold" style={{ color: 'var(--foreground)' }}>Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl p-5"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{q}</h3>
                <p className="text-sm leading-6" style={{ color: 'var(--muted-fg)' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div
          className="rounded-2xl p-10 text-center"
          style={{
            background: `linear-gradient(135deg, rgb(var(--accent) / 0.9), rgb(var(--accent) / 0.7))`,
            boxShadow: '0 8px 32px var(--glow)',
          }}
        >
          <h2 className="text-2xl font-bold text-white">Ready to get organised?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/80">
            Join beta today, get 1 month of Pro on us. No card, no commitment. Just a better way to manage your work.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-semibold shadow-lg transition-all hover:opacity-90"
            style={{ color: 'rgb(var(--accent))' }}
          >
            <Zap className="h-4 w-4" />
            Start for free — Pro included
          </Link>
          <p className="mt-3 text-xs text-white/60">No credit card required. Takes under 30 seconds.</p>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-8"
        style={{
          borderTop: '1px solid var(--card-border)',
          background: 'var(--background)',
        }}
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs sm:flex-row" style={{ color: 'var(--muted-fg)' }}>
            <div className="flex items-center gap-2">
              <img src="/icon-192x192.png" alt="Optimaz" className="h-5 w-5 rounded-md" />
              <span className="font-medium" style={{ color: 'var(--foreground)' }}>Optimaz</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>by Mavora Digital</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/" className="transition-colors hover:opacity-70">Home</Link>
              <Link href="/privacy" className="transition-colors hover:opacity-70">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:opacity-70">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
