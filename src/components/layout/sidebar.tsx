'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, LayoutDashboard, Kanban, FolderOpen, Repeat2, Settings, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/use-projects';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Today', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/routines', label: 'Routines', icon: Repeat2 },
  { href: '/kanban', label: 'Kanban', icon: Kanban },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];



export function Sidebar({ open, setOpen }: { open: boolean, setOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const { data: projects } = useProjects();
  const activeProject = projects?.find(project => pathname === `/projects/${project.id}`);
  const topLevelProjects = projects?.filter(project => !project.parent_project_id) ?? [];
  const baseProjects = topLevelProjects.slice(0, activeProject && !topLevelProjects.some(project => project.id === activeProject.id) ? 5 : 6);
  const visibleProjects = activeProject && !baseProjects.some(project => project.id === activeProject.id)
    ? [...baseProjects, activeProject]
    : baseProjects;
  const hiddenProjectCount = Math.max(topLevelProjects.length - visibleProjects.filter(project => !project.parent_project_id).length, 0);

  return (
    <>
      {/* Sidebar overlay for mobile */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setOpen(false)}
      />

      <aside
        className={cn(
          'fixed z-40 top-0 left-0 h-full w-64 max-w-[calc(100vw-1rem)] flex-col border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950 transition-transform duration-300 md:static md:flex md:w-60 md:max-w-none',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 md:px-5 md:py-5">
          <img src="/icon-192x192.png" alt="Optimaz" className="h-8 w-8 shrink-0 rounded-xl shadow-sm shadow-black/20" />
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">Optimaz</span>
            <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">Beta</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4 md:px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 md:gap-3 md:rounded-xl md:px-3 md:py-2.5',
                  active
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200'
                )}
                onClick={() => setOpen(false)}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-lg transition-all md:h-7 md:w-7',
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
            <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 md:px-3">
              Projects
            </p>
            {visibleProjects.map((project) => {
              const active = pathname === `/projects/${project.id}`;
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 md:gap-3 md:rounded-xl md:px-3',
                    active
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200'
                  )}
                  onClick={() => setOpen(false)}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate">{project.parent_project_id ? `Sub: ${project.name}` : project.name}</span>
                </Link>
              );
            })}
            <Link
              href="/projects"
              className="mt-1 flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800/70 dark:hover:text-slate-200 md:rounded-xl md:px-3"
              onClick={() => setOpen(false)}
            >
              <span>View all projects</span>
              {hiddenProjectCount > 0 && <span>+{hiddenProjectCount}</span>}
            </Link>
          </div>
        )}
        </nav>
      </aside>
    </>
  );
}

