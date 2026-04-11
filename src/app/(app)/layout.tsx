import { Sidebar } from '@/components/layout/sidebar';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fc] dark:bg-[#0a0a0f]">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      {/* InstallPWAButton removed from layout. Add to page component instead. */}
    </div>
  );
}

