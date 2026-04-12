"use client";
import { useState } from 'react';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { createContext, useContext } from 'react';

interface HeaderContextType {
  title: string;
  setTitle: (title: string) => void;
  actions?: React.ReactNode;
  setActions: (actions?: React.ReactNode) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function useHeader() {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error('useHeader must be used within HeaderContext');
  return ctx;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState('TaskFlow');
  const [actions, setActions] = useState<React.ReactNode>(undefined);
  return (
    <HeaderContext.Provider value={{ title, setTitle, actions, setActions }}>
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 flex flex-col">
          <Header title={title} actions={actions} onMenuClick={() => setSidebarOpen(true)} />
          {children}
        </main>
      </div>
    </HeaderContext.Provider>
  );
}
