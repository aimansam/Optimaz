import Link from 'next/link';

/**
 * Standalone 404 for routes within the (app) layout group.
 * Uses fixed positioning to render independently of the sidebar/header.
 */
export default function AppNotFound() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-6 dark:bg-slate-950">
      <img src="/icon-192x192.png" alt="Optimaz" className="h-14 w-14 rounded-2xl shadow-lg" />
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm text-center text-sm text-slate-500 dark:text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white shadow-sm hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
