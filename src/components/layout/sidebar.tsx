'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, LayoutDashboard, Kanban, FolderOpen, ListTodo, Repeat2, Settings, Target, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface SidebarProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function Sidebar({ open, setOpen, collapsed = false, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { data: projects } = useProjects();
  // On mobile (open=true), always show full sidebar regardless of collapsed state
  const effectiveCollapsed = collapsed && !open;
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
          'fixed inset-0 z-30 backdrop-blur-sm transition-opacity md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={() => setOpen(false)}
      />

      <aside
        className={cn(
          'fixed z-40 top-0 left-0 h-full flex flex-col transition-all duration-300 md:static md:flex',
          // Mobile: always w-64 when open; desktop: w-60 full or w-16 collapsed
          'w-64 max-w-[calc(100vw-1rem)] md:max-w-none',
          collapsed ? 'md:w-16' : 'md:w-60',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className={cn('flex items-center gap-3 px-4 py-4 md:py-5', collapsed ? 'md:px-3.5 md:justify-center' : 'md:px-5')}>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.7))',
              boxShadow: '0 4px 14px var(--glow)',
            }}
          >
            <img src="/icon-192x192.png" alt="Optimaz" className="h-7 w-7 rounded-lg" />
          </div>
          {!effectiveCollapsed && (
            <div className="flex items-center gap-1.5">
              <span className="gradient-text text-base font-bold tracking-tight">
                Optimaz
              </span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                style={{
                  background: 'rgb(var(--accent) / 0.15)',
                  color: 'rgb(var(--accent))',
                  border: '1px solid rgb(var(--accent) / 0.2)',
                }}
              >
                Beta
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
          <nav className={cn('flex-1 space-y-0.5 overflow-y-auto overscroll-y-contain pb-4', collapsed ? 'md:px-2' : 'px-2 md:px-3')}>
          {NAV_ITEMS.map(({ href, label, icon: Icon, description }) => {
            const active = pathname === href;
            return (
              <div key={href} className="group relative">
                <Link
                  href={href}
                  className={cn(
                    'flex items-center rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-200',
                    effectiveCollapsed ? 'md:justify-center md:px-2' : 'gap-2.5 md:gap-3 md:px-3',
                  )}
                  style={active ? {
                    background: 'rgb(var(--accent) / 0.12)',
                    color: 'var(--foreground)',
                    boxShadow: 'inset 0 0 0 1px rgb(var(--accent) / 0.2)',
                    borderLeft: '3px solid rgb(var(--accent))',
                  } : {
                    color: 'var(--muted-fg)',
                    borderLeft: '3px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'rgb(var(--accent) / 0.07)';
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
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
                    )}
                    style={active ? {
                      background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.75))',
                      color: '#ffffff',
                      boxShadow: '0 2px 8px var(--glow)',
                    } : {
                      color: 'var(--muted-fg)',
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {!effectiveCollapsed && label}
                </Link>

                {/* Hover tooltip — only in collapsed desktop mode */}
                {effectiveCollapsed && (
                  <div
                    className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 min-w-[160px] max-w-[200px] rounded-xl px-3 py-2 shadow-xl opacity-0 transition-all duration-150 group-hover:opacity-100 hidden md:block"
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--glass-border)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                    }}
                  >
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{label}</p>
                    <p className="mt-0.5 text-[11px] leading-snug" style={{ color: 'var(--muted-fg)' }}>{description}</p>
                    <div
                      className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
                      style={{ borderRightColor: 'var(--glass-border)' }}
                    />
                  </div>
                )}

              </div>
            );
          })}

        {/* Projects — hidden when collapsed */}
        {!effectiveCollapsed && projects && projects.length > 0 && (
          <div className="pt-5">
            <p
              className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-widest md:px-3"
              style={{ color: 'var(--muted-fg)', opacity: 0.7 }}
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
                    'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-200 md:gap-3 md:px-3',
                  )}
                  style={active ? {
                    background: 'rgb(var(--accent) / 0.12)',
                    color: 'var(--foreground)',
                    boxShadow: 'inset 0 0 0 1px rgb(var(--accent) / 0.2)',
                    borderLeft: '3px solid rgb(var(--accent))',
                  } : {
                    color: 'var(--muted-fg)',
                    borderLeft: '3px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'rgb(var(--accent) / 0.07)';
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
                    className="h-2.5 w-2.5 rounded-full shrink-0 ring-1 ring-white/20"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate">{project.parent_project_id ? `↳ ${project.name}` : project.name}</span>
                </Link>
              );
            })}
            <Link
              href="/projects"
              className="mt-1 flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-200 md:px-3"
              style={{ color: 'var(--muted-fg)', borderLeft: '3px solid transparent' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgb(var(--accent) / 0.07)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--foreground)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = '';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted-fg)';
              }}
              onClick={() => setOpen(false)}
            >
              <span>View all projects</span>
              {hiddenProjectCount > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                  style={{
                    background: 'rgb(var(--accent) / 0.12)',
                    color: 'rgb(var(--accent))',
                  }}
                >
                  +{hiddenProjectCount}
                </span>
              )}
            </Link>
          </div>
        )}
        </nav>

        {/* Sidebar footer */}
        <div
          className="shrink-0 px-4 py-3"
          style={{
            borderTop: '1px solid var(--sidebar-border)',
          }}
        >
          {/* Collapse toggle — desktop only */}
          {onToggleCollapsed && (
            <button
              onClick={onToggleCollapsed}
              className={cn(
                'hidden md:flex mb-2 w-full items-center rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-200',
                effectiveCollapsed ? 'justify-center' : 'gap-2'
              )}
              style={{ color: 'var(--muted-fg)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgb(var(--accent) / 0.07)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-fg)';
              }}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          )}

          {!effectiveCollapsed && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[10px]" style={{ color: 'var(--muted-fg)', opacity: 0.6 }}>
                  © {new Date().getFullYear()} Mavora Digital
                </p>
                {process.env.NEXT_PUBLIC_APP_VERSION && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                    style={{
                      background: 'rgb(var(--accent) / 0.1)',
                      color: 'rgb(var(--accent) / 0.7)',
                    }}
                  >
                    v{process.env.NEXT_PUBLIC_APP_VERSION}
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <a href="/privacy" className="text-[10px] transition-colors hover:underline" style={{ color: 'var(--muted-fg)', opacity: 0.7 }}>Privacy</a>
                <span className="text-[10px]" style={{ color: 'var(--muted-fg)', opacity: 0.3 }}>·</span>
                <a href="/terms" className="text-[10px] transition-colors hover:underline" style={{ color: 'var(--muted-fg)', opacity: 0.7 }}>Terms</a>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
