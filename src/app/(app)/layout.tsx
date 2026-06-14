"use client";
import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { QuickAddFAB } from '@/components/layout/quick-add-fab';

const SIDEBAR_COLLAPSED_KEY = 'optimaz:sidebar-collapsed';

function getPageTitle(pathname: string) {
  if (pathname === '/dashboard') return 'Today';
  if (pathname === '/calendar') return 'Calendar';
  if (pathname === '/goals') return 'Goals';
  if (pathname.startsWith('/goals/')) return 'Goal';
  if (pathname === '/routines') return 'Routines';
  if (pathname === '/kanban') return 'Kanban';
  if (pathname === '/projects') return 'Projects';
  if (pathname.startsWith('/projects/')) return 'Project';
  if (pathname === '/tasks') return 'Tasks';
  if (pathname === '/settings') return 'Settings';
  if (pathname === '/admin') return 'Admin';
  return 'Optimaz';
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  const toggleCollapsed = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: 'var(--background)' }}>
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleCollapsed}
      />
      <main className="flex-1 flex min-w-0 flex-col overflow-hidden" style={{ background: 'var(--background)' }}>
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </main>
      <QuickAddFAB />
    </div>
  );
}
