import Link from 'next/link';
import { Shield } from 'lucide-react';

type Section = {
  title: string;
  body: string;
  items?: string[];
};

const sections: Section[] = [
  {
    title: '1. Who We Are',
    body: 'Optimaz is a personal productivity application operated by Mavora Digital, based in Malaysia. For data-related queries, contact us at hello@optimaz.app.',
  },
  {
    title: '2. Data We Collect',
    body: 'We collect the following types of information:',
    items: [
      'Account information — your email address (and name where available) when you sign in via Google, GitHub, or email',
      'Workspace content — tasks, subtasks, projects, goals, routines, notes, due dates, and settings you create in the app',
      'Usage data — product events such as task creation and feature usage to understand how the app is used',
      'Feedback — messages, category, and page path when you submit feedback',
      'Waitlist data — email address and optional feature preferences you submit on the pricing page',
      'Device data — browser push notification endpoint when you enable push notifications',
      'Error data — technical error details used to diagnose and fix bugs',
    ],
  },
  {
    title: '3. How We Use Your Data',
    body: 'We use your data to:',
    items: [
      'Provide and maintain your workspace across devices',
      'Send reminders and push notifications you have enabled',
      'Improve the product based on aggregated usage patterns',
      'Respond to feedback and support requests',
      'Protect the service from abuse and fraudulent activity',
      'Comply with legal obligations',
    ],
  },
  {
    title: '4. Legal Basis for Processing',
    body: 'Under the Malaysia Personal Data Protection Act 2010 (PDPA) and where applicable the EU General Data Protection Regulation (GDPR), we process your personal data on the following bases:',
    items: [
      'Contract — processing necessary to provide the service you signed up for',
      'Consent — you consented to these terms when you signed in',
      'Legitimate interests — improving the product and ensuring security, balanced against your privacy rights',
    ],
  },
  {
    title: '5. Third-Party Processors',
    body: 'We share data only with trusted service providers who process it solely to run Optimaz:',
    items: [
      'Google — OAuth authentication provider',
      'GitHub — OAuth authentication provider',
      'Supabase (Supabase Inc.) — database and authentication infrastructure, hosted in Singapore (ap-southeast-1)',
      'Vercel (Vercel Inc., USA) — hosting and serverless functions',
      'Resend (Resend Inc., USA) — transactional email delivery',
    ],
  },
  {
    title: '6. International Data Transfers',
    body: 'Optimaz uses cloud infrastructure in Singapore (Supabase) and the United States (Vercel, Resend). By using Optimaz, you acknowledge that your personal data may be transferred to and processed in these countries. Transfers are made with appropriate safeguards in place, including contractual clauses and compliance with applicable privacy laws.',
  },
  {
    title: '7. Data Retention',
    body: 'Your workspace data (tasks, projects, goals) is retained for as long as your account is active or as needed to provide the service. Analytics and error logs are retained for up to 12 months. Pricing waitlist entries are kept until withdrawn. Upon account deletion, your personal data is removed within 30 days, except where retention is required by law.',
  },
  {
    title: '8. Your Rights',
    body: 'Under Malaysia PDPA 2010 and where applicable GDPR, you have the following rights:',
    items: [
      'Access — request a copy of your personal data (use the Export Data option in Settings)',
      'Correction — update inaccurate data directly in the app or by contacting us',
      'Erasure — delete your account and all data at any time from Settings › Delete Account',
      'Portability — export your data in machine-readable format from Settings',
      'Withdraw consent — stop using the service and delete your account at any time',
      'Lodge a complaint — with the Department of Personal Data Protection Malaysia or your local data protection authority',
    ],
  },
  {
    title: '9. Data Security',
    body: 'We implement reasonable technical and organisational measures to protect your data, including encrypted data transmission (HTTPS/TLS), row-level security policies in the database, and access controls. No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.',
  },
  {
    title: "10. Children's Privacy",
    body: 'Optimaz is not intended for children under 13 years of age. We do not knowingly collect personal data from children. If you believe a child under 13 has provided data, please contact us and we will delete it promptly.',
  },
  {
    title: '11. Changes to This Policy',
    body: 'We may update this policy as Optimaz grows. The "Last updated" date at the top will reflect any changes. Material changes will be communicated where reasonably possible before they take effect.',
  },
  {
    title: '12. Contact',
    body: 'For any privacy questions, data access or deletion requests, or to exercise your rights under PDPA or GDPR, contact us at: hello@optimaz.app',
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-[#0a0a0f] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-8 flex items-center justify-between gap-4 text-sm">
          <Link href="/" className="font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Optimaz
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">Terms</Link>
            <Link href="/pricing" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">Pricing</Link>
          </div>
        </nav>

        <div className="mb-8 flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Last updated June 2026</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              This policy explains how Optimaz (Mavora Digital, Malaysia) collects, uses, and protects your personal data
              in accordance with the Malaysia Personal Data Protection Act 2010 (PDPA) and, where applicable, the EU
              General Data Protection Regulation (GDPR).
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{section.body}</p>
              {section.items && (
                <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Mavora Digital. All rights reserved.
        </p>
      </div>
    </main>
  );
}
