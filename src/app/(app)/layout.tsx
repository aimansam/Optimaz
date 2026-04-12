
'use client';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

import { cloneElement, isValidElement } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Inject onMenuClick prop into child pages if they accept it
  const childWithSidebar = isValidElement(children)
    ? cloneElement(children, { onMenuClick: () => setSidebarOpen(true) })
    : children;
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fc] dark:bg-[#0a0a0f]">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex flex-1 flex-col overflow-hidden w-full md:w-auto">
        {childWithSidebar}
      </main>
    </div>
  );
}

