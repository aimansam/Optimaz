'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, LayoutDashboard, Kanban, FolderOpen, ListTodo, Repeat2, Settings, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/use-projects';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Today', icon: LayoutDashboard, description: "View today's tasks, streak & daily stats" },
  { href: '/tasks', label: 'Tasks', icon: ListTodo, description: 'Manage and organize all your tasks' },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays, description: 'Timeline view of all scheduled tasks' },
  { href: '/goals', label: 'Goals', icon: Target, description: 'Track long-term goals & milestones' },
  { href: '/routines', label: 'Routines', icon: Repeat2, description: 'Daily recurring habits & routines' },
  { href: '/kanban', label: 'Kanban', icon: Kanban, description: 'Visual board for your task workflow' },
  { href: '/projects', label: 'Projects', icon: FolderOpen, description: 'Organize tasks by project' },
  { href: '/settings', label: 'Settings', icon: Settings, description: 'Preferences & account settings' },
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
          'fixed z-40 top-0 left-0 h-full w-64 max-w-[calc(100vw-1rem)] flex flex-col transition-transform duration-300 md:static md:flex md:w-60 md:max-w-none',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 md:px-5 md:py-5">
          <img src="/icon-192x192.png" alt="Optimaz" className="h-8 w-8 shrink-0 rounded-xl shadow-sm shadow-black/20" />
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Optimaz</span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
              style={{
                background: 'rgb(var(--accent) / 0.15)',
                color: 'rgb(var(--accent))',
              }}
            >
              Beta
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4 md:px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon, description }) => {
            const active = pathname === href;
            return (
              <div key={href} className="group relative">
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 md:gap-3 md:rounded-xl md:px-3 md:py-2.5',
                  )}
                  style={active ? {
                    background: 'var(--muted-bg)',
                    color: 'var(--foreground)',
                  } : {
                    color: 'var(--muted-fg)',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'var(--muted-bg)';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'var(--foreground)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = '';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted-fg)';
                    }
                  }}
                  onClick={() => setOpen(false)}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-lg transition-all md:h-7 md:w-7',
                    )}
                    style={active ? {
                      background: 'rgb(var(--accent))',
                      color: '#ffffff',
                      boxShadow: '0 1px 3px rgb(var(--accent) / 0.4)',
                    } : {
                      color: 'var(--muted-fg)',
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </Link>

                {/* Hover tooltip */}
                <div
                  className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 min-w-[160px] max-w-[200px] rounded-xl border bg-white px-3 py-2 shadow-lg opacity-0 transition-all duration-150 group-hover:opacity-100 dark:bg-slate-900"
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{label}</p>
                  <p className="mt-0.5 text-[11px] leading-snug" style={{ color: 'var(--muted-fg)' }}>{description}</p>
                  {/* Arrow */}
                  <div
                    className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
                    style={{ borderRightColor: 'var(--card-border)' }}
                  />
                  <div
                    className="absolute right-full top-1/2 mr-px -translate-y-1/2 border-4 border-transparent"
                    style={{ borderRightColor: 'var(--background)' }}
                  />
                </div>
              </div>
            );
          })}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="pt-5">
            <p
              className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-widest md:px-3"
              style={{ color: 'var(--muted-fg)' }}
            >
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
                  )}
                  style={active ? {
                    background: 'var(--muted-bg)',
                    color: 'var(--foreground)',
                  } : {
                    color: 'var(--muted-fg)',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'var(--muted-bg)';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'var(--foreground)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = '';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted-fg)';
                    }
                  }}
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
              className="mt-1 flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors md:rounded-xl md:px-3"
              style={{ color: 'var(--muted-fg)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--muted-bg)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--foreground)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = '';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted-fg)';
              }}
              onClick={() => setOpen(false)}
            >
              <span>View all projects</span>
              {hiddenProjectCount > 0 && <span>+{hiddenProjectCount}</span>}
            </Link>
          </div>
        )}
        </nav>

        {/* Sidebar footer */}
        <div
          className="shrink-0 px-4 py-3"
          style={{ borderTop: '1px solid var(--sidebar-border)' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px]" style={{ color: 'var(--muted-fg)' }}>
              © {new Date().getFullYear()} Mavora Digital
            </p>
            {process.env.NEXT_PUBLIC_APP_VERSION && (
              <span className="text-[10px]" style={{ color: 'var(--muted-fg)', opacity: 0.5 }}>
                v{process.env.NEXT_PUBLIC_APP_VERSION}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <a href="/privacy" className="text-[10px] transition-colors hover:underline" style={{ color: 'var(--muted-fg)' }}>Privacy</a>
            <span className="text-[10px]" style={{ color: 'var(--muted-fg)', opacity: 0.4 }}>·</span>
            <a href="/terms" className="text-[10px] transition-colors hover:underline" style={{ color: 'var(--muted-fg)' }}>Terms</a>
          </div>
        </div>
      </aside>
    </>
  );
}
