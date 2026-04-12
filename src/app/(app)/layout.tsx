// Minimal valid layout for Next.js App Router
import { useState } from 'react';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col">
        <Header title="TaskFlow" onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </main>
    </div>
  );
}
