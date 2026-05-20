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
          'fixed z-40 top-0 left-0 h-full w-60 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950 transition-transform duration-300 md:static md:flex',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
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
                onClick={() => setOpen(false)}
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
            {visibleProjects.map((project) => {
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
              className="mt-1 flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800/70 dark:hover:text-slate-200"
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

