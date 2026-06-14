
import React, { memo, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { AlertTriangle, Archive, CheckCircle2, Edit2, FolderOpen, Layers, ListChecks, Star, Trash2 } from 'lucide-react';

type Project = {
  id: string;
  parent_project_id?: string | null;
  name: string;
  color: string;
  description?: string | null;
  updated_at: string;
  favorite?: boolean;
  archived?: boolean;
  tags?: string[];
};
type Task = {
  id: string;
  project_id: string | null;
  status: string;
  due_date?: string | null;
  updated_at: string;
  subtasks?: { completed: boolean }[];
};

type ProjectCardProps = {
  project: Project;
  allTasks?: Task[];
  rollupProjectIds?: string[];
  subprojectCount?: number;
  updateProject: { mutate: (data: { id: string; color?: string; name?: string; favorite?: boolean; archived?: boolean; tags?: string[] }) => void };
  deleteProject: { mutate: (id: string) => void };
};

const ProjectCard = ({ project, allTasks, rollupProjectIds = [], subprojectCount = 0, updateProject, deleteProject }: ProjectCardProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editColor, setEditColor] = useState(project.color);
  const [editTags, setEditTags] = useState<string[]>(project.tags ?? []);
  const [editTagInput, setEditTagInput] = useState('');
  const allTags: string[] = typeof window !== 'undefined' && (window as unknown as { __ALL_PROJECT_TAGS__?: string[] }).__ALL_PROJECT_TAGS__
    ? (window as unknown as { __ALL_PROJECT_TAGS__?: string[] }).__ALL_PROJECT_TAGS__!
    : [];
  const trackedProjectIds = new Set([project.id, ...rollupProjectIds]);
  const projectTasks = allTasks?.filter((t) => t.project_id && trackedProjectIds.has(t.project_id)) || [];
  const completed = projectTasks.filter((t) => t.status === 'done').length;
  const overdue = projectTasks.filter((t) => t.due_date && t.status !== 'done' && new Date(t.due_date) < new Date()).length;
  const percent = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0;
  const totalSubtasks = projectTasks.reduce((sum, t) => sum + (t.subtasks?.length ?? 0), 0);
  const completedSubtasks = projectTasks.reduce((sum, t) => sum + (t.subtasks?.filter(s => s.completed).length ?? 0), 0);

  return (
    <div
      className="group relative rounded-xl transition-all duration-200"
      tabIndex={0}
      aria-label={`Project card for ${project.name}`}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        padding: '20px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <Link href={`/projects/${project.id}`} className="block focus:outline-none focus:underline">
        <div className="mb-4 flex items-start gap-3 pr-20">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: project.color + '20' }}
          >
            <FolderOpen className="h-5 w-5" style={{ color: project.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-semibold" style={{ color: 'var(--foreground)' }}>{project.name}</p>
              {project.favorite && <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />}
            </div>
            {project.description && (
              <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: 'var(--muted-fg)' }}>{project.description}</p>
            )}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {project.parent_project_id && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ background: 'var(--muted-bg)', color: 'var(--muted-fg)' }}
            >
              <Layers className="h-3 w-3" />
              Subproject
            </span>
          )}
          {!project.parent_project_id && subprojectCount > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ background: 'var(--muted-bg)', color: 'var(--muted-fg)' }}
            >
              <Layers className="h-3 w-3" />
              {subprojectCount} subproject{subprojectCount === 1 ? '' : 's'}
            </span>
          )}
          {project.archived && (
            <span
              className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ background: 'var(--muted-bg)', color: 'var(--muted-fg)' }}
            >
              Archived
            </span>
          )}
          {project.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-[11px]"
              style={{
                background: 'rgb(var(--accent) / 0.08)',
                color: 'var(--muted-fg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

          <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--muted-fg)' }}>Progress</span>
            <span className="text-xs font-semibold" style={{ color: project.color }}>{percent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--muted-bg)' }}>
            {percent > 0 && (
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  background: `linear-gradient(90deg, ${project.color}, ${project.color}bb)`,
                }}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs" style={{ color: 'var(--muted-fg)' }}>
          <span className="flex flex-wrap items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {completed}/{projectTasks.length} tasks
            {totalSubtasks > 0 && (
              <>
                <span className="opacity-30">·</span>
                <ListChecks className="h-3 w-3" />
                {completedSubtasks}/{totalSubtasks} subtasks
              </>
            )}
          </span>
          {overdue > 0 && (
            <span className="flex items-center gap-1 text-red-500">
              <AlertTriangle className="h-3.5 w-3.5" />
              {overdue} overdue
            </span>
          )}
        </div>

        {projectTasks.length > 0 && (
          <div className="mt-2 text-xs" style={{ color: 'var(--muted-fg)' }}>
            Last activity: {new Date(Math.max(...projectTasks.map((t) => new Date(t.updated_at).getTime()))).toLocaleDateString()}
          </div>
        )}

        {percent === 100 && projectTasks.length > 0 && (
          <div
            className="mt-3 rounded-lg px-3 py-1.5 text-center text-xs font-medium"
            style={{
              background: 'rgba(16,185,129,0.1)',
              color: '#10b981',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            Project Complete! 🎉
          </div>
        )}
      </Link>

      <div className="absolute right-3 top-3 z-10 flex gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          aria-label={project.favorite ? `Unfavorite project ${project.name}` : `Favorite project ${project.name}`}
          title={project.favorite ? 'Unfavorite' : 'Favorite'}
          className="rounded-lg p-1.5 transition-all duration-150"
          style={{ color: project.favorite ? '#f59e0b' : 'var(--muted-fg)' }}
          onClick={() => updateProject.mutate({ id: project.id, favorite: !project.favorite })}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; }}
        >
          <Star className={`h-4 w-4 ${project.favorite ? 'fill-yellow-400' : ''}`} />
        </button>
        <button
          aria-label={`Edit project ${project.name}`}
          title="Edit"
          className="rounded-lg p-1.5 transition-all duration-150"
          style={{ color: 'var(--muted-fg)' }}
          onClick={() => {
            setEditName(project.name);
            setEditColor(project.color);
            setEditTags(project.tags ?? []);
            setEditOpen(true);
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgb(var(--accent) / 0.1)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgb(var(--accent))'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-fg)'; }}
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          aria-label={project.archived ? `Unarchive project ${project.name}` : `Archive project ${project.name}`}
          title={project.archived ? 'Unarchive' : 'Archive'}
          className="rounded-lg p-1.5 transition-all duration-150"
          style={{ color: project.archived ? '#10b981' : 'var(--muted-fg)' }}
          onClick={() => updateProject.mutate({ id: project.id, archived: !project.archived })}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted-bg)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; }}
        >
          <Archive className={`h-4 w-4 ${project.archived ? 'rotate-180' : ''}`} />
        </button>
        <button
          onClick={() => setDeleteOpen(true)}
          aria-label={`Delete project ${project.name}`}
          title="Delete"
          className="rounded-lg p-1.5 transition-all duration-150"
          style={{ color: 'var(--muted-fg)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-fg)'; }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <ConfirmationDialog
        open={deleteOpen}
        title="Delete project"
        description={`Delete "${project.name}"? Tasks linked to this project will remain, but this action cannot be undone.`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteProject.mutate(project.id)}
      />
      {/* Edit Dialog */}
      {editOpen && (
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Project">
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              updateProject.mutate({ id: project.id, name: editName, color: editColor, tags: editTags });
              setEditOpen(false);
            }}
          >
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--foreground)' }}>Name *</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Project name" autoFocus />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--foreground)' }}>Color</label>
              <input
                type="color"
                value={editColor}
                onChange={e => setEditColor(e.target.value)}
                className="h-8 w-16 border-none bg-transparent cursor-pointer"
                aria-label="Project color"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--foreground)' }}>Tags</label>
              {/* Tag suggestions (chips) */}
              {allTags.filter(t => !editTags.includes(t) && (!editTagInput.trim() || t.toLowerCase().includes(editTagInput.trim().toLowerCase()))).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {allTags.filter(t => !editTags.includes(t) && (!editTagInput.trim() || t.toLowerCase().includes(editTagInput.trim().toLowerCase()))).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className="px-2 py-0.5 rounded-full text-xs transition-all duration-150"
                      style={{
                        background: 'var(--muted-bg)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--card-border)',
                      }}
                      onClick={() => {
                        setEditTags([...editTags, tag]);
                        setEditTagInput('');
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
              {/* Divider if there are selected tags and suggestions */}
              {editTags.length > 0 && allTags.filter(t => !editTags.includes(t)).length > 0 && (
                <div className="h-px my-2" style={{ background: 'var(--card-border)' }} />
              )}
              {/* Selected tags (chips) */}
              <div className="flex flex-wrap gap-2 mb-2">
                      {editTags.map((tag, i) => (
                        <span
                          key={i}
                          className="flex items-center px-2 py-0.5 rounded-full text-xs"
                          style={{
                            background: 'rgb(var(--accent) / 0.1)',
                            color: 'var(--foreground)',
                            border: '1px solid rgb(var(--accent) / 0.2)',
                          }}
                        >
                          {tag}
                          <button type="button" className="ml-1 text-red-400 hover:text-red-600" onClick={() => setEditTags(editTags.filter((_, idx) => idx !== i))}>&times;</button>
                        </span>
                      ))}
              </div>
              <div className="flex gap-2 w-full">
                <Input
                  value={editTagInput}
                  onChange={e => setEditTagInput(e.target.value)}
                  placeholder="Add tag"
                  onKeyDown={e => {
                    if ((e.key === 'Enter' || e.key === ',') && editTagInput.trim()) {
                      e.preventDefault();
                      if (!editTags.includes(editTagInput.trim())) {
                        setEditTags([...editTags, editTagInput.trim()]);
                      }
                      setEditTagInput('');
                    }
                  }}
                />
                <button
                  type="button"
                  className="px-3 py-1 rounded-xl text-xs font-medium text-white transition-all duration-150"
                  style={{ background: 'rgb(var(--accent))', boxShadow: '0 2px 6px var(--glow)' }}
                  onClick={() => {
                    if (editTagInput.trim() && !editTags.includes(editTagInput.trim())) {
                      setEditTags([...editTags, editTagInput.trim()]);
                      setEditTagInput('');
                    }
                  }}
                >Add</button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={{ background: 'var(--muted-bg)', color: 'var(--foreground)', border: '1px solid var(--card-border)' }}
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-all duration-150"
                style={{ background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.85))', boxShadow: '0 2px 8px var(--glow)' }}
              >
                Save
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}

export const MemoizedProjectCard = memo(ProjectCard);
