import { Sidebar } from '@/components/layout/sidebar';
import dynamic from 'next/dynamic';
const InstallPWAButton = dynamic(() => import('@/components/InstallPWAButton'), { ssr: false });

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fc] dark:bg-[#0a0a0f]">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      {process.env.NODE_ENV !== 'development' && <InstallPWAButton />}
    </div>
  );
}

