'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Kanban, FolderOpen, Settings, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/use-projects';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Today', icon: LayoutDashboard },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/kanban', label: 'Kanban', icon: Kanban },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: projects } = useProjects();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 shadow-sm shadow-black/20 dark:bg-white">
          <Zap className="h-4 w-4 text-white dark:text-slate-900" fill="currentColor" />
        </div>
        <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">TaskFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200'
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg transition-all',
                  active
                    ? 'bg-slate-900 text-white shadow-sm shadow-black/20 dark:bg-white dark:text-slate-900'
                    : 'text-slate-400 dark:text-slate-500'
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </Link>
          );
        })}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="pt-5">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
              Projects
            </p>
            {projects.map((project) => {
              const active = pathname === `/projects/${project.id}`;
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150',
                    active
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200'
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate">{project.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}

