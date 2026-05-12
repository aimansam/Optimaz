'use client';

import { useState, useEffect } from 'react';
import { useProjects, useCreateProject, useDeleteProject, useUpdateProject } from '@/hooks/use-projects';
import { useTasks } from '@/hooks/use-tasks';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MemoizedProjectCard } from '@/components/projects/project-card';


const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'];

function ProjectCardSkeleton() {
  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 animate-pulse">
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
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const { data: allTasks } = useTasks();
  const updateProject = useUpdateProject();
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  // Collect all unique tags from all projects for suggestions
  const allTags: string[] = Array.from(new Set((projects ?? []).flatMap(p => p.tags ?? [])));
  const [sortBy, setSortBy] = useState<'name' | 'activity' | 'completion' | 'favorite'>('name');
  const [search, setSearch] = useState('');
  // Removed filterTag state: Project type does not have tags

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createProject.mutateAsync({ name: name.trim(), color, tags });
    setName('');
    setColor(COLORS[0]);
    setTags([]);
    setTagInput('');
    setAddOpen(false);
  };


  // Show/hide archived projects toggle
  const [showArchived, setShowArchived] = useState(false);

  let filteredProjects = (projects || []).filter(p => showArchived ? !!p.archived : !p.archived);
  if (search.trim()) {
    filteredProjects = filteredProjects.filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase()));
  }
  filteredProjects = [...filteredProjects].sort((a, b) => {
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
      const aTasks = allTasks?.filter((t) => t.project_id === a.id) || [];
      const bTasks = allTasks?.filter((t) => t.project_id === b.id) || [];
      const aCompleted = aTasks.filter((t) => t.status === 'done').length;
      const bCompleted = bTasks.filter((t) => t.status === 'done').length;
      const aPercent = aTasks.length > 0 ? aCompleted / aTasks.length : 0;
      const bPercent = bTasks.length > 0 ? bCompleted / bTasks.length : 0;
      return bPercent - aPercent;
    }
    return 0;
  });

  const [showFilters, setShowFilters] = useState(false);

  // Inject allTags into window for ProjectCard edit dialog suggestions (for edit dialog autocomplete)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { __ALL_PROJECT_TAGS__?: string[] }).__ALL_PROJECT_TAGS__ = allTags;
    }
  }, [allTags]);
  return (
    <>

      <div className="flex-1 overflow-y-auto p-6">
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
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-sm">
              Sort by:
              <select
                className="border rounded px-2 py-1 text-sm bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'name' | 'activity' | 'completion')}
              >
                <option value="favorite">Favorites</option>
                <option value="name">Name</option>
                <option value="activity">Last Activity</option>
                <option value="completion">Completion %</option>
              </select>
            </label>
            <input
              type="text"
              className="border rounded px-2 py-1 text-sm"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ minWidth: 180 }}
              aria-label="Search projects"
            />
          </div>
        )}
        {error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-red-400">
            <svg width="96" height="96" fill="none" viewBox="0 0 96 96" aria-hidden="true">
              <circle cx="48" cy="48" r="44" fill="#fee2e2" />
              <path d="M48 32v24" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
              <circle cx="48" cy="66" r="3" fill="#ef4444" />
            </svg>
            <p className="text-lg font-semibold">Failed to load projects</p>
            <p className="text-sm">{error.message || 'An unexpected error occurred. Please try again.'}</p>
            <Button size="sm" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <svg width="96" height="96" fill="none" viewBox="0 0 96 96" aria-hidden="true">
              <rect x="8" y="24" width="80" height="56" rx="8" fill="#f1f5f9" />
              <rect x="24" y="40" width="48" height="8" rx="4" fill="#cbd5e1" />
              <rect x="24" y="56" width="32" height="8" rx="4" fill="#cbd5e1" />
              <rect x="24" y="72" width="16" height="8" rx="4" fill="#cbd5e1" />
              <rect x="56" y="72" width="16" height="8" rx="4" fill="#e0e7ef" />
            </svg>
            <p className="text-lg font-semibold">No projects found</p>
            <p className="text-sm text-slate-400">Get started by creating your first project.</p>
            <Button onClick={() => setAddOpen(true)} size="sm">+ Create Project</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <MemoizedProjectCard
                key={project.id}
                project={project}
                allTasks={allTasks ?? []}
                updateProject={updateProject}
                deleteProject={deleteProject}
              />
            ))}
          </div>
        )}
      </div>
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" autoFocus />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? 'white' : 'transparent',
                    boxShadow: color === c ? `0 0 0 3px ${c}` : 'none',
                  }}
                  aria-label={`Select color ${c}`}
                >
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
            {/* Tag suggestions (chips) */}
            {allTags.filter(t => !tags.includes(t) && (!tagInput.trim() || t.toLowerCase().includes(tagInput.trim().toLowerCase()))).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {allTags.filter(t => !tags.includes(t) && (!tagInput.trim() || t.toLowerCase().includes(tagInput.trim().toLowerCase()))).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 border border-transparent hover:border-blue-400"
                    style={{ transition: 'border 0.2s' }}
                    onClick={() => {
                      setTags([...tags, tag]);
                      setTagInput('');
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            {/* Divider if there are selected tags and suggestions */}
            {tags.length > 0 && allTags.filter(t => !tags.includes(t)).length > 0 && (
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
            )}
            {/* Selected tags (chips) */}
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, i) => (
                <span key={i} className="flex items-center px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-xs text-blue-700 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                  {tag}
                  <button type="button" className="ml-1 text-red-400 hover:text-red-600" onClick={() => setTags(tags.filter((_, idx) => idx !== i))}>&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 w-full">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Add tag"
                onKeyDown={e => {
                  if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                    e.preventDefault();
                    if (!tags.includes(tagInput.trim())) {
                      setTags([...tags, tagInput.trim()]);
                    }
                    setTagInput('');
                  }
                }}
              />
              <Button type="button" size="sm" className="bg-blue-500 text-white hover:bg-blue-600" onClick={() => {
                if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                  setTags([...tags, tagInput.trim()]);
                  setTagInput('');
                }
              }}>Add</Button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || createProject.isPending}>
              {createProject.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
