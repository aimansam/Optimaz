import Link from 'next/link';
import { FileText } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By creating an account or using Optimaz, you agree to these Terms of Service. If you do not agree, do not use the service. These terms form a binding agreement between you and Mavoralabs (operator of Optimaz), a business based in Malaysia.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 13 years of age to use Optimaz. By using the service, you confirm that you meet this requirement. If you are using Optimaz on behalf of an organisation, you represent that you have authority to bind that organisation to these terms.',
  },
  {
    title: '3. Your Account',
    body: 'You must sign in using an approved authentication provider (currently Google) to access your private workspace. You are responsible for keeping your sign-in credentials secure. You are responsible for all activity that occurs under your account. Notify us immediately at hello@optimaz.app if you suspect unauthorised access.',
  },
  {
    title: '4. Use of Optimaz',
    body: 'Optimaz is provided to help you organise personal tasks, projects, goals, routines, and related productivity workflows. You are responsible for the content you add to your workspace. You agree not to: (a) use the service for any unlawful purpose; (b) attempt to gain unauthorised access to any part of the service; (c) interfere with or disrupt the service or its servers; (d) upload or transmit content that is harmful, abusive, or violates third-party rights; (e) use automated means to scrape or access the service.',
  },
  {
    title: '5. Your Content',
    body: 'You retain ownership of the content you create in Optimaz (tasks, projects, goals, notes, etc.). You grant Mavoralabs a limited licence to store and process your content solely to operate and provide the service. We do not use your workspace content for advertising or share it with third parties beyond what is required to run the service.',
  },
  {
    title: '6. Intellectual Property',
    body: 'Optimaz and all associated software, design, trademarks, and branding are the property of Mavoralabs. Nothing in these terms grants you any rights to use our name, logos, or branding without explicit written permission. You may not copy, modify, distribute, or reverse-engineer any part of the Optimaz application.',
  },
  {
    title: '7. Beta Service',
    body: 'Optimaz is currently in public beta. Features may change, be limited, or be removed as the product is developed. We may modify or discontinue parts of the service at any time with reasonable notice where practical. Beta users accept that the service is provided in a pre-release state.',
  },
  {
    title: '8. Availability',
    body: 'We aim to keep Optimaz available and reliable, but we do not guarantee uninterrupted access. Planned or unplanned maintenance, infrastructure issues, or factors outside our control may cause temporary unavailability. We are not liable for any disruption to your use of the service.',
  },
  {
    title: '9. Disclaimer of Warranties',
    body: 'To the maximum extent permitted by Malaysian law, Optimaz is provided "as is" and "as available" without any warranty of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the service will be error-free or that defects will be corrected.',
  },
  {
    title: '10. Limitation of Liability',
    body: 'To the maximum extent permitted by applicable law, Mavoralabs shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use Optimaz, including loss of data, profits, or goodwill. Our total liability for any claim arising under these terms shall not exceed the amount you paid for the service in the 12 months preceding the claim (or RM 50 if you are a free user).',
  },
  {
    title: '11. Termination',
    body: 'You may stop using Optimaz and delete your account at any time from Settings > Delete Account. We reserve the right to suspend or terminate your access if you violate these terms, with or without notice depending on the severity. Sections 5, 6, 9, 10, and 12 survive termination.',
  },
  {
    title: '12. Governing Law and Dispute Resolution',
    body: 'These terms are governed by the laws of Malaysia. Any disputes arising from these terms or your use of Optimaz shall be resolved in the courts of Malaysia. If you are located outside Malaysia, you agree to submit to the non-exclusive jurisdiction of Malaysian courts.',
  },
  {
    title: '13. Changes to These Terms',
    body: 'We may update these terms as Optimaz develops. The "Last updated" date reflects the latest revision. Continued use of the service after changes are posted means you accept the updated terms. For material changes, we will make reasonable efforts to notify you in advance.',
  },
  {
    title: '14. Contact',
    body: 'For questions about these Terms of Service, contact us at: hello@optimaz.app',
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-[#0a0a0f] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-8 flex items-center justify-between gap-4 text-sm">
          <Link href="/" className="font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Optimaz
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">Privacy</Link>
            <Link href="/pricing" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">Pricing</Link>
          </div>
        </nav>

        <div className="mb-8 flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Last updated June 9, 2026</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              These Terms of Service govern your use of Optimaz, operated by Mavoralabs (Malaysia). By using Optimaz, you agree to these terms.
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
