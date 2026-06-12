'use client';

import { useMemo, useState } from 'react';
import { Bookmark, ChevronDown, Filter, RotateCcw, Search, Trash2 } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useGoals } from '@/hooks/use-goals';
import { useProjects } from '@/hooks/use-projects';
import { useDeleteSavedView, useSavedViews, useUpsertSavedView } from '@/hooks/use-saved-views';
import { useTasksByStatus } from '@/hooks/use-tasks';
import type { Priority } from '@/lib/types';

type DueFilter = 'all' | 'overdue' | 'today' | 'upcoming' | 'no_date';
type DoneFilter = 'hide' | 'show' | 'done';
type ProjectFilter = '' | `project:${string}` | `group:${string}`;
type QuickView = 'active' | 'urgent' | 'today' | 'completed';
type KanbanFilterState = {
  query: string;
  projectFilter: ProjectFilter;
  goalId: string;
  priority: Priority | '';
  dueFilter: DueFilter;
  doneFilter: DoneFilter;
};
type SavedKanbanView = { id: string; name: string; filters: KanbanFilterState };

const KANBAN_FILTER_VISIBILITY_KEY = 'taskflow:kanban:filters-open';
const KANBAN_TASK_QUERY_LIMIT = 300;

function getDateKey(value: Date) {
  return value.toISOString().split('T')[0];
}

function normalizeDoneFilter(value: string | undefined): DoneFilter {
  if (value === 'hide' || value === 'show' || value === 'done') return value;
  if (value === 'archived') return 'done';
  return 'show';
}

