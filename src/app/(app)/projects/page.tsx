'use client';

import { useState, useEffect } from 'react';
import { useProjects, useDeleteProject, useUpdateProject } from '@/hooks/use-projects';
import { useTasks } from '@/hooks/use-tasks';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FolderOpen, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MemoizedProjectCard } from '@/components/projects/project-card';
import { ProjectQuestionFlow } from '@/components/projects/project-question-flow';

function ProjectCardSkeleton() {
  return (
    <div className="group relative rounded-xl p-5 animate-pulse" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="h-3 w-40 rounded bg-slate-100 dark:bg-slate-800 mb-2" />
      <div className="flex gap-2 mt-2 flex-wrap">
        <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 w-10 h-4" />
        <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 w-10 h-4" />
      </div>
      <div className="mt-2 h-2 w-28 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden" />
      <div className="flex gap-3 text-xs text-slate-300 dark:text-slate-700 mt-1">
        <span className="w-10 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
        <span className="w-10 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
        <span className="w-10 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
      <div className="text-xs text-slate-300 dark:text-slate-700 mt-1 w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
    </div>
  );
}

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();
  const deleteProject = useDeleteProject();
  const { data: allTasks } = useTasks();
  const updateProject = useUpdateProject();
  const [addOpen, setAddOpen] = useState(false);
  // Collect all unique tags from all projects for suggestions
  const allTags: string[] = Array.from(new Set((projects ?? []).flatMap(p => p.tags ?? [])));
  const [sortBy, setSortBy] = useState<'name' | 'activity' | 'completion' | 'favorite'>('name');
  const [search, setSearch] = useState('');
  // Removed filterTag state: Project type does not have tags

  // Show/hide archived projects toggle
  const [showArchived, setShowArchived] = useState(false);

  let filteredProjects = (projects || []).filter(p => showArchived ? !!p.archived : !p.archived);
  if (search.trim()) {
    filteredProjects = filteredProjects.filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase()));
  }
  filteredProjects = [...filteredProjects].sort((a, b) => {
    const getProjectFamilyIds = (projectId: string) => [
      projectId,
      ...(projects ?? []).filter((project) => project.parent_project_id === projectId && !project.archived).map((project) => project.id),
    ];

    if (sortBy === 'favorite') {
      // Favorites first, then by name
      if (!!b.favorite === !!a.favorite) {
        return a.name.localeCompare(b.name);
      }
      return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'activity') {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    } else if (sortBy === 'completion') {
      const aProjectIds = new Set(getProjectFamilyIds(a.id));
      const bProjectIds = new Set(getProjectFamilyIds(b.id));
      const aTasks = allTasks?.filter((t) => t.project_id && aProjectIds.has(t.project_id)) || [];
      const bTasks = allTasks?.filter((t) => t.project_id && bProjectIds.has(t.project_id)) || [];
      const aCompleted = aTasks.filter((t) => t.status === 'done').length;
      const bCompleted = bTasks.filter((t) => t.status === 'done').length;
      const aPercent = aTasks.length > 0 ? aCompleted / aTasks.length : 0;
      const bPercent = bTasks.length > 0 ? bCompleted / bTasks.length : 0;
      return bPercent - aPercent;
    }
    return 0;
  });
  const parentProjects = search.trim()
    ? filteredProjects
    : filteredProjects.filter(project => !project.parent_project_id);
  const subprojectsByParent = new Map<string, typeof filteredProjects>();
  for (const project of filteredProjects) {
    if (!project.parent_project_id) continue;
    const current = subprojectsByParent.get(project.parent_project_id) ?? [];
    current.push(project);
    subprojectsByParent.set(project.parent_project_id, current);
  }
  const visibleSubprojects = filteredProjects.filter(project => project.parent_project_id);

  const [showFilters, setShowFilters] = useState(false);

  // Inject allTags into window for ProjectCard edit dialog suggestions (for edit dialog autocomplete)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { __ALL_PROJECT_TAGS__?: string[] }).__ALL_PROJECT_TAGS__ = allTags;
    }
  }, [allTags]);
  return (
    <>

      <div className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6" style={{ background: 'var(--background)' }}>
        {/* Toggle for sort/search bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="secondary" onClick={() => setShowFilters(v => !v)}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={e => setShowArchived(e.target.checked)}
                className="accent-blue-500"
              />
              Show archived
            </label>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </div>
          {showFilters && (
          <div className="mb-6 flex flex-wrap gap-3 items-center">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
              Sort by:
              <Select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'name' | 'activity' | 'completion')}
                className="w-auto"
              >
                <option value="favorite">Favorites</option>
                <option value="name">Name</option>
                <option value="activity">Last Activity</option>
                <option value="completion">Completion %</option>
              </Select>
            </label>
            <Input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-48"
              aria-label="Search projects"
            />
          </div>
        )}
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            <p className="font-semibold">Failed to load projects</p>
            <p className="mt-1 opacity-80">{error.message}</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-6 w-6" />}
            title={search.trim() || showArchived ? 'No projects match these filters' : 'No projects yet'}
            description={search.trim() || showArchived ? 'Adjust your filters or create a new project to organize related tasks.' : 'Create a project to group tasks, track progress, and keep related work together.'}
            action={<Button onClick={() => setAddOpen(true)} size="sm"><Plus className="h-4 w-4" />Create Project</Button>}
          />
        ) : (
          <div className="space-y-8">
            {(parentProjects.length > 0 || search.trim()) && (
              <section>
                <h2 className="gradient-text mb-3 text-sm font-semibold uppercase tracking-wider">
                  {search.trim() ? `Projects (${filteredProjects.length})` : `Projects (${parentProjects.length})`}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(search.trim() ? filteredProjects : parentProjects).map((project) => {
                    const subprojects = subprojectsByParent.get(project.id) ?? [];
                    return (
                      <MemoizedProjectCard
                        key={project.id}
                        project={project}
                        allTasks={allTasks ?? []}
                        rollupProjectIds={subprojects.map((subproject) => subproject.id)}
                        subprojectCount={subprojects.length}
                        updateProject={updateProject}
                        deleteProject={deleteProject}
                      />
                    );
                  })}
                </div>
              </section>
            )}
            {!search.trim() && visibleSubprojects.length > 0 && (
              <section>
                <h2 className="gradient-text mb-3 text-sm font-semibold uppercase tracking-wider">
                  Subprojects ({visibleSubprojects.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleSubprojects.map((project) => (
                    <MemoizedProjectCard
                      key={project.id}
                      project={project}
                      allTasks={allTasks ?? []}
                      updateProject={updateProject}
                      deleteProject={deleteProject}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Project" className="min-h-0 sm:max-w-lg">
        <ProjectQuestionFlow onClose={() => setAddOpen(false)} />
      </Dialog>
    </>
  );
}
