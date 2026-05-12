import Link from 'next/link';
import { Shield } from 'lucide-react';

const sections = [
  {
    title: 'Information We Use',
    body: 'TaskFlow uses your sign-in account information, profile name, projects, goals, tasks, subtasks, notification settings, and product activity events needed to operate and improve the service.',
  },
  {
    title: 'How Your Data Is Used',
    body: 'Your data is used to keep your workspace synced, show reminders and notifications, understand product activation, troubleshoot issues, and protect the service from abuse.',
  },
  {
    title: 'What Is Not Sold',
    body: 'TaskFlow does not sell your personal workspace data. Your task, project, and goal content is intended to remain private to your account.',
  },
  {
    title: 'Third-Party Services',
    body: 'TaskFlow relies on trusted infrastructure providers for authentication, hosting, database storage, and push notifications. Those providers process data only as needed to run the application.',
  },
  {
    title: 'Your Choices',
    body: 'You can edit or delete your projects, goals, tasks, and subtasks inside the app. You can disable browser push notifications from your device or browser settings.',
  },
  {
    title: 'Changes',
    body: 'This policy may be updated as TaskFlow grows. Material changes should be reflected on this page before they apply to new use of the service.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-[#0a0a0f] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-8 flex items-center justify-between gap-4 text-sm">
          <Link href="/auth/login" className="font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            TaskFlow
          </Link>
          <Link href="/terms" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            Terms
          </Link>
        </nav>

        <div className="mb-8 flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Last updated May 13, 2026</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              This page explains the basic data practices for TaskFlow while the product is prepared for public beta.
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
