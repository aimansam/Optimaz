"use client";
import { useState } from 'react';
import { usePathname } from 'next/navigation';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

function getPageTitle(pathname: string) {
  if (pathname === '/dashboard') return 'Today';
  if (pathname === '/calendar') return 'Calendar';
  if (pathname === '/goals') return 'Goals';
  if (pathname.startsWith('/goals/')) return 'Goal';
  if (pathname === '/routines') return 'Routines';
  if (pathname === '/kanban') return 'Kanban';
  if (pathname === '/projects') return 'Projects';
  if (pathname.startsWith('/projects/')) return 'Project';
  if (pathname === '/settings') return 'Settings';
  if (pathname === '/admin') return 'Admin';
  return 'Optimaz';
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 flex min-w-0 flex-col overflow-y-auto">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </main>
    </div>
  );
}
