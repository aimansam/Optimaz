'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Filter, RotateCcw, Search } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useProjects } from '@/hooks/use-projects';
import { useTasksByStatus } from '@/hooks/use-tasks';
import type { Priority } from '@/lib/types';

type DueFilter = 'all' | 'overdue' | 'today' | 'upcoming' | 'no_date';
type DoneFilter = 'show' | 'hide' | 'archived';

const KANBAN_FILTER_VISIBILITY_KEY = 'taskflow:kanban:filters-open';

function getDateKey(value: Date) {
  return value.toISOString().split('T')[0];
}

export default function KanbanPage() {
  const { data: projects } = useProjects();
  const [query, setQuery] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [dueFilter, setDueFilter] = useState<DueFilter>('all');
  const [doneFilter, setDoneFilter] = useState<DoneFilter>('show');
  const [showFilters, setShowFilters] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(KANBAN_FILTER_VISIBILITY_KEY) === 'true';
  });
  const showArchived = doneFilter === 'archived';
  const { data: tasks, isLoading } = useTasksByStatus(undefined, showArchived);

  function toggleFilters() {
    setShowFilters(current => {
      const next = !current;
      window.localStorage.setItem(KANBAN_FILTER_VISIBILITY_KEY, String(next));
      return next;
    });
  }

  function applyQuickView(view: 'active' | 'urgent' | 'today' | 'archived') {
    setQuery('');
    setProjectId('');
    setPriority(view === 'urgent' ? 'urgent' : '');
    setDueFilter(view === 'today' ? 'today' : 'all');
    setDoneFilter(view === 'archived' ? 'archived' : 'hide');
  }

  const filteredTasks = useMemo(() => {
    const today = getDateKey(new Date());
    const normalizedQuery = query.trim().toLowerCase();

    return (tasks ?? []).filter(task => {
      const dueDate = task.due_date;
      const matchesQuery = !normalizedQuery
        || task.title.toLowerCase().includes(normalizedQuery)
        || task.notes?.toLowerCase().includes(normalizedQuery)
        || task.project?.name.toLowerCase().includes(normalizedQuery);
      const matchesProject = !projectId || task.project_id === projectId;
      const matchesPriority = !priority || task.priority === priority;
      const matchesDone = (
        doneFilter === 'show' ? !task.archived_at
        : doneFilter === 'hide' ? task.status !== 'done' && !task.archived_at
        : Boolean(task.archived_at)
      );
      const matchesDue = (
        dueFilter === 'all'
        || (dueFilter === 'no_date' && !dueDate)
        || (dueFilter === 'overdue' && dueDate !== null && dueDate < today && task.status !== 'done')
        || (dueFilter === 'today' && dueDate === today)
        || (dueFilter === 'upcoming' && dueDate !== null && dueDate > today)
      );

      return matchesQuery && matchesProject && matchesPriority && matchesDone && matchesDue;
    });
  }, [doneFilter, dueFilter, priority, projectId, query, tasks]);

  const trimmedQuery = query.trim();
  const hasFilters = Boolean(trimmedQuery || projectId || priority || dueFilter !== 'all' || doneFilter !== 'show');
  const activeFilterCount = [trimmedQuery, projectId, priority, dueFilter !== 'all' ? dueFilter : '', doneFilter !== 'show' ? doneFilter : ''].filter(Boolean).length;

  function resetFilters() {
    setQuery('');
    setProjectId('');
    setPriority('');
    setDueFilter('all');
    setDoneFilter('show');
  }

  return (
    <>

      <div className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden p-2 sm:p-4 md:p-6">
        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <Filter className="h-4 w-4 text-slate-500" />
              Kanban filters
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {filteredTasks.length}/{tasks?.length ?? 0}
              </span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white dark:bg-white dark:text-slate-900">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Button type="button" variant="ghost" size="sm" onClick={resetFilters} disabled={!hasFilters}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={toggleFilters} aria-expanded={showFilters}>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                {showFilters ? 'Hide filters' : 'Show filters'}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => applyQuickView('active')}>Active</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => applyQuickView('urgent')}>Urgent</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => applyQuickView('today')}>Due today</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => applyQuickView('archived')}>Archived</Button>
          </div>

          {showFilters && <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.4fr)_minmax(150px,0.8fr)_minmax(130px,0.7fr)_minmax(140px,0.7fr)_minmax(140px,0.7fr)]">
            <label className="relative block">
              <span className="sr-only">Search Kanban tasks</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search title, notes, project"
                className="pl-9"
              />
            </label>

            <label>
              <span className="sr-only">Filter by project</span>
              <Select value={projectId} onChange={event => setProjectId(event.target.value)}>
                <option value="">All projects</option>
                {projects?.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
              </Select>
            </label>

            <label>
              <span className="sr-only">Filter by priority</span>
              <Select value={priority} onChange={event => setPriority(event.target.value as Priority | '')}>
                <option value="">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </label>

            <label>
              <span className="sr-only">Filter by due date</span>
              <Select value={dueFilter} onChange={event => setDueFilter(event.target.value as DueFilter)}>
                <option value="all">Any due date</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due today</option>
                <option value="upcoming">Upcoming</option>
                <option value="no_date">No due date</option>
              </Select>
            </label>

            <label>
              <span className="sr-only">Done task visibility</span>
              <Select value={doneFilter} onChange={event => setDoneFilter(event.target.value as DoneFilter)}>
                <option value="show">Show done</option>
                <option value="hide">Hide done</option>
                <option value="archived">Archived done</option>
              </Select>
            </label>
          </div>}
        </div>

        {isLoading ? (
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 w-72 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
            ))}
          </div>
        ) : (
          <KanbanBoard tasks={filteredTasks} />
        )}
      </div>
    </>
  );
}
