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
  { text: 'Everything in Free', included: true, bold: true },
  { text: 'Unlimited projects', included: true },
  { text: 'Kanban board', included: true, icon: Kanban },
  { text: 'Recurring routines & habits', included: true, icon: Repeat2 },
  { text: 'Push notifications & smart reminders', included: true, icon: Bell },
  { text: 'Full analytics & productivity charts', included: true, icon: BarChart3 },
  { text: '7 premium themes (light + dark)', included: true, icon: Palette },
  { text: 'Priority support', included: true },
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
    a: 'We plan to support credit/debit cards (Visa, Mastercard) and popular e-wallets. More options based on feedback.',
  },
  {
    q: 'Is my data safe?',
    a: 'All data is stored securely with Supabase (PostgreSQL) on AWS infrastructure. Row-level security means only you can access your data.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Nav */}
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/icon-192x192.png" alt="Optimaz" className="h-7 w-7 rounded-xl" />
            <span className="text-sm font-bold tracking-tight">Optimaz</span>
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            Sign in →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            Beta offer active
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Simple, honest pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400 leading-7">
            Start completely free. Upgrade when Optimaz becomes indispensable. Cancel any time with zero friction.
          </p>
        </div>

        {/* Beta banner */}
        <div className="mb-10 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/10 px-6 py-4 text-center">
          <p className="text-sm font-medium text-slate-200">
            🎁 <span className="text-indigo-300 font-semibold">Beta users get 1 month of Pro FREE</span> — all features unlocked, no credit card needed.
          </p>
          <p className="mt-1 text-xs text-slate-400">Sign up today to lock in your free month before the offer ends.</p>
        </div>

        {/* Pricing cards */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2">

          {/* Free */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Free</p>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-5xl font-black text-white">RM 0</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">Forever free. No expiry.</p>
            </div>

            <Link
              href="/auth/login"
              className="mb-8 block w-full rounded-xl border border-white/10 py-3 text-center text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/5"
            >
              Get started free
            </Link>

            <ul className="flex-1 space-y-3">
              {FREE_FEATURES.map(({ text, included }) => (
                <li key={text} className={`flex items-center gap-3 text-sm ${included ? 'text-slate-300' : 'text-slate-600'}`}>
                  {included
                    ? <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    : <X className="h-4 w-4 shrink-0 text-slate-700" />
                  }
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative flex flex-col rounded-2xl border border-indigo-500/40 bg-gradient-to-b from-indigo-500/[0.12] to-violet-500/[0.06] p-8">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-1.5 text-xs font-bold text-white shadow-xl shadow-indigo-500/30">
              🎁 First month FREE for beta users
            </div>

            <div className="mb-6 mt-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">Pro</p>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wide">Most Popular</span>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-base font-semibold text-slate-500 line-through">RM 15</span>
                <span className="text-5xl font-black text-white ml-1">RM 0</span>
                <span className="text-slate-400">/first month</span>
              </div>
              <p className="mt-1 text-xs font-medium text-indigo-400">then RM 15/month — cancel any time</p>
            </div>

            <Link
              href="/auth/login"
              className="mb-8 block w-full rounded-xl bg-indigo-500 py-3 text-center text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all hover:bg-indigo-400"
            >
              <span className="flex items-center justify-center gap-2">
                <Zap className="h-4 w-4" />
                Claim your free month
              </span>
            </Link>

            <ul className="flex-1 space-y-3">
              {PRO_FEATURES.map(({ text, included, bold }) => (
                <li key={text} className={`flex items-center gap-3 text-sm ${bold ? 'font-semibold text-white' : 'text-slate-200'}`}>
                  <Check className="h-4 w-4 shrink-0 text-indigo-400" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feature comparison note */}
        <div className="mb-16 rounded-2xl border border-white/5 bg-white/[0.02] p-8">
          <h2 className="mb-6 text-center text-lg font-bold text-white">What's included in Pro?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Kanban, title: 'Kanban Board', desc: 'Drag tasks across visual columns. Perfect for project workflows.' },
              { icon: Repeat2, title: 'Recurring Routines', desc: 'Daily habits that auto-reset. Consistency made effortless.' },
              { icon: Bell, title: 'Smart Reminders', desc: 'Push notifications before deadlines. Never forget a task.' },
              { icon: Palette, title: '7 Themes', desc: 'Cloud, Sand, Mint, Blossom, Midnight, Obsidian, Forest.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
                <p className="text-xs leading-5 text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-xl font-bold text-white">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-white/5 bg-white/[0.03] p-5">
                <h3 className="mb-2 text-sm font-semibold text-white">{q}</h3>
                <p className="text-sm leading-6 text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-10 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to get organised?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
            Join beta today, get 1 month of Pro on us. No card, no commitment. Just a better way to manage your work.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400"
          >
            <Zap className="h-4 w-4" />
            Start for free — Pro included
          </Link>
          <p className="mt-3 text-xs text-slate-500">No credit card required. Takes under 30 seconds.</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
            <div className="flex items-center gap-2">
              <img src="/icon-192x192.png" alt="Optimaz" className="h-5 w-5 rounded-md" />
              <span className="font-medium text-slate-400">Optimaz</span>
              <span className="text-slate-600">· by Mavora Digital</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/" className="transition-colors hover:text-slate-300">Home</Link>
              <Link href="/privacy" className="transition-colors hover:text-slate-300">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:text-slate-300">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