export default function KanbanPage() {
  const { data: projects } = useProjects();
  const { data: goals } = useGoals();
  const { data: savedViews = [] } = useSavedViews<KanbanFilterState>('kanban');
  const upsertSavedView = useUpsertSavedView<KanbanFilterState>();
  const deleteSavedViewMutation = useDeleteSavedView();
  const [query, setQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>('');
  const [goalId, setGoalId] = useState('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [dueFilter, setDueFilter] = useState<DueFilter>('all');
  const [doneFilter, setDoneFilter] = useState<DoneFilter>('show');
  const [savedViewName, setSavedViewName] = useState('');
  const [showFilters, setShowFilters] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(KANBAN_FILTER_VISIBILITY_KEY) === 'true';
  });
  const { data: tasks, isLoading } = useTasksByStatus(KANBAN_TASK_QUERY_LIMIT, true);

  function toggleFilters() {
    setShowFilters(current => {
      const next = !current;
      window.localStorage.setItem(KANBAN_FILTER_VISIBILITY_KEY, String(next));
      return next;
    });
  }

  function applyQuickView(view: QuickView) {
    if (activeQuickView === view) {
      resetFilters();
      return;
    }

    setQuery('');
    setProjectFilter('');
    setGoalId('');
    setPriority(view === 'urgent' ? 'urgent' : '');
    setDueFilter(view === 'today' ? 'today' : 'all');
    setDoneFilter(view === 'completed' ? 'done' : 'hide');
  }

  function getCurrentFilterState(): KanbanFilterState {
    return { query, projectFilter, goalId, priority, dueFilter, doneFilter };
  }

  function applySavedView(view: SavedKanbanView) {
    setQuery(view.filters.query ?? '');
    setProjectFilter(view.filters.projectFilter ?? '');
    setGoalId(view.filters.goalId ?? '');
    setPriority(view.filters.priority ?? '');
    setDueFilter(view.filters.dueFilter ?? 'all');
    setDoneFilter(normalizeDoneFilter(view.filters.doneFilter));
  }

  function saveCurrentView() {
    const name = savedViewName.trim();
    if (!name) return;
    upsertSavedView.mutate({ view_type: 'kanban', name, filters: getCurrentFilterState() });
    setSavedViewName('');
  }

  function deleteSavedView(id: string) {
    deleteSavedViewMutation.mutate({ id, view_type: 'kanban' });
  }

  const projectOptions = useMemo(() => {
    const activeProjects = (projects ?? []).filter(project => !project.archived);
    const topLevelProjects = activeProjects.filter(project => !project.parent_project_id);
    const subprojectsByParent = new Map<string, typeof activeProjects>();

    for (const project of activeProjects) {
      if (!project.parent_project_id) continue;
      const current = subprojectsByParent.get(project.parent_project_id) ?? [];
      current.push(project);
      subprojectsByParent.set(project.parent_project_id, current);
    }

    return topLevelProjects.map(project => ({
      project,
      subprojects: subprojectsByParent.get(project.id) ?? [],
    }));
  }, [projects]);

  const selectedProjectIds = useMemo(() => {
    if (!projectFilter) return null;
    const [mode, id] = projectFilter.split(':');
    if (!id) return null;
    if (mode === 'project') return new Set([id]);

    const childIds = (projects ?? [])
      .filter(project => project.parent_project_id === id && !project.archived)
      .map(project => project.id);
    return new Set([id, ...childIds]);
  }, [projectFilter, projects]);

  const activeQuickView = useMemo<QuickView | null>(() => {
    if (query.trim() || projectFilter || goalId) return null;
    if (doneFilter === 'done' && !priority && dueFilter === 'all') return 'completed';
    if (doneFilter !== 'hide') return null;
    if (priority === 'urgent' && dueFilter === 'all') return 'urgent';
    if (!priority && dueFilter === 'today') return 'today';
    if (!priority && dueFilter === 'all') return 'active';
    return null;
  }, [doneFilter, dueFilter, goalId, priority, projectFilter, query]);

  const activeGoals = useMemo(() => (goals ?? []).filter(goal => {
    const total = goal.tasks?.length ?? 0;
    const completed = goal.tasks?.filter(task => task.status === 'done').length ?? 0;
    return total === 0 || completed < total;
  }), [goals]);

  const filteredTasks = useMemo(() => {
    const today = getDateKey(new Date());
    const normalizedQuery = query.trim().toLowerCase();

    return (tasks ?? []).filter(task => {
      const dueDate = task.due_date;
      const matchesQuery = !normalizedQuery
        || task.title.toLowerCase().includes(normalizedQuery)
        || task.notes?.toLowerCase().includes(normalizedQuery)
        || task.project?.name.toLowerCase().includes(normalizedQuery)
        || task.goal?.title.toLowerCase().includes(normalizedQuery);
      const matchesProject = !selectedProjectIds || (task.project_id !== null && selectedProjectIds.has(task.project_id));
      const matchesGoal = !goalId || task.goal_id === goalId;
      const matchesPriority = !priority || task.priority === priority;
      const matchesDone = (
        doneFilter === 'hide' ? task.status !== 'done'
        : doneFilter === 'show' ? true
        : task.status === 'done'
      );
      const matchesDue = (
        dueFilter === 'all'
        || (dueFilter === 'no_date' && !dueDate)
        || (dueFilter === 'overdue' && dueDate !== null && dueDate < today && task.status !== 'done')
        || (dueFilter === 'today' && dueDate === today)
        || (dueFilter === 'upcoming' && dueDate !== null && dueDate > today)
      );

      return matchesQuery && matchesProject && matchesGoal && matchesPriority && matchesDone && matchesDue;
    });
  }, [doneFilter, dueFilter, goalId, priority, query, selectedProjectIds, tasks]);

  const trimmedQuery = query.trim();
  const taskCounts = useMemo(() => {
    const allTasks = tasks ?? [];
    return {
      active: allTasks.filter(task => task.status !== 'done').length,
      completed: allTasks.filter(task => task.status === 'done').length,
    };
  }, [tasks]);
  const hasFilters = Boolean(trimmedQuery || projectFilter || goalId || priority || dueFilter !== 'all' || doneFilter !== 'show');
  // 'hide' (hide done tasks) is treated as a normal default view state, not a user-set filter.
  // Only count doneFilter if it's 'done' (completed-only mode).
  const activeFilterCount = [trimmedQuery, projectFilter, goalId, priority, dueFilter !== 'all' ? dueFilter : '', doneFilter === 'done' ? doneFilter : ''].filter(Boolean).length;

  function resetFilters() {
    setQuery('');
    setProjectFilter('');
    setGoalId('');
    setPriority('');
    setDueFilter('all');
    setDoneFilter('show');
  }

  return (
    <>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="shrink-0 px-2 pt-2 pb-0 sm:px-4 sm:pt-4 md:px-6 md:pt-6">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
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
            <Button type="button" variant={activeQuickView === 'active' ? 'secondary' : 'ghost'} size="sm" onClick={() => applyQuickView('active')} aria-pressed={activeQuickView === 'active'}>Active <span className="tabular-nums">{taskCounts.active}</span></Button>
            <Button type="button" variant={activeQuickView === 'urgent' ? 'secondary' : 'ghost'} size="sm" onClick={() => applyQuickView('urgent')} aria-pressed={activeQuickView === 'urgent'}>Urgent</Button>
            <Button type="button" variant={activeQuickView === 'today' ? 'secondary' : 'ghost'} size="sm" onClick={() => applyQuickView('today')} aria-pressed={activeQuickView === 'today'}>Due today</Button>
            <Button type="button" variant={activeQuickView === 'completed' ? 'secondary' : 'ghost'} size="sm" onClick={() => applyQuickView('completed')} aria-pressed={activeQuickView === 'completed'}>Completed <span className="tabular-nums">{taskCounts.completed}</span></Button>
          </div>

          {showFilters && <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.4fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_minmax(130px,0.7fr)_minmax(140px,0.7fr)_minmax(140px,0.7fr)]">
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
              <span className="sr-only">Filter by goal</span>
              <Select value={goalId} onChange={event => setGoalId(event.target.value)}>
                <option value="">All goals</option>
                {activeGoals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </Select>
            </label>

            <label>
              <span className="sr-only">Filter by project or subproject</span>
              <Select value={projectFilter} onChange={event => setProjectFilter(event.target.value as ProjectFilter)}>
                <option value="">All projects</option>
                {projectOptions.map(({ project, subprojects }) => (
                  <optgroup key={project.id} label={project.name}>
                    {subprojects.length > 0 ? (
                      <>
                        <option value={`group:${project.id}`}>{project.name} + subprojects</option>
                        <option value={`project:${project.id}`}>{project.name} only</option>
                      </>
                    ) : (
                      <option value={`project:${project.id}`}>{project.name}</option>
                    )}
                    {subprojects.map(subproject => (
                      <option key={subproject.id} value={`project:${subproject.id}`}>Sub: {subproject.name}</option>
                    ))}
                  </optgroup>
                ))}
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
                <option value="hide">Hide done</option>
                <option value="show">Show done</option>
                <option value="done">Completed only</option>
              </Select>
            </label>
          </div>}

          {showFilters && (
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_auto]">
                <label>
                  <span className="sr-only">Saved Kanban views</span>
                  <Select
                    value=""
                    onChange={event => {
                      const view = savedViews.find(item => item.id === event.target.value);
                      if (view) applySavedView(view);
                    }}
                  >
                    <option value="">Saved views</option>
                    {savedViews.map(view => <option key={view.id} value={view.id}>{view.name}</option>)}
                  </Select>
                </label>
                <label>
                  <span className="sr-only">Saved view name</span>
                  <Input
                    value={savedViewName}
                    onChange={event => setSavedViewName(event.target.value)}
                    placeholder="Name this view"
                  />
                </label>
                <Button type="button" variant="secondary" onClick={saveCurrentView} disabled={!savedViewName.trim() || upsertSavedView.isPending}>
                  <Bookmark className="h-3.5 w-3.5" />
                  {upsertSavedView.isPending ? 'Saving...' : 'Save view'}
                </Button>
              </div>
              {savedViews.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {savedViews.map(view => (
                    <span key={view.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <button type="button" onClick={() => applySavedView(view)} className="hover:text-slate-900 dark:hover:text-white">
                        {view.name}
                      </button>
                      <button type="button" onClick={() => deleteSavedView(view.id)} aria-label={`Delete saved view ${view.name}`} disabled={deleteSavedViewMutation.isPending} className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-red-500 disabled:opacity-50 dark:hover:bg-slate-700">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden px-2 pb-2 pt-3 sm:px-4 sm:pb-4 sm:pt-4 md:px-6 md:pb-6">
          {isLoading ? (
            <div className="flex h-full gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-full min-h-[200px] w-72 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
              ))}
            </div>
          ) : (
            <KanbanBoard tasks={filteredTasks} />
          )}
        </div>
      </div>
    </>
  );
}
