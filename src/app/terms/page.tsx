import Link from 'next/link';
import { FileText } from 'lucide-react';

const sections = [
  {
    title: 'Use of Optimaz',
    body: 'Optimaz is provided to help you organize personal tasks, projects, goals, reminders, and related productivity workflows. You are responsible for the information you add to your workspace.',
  },
  {
    title: 'Account Access',
    body: 'You must sign in with an approved authentication provider to use the private app workspace. Keep access to your sign-in account secure.',
  },
  {
    title: 'Acceptable Use',
    body: 'Do not misuse Optimaz, interfere with the service, attempt unauthorized access, or use the app to store or distribute harmful, illegal, or abusive content.',
  },
  {
    title: 'Beta Service',
    body: 'Optimaz may change as new beta features are tested. Some functionality may be adjusted, limited, or removed while the product is improved.',
  },
  {
    title: 'Availability',
    body: 'Optimaz is offered as-is during beta. Reasonable care is taken to keep it running, but uninterrupted availability is not guaranteed.',
  },
  {
    title: 'Updates to These Terms',
    body: 'These terms may be updated as Optimaz develops. Continued use after updates means you accept the latest version posted here.',
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-[#0a0a0f] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-8 flex items-center justify-between gap-4 text-sm">
          <Link href="/auth/login" className="font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Optimaz
          </Link>
          <Link href="/privacy" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            Privacy
          </Link>
        </nav>

        <div className="mb-8 flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Last updated May 13, 2026</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              These terms set basic expectations for using Optimaz during public beta preparation.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
