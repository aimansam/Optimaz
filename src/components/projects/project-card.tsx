
import React, { memo, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { AlertTriangle, Archive, CheckCircle2, Edit2, FolderOpen, Layers, Star, Trash2 } from 'lucide-react';

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

  return (
    <div
      className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
      tabIndex={0}
      aria-label={`Project card for ${project.name}`}
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
              <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{project.name}</p>
              {project.favorite && <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />}
            </div>
            {project.description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{project.description}</p>
            )}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {project.parent_project_id && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Layers className="h-3 w-3" />
              Subproject
            </span>
          )}
          {!project.parent_project_id && subprojectCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Layers className="h-3 w-3" />
              {subprojectCount} subproject{subprojectCount === 1 ? '' : 's'}
            </span>
          )}
          {project.archived && (
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Archived
            </span>
          )}
          {project.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Progress</span>
            <span className="text-xs font-semibold" style={{ color: project.color }}>{percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            {percent > 0 && (
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: project.color }}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {completed}/{projectTasks.length} tasks
          </span>
          {overdue > 0 && (
            <span className="flex items-center gap-1 text-red-500">
              <AlertTriangle className="h-3.5 w-3.5" />
              {overdue} overdue
            </span>
          )}
        </div>

        {projectTasks.length > 0 && (
          <div className="mt-2 text-xs text-slate-400">
            Last activity: {new Date(Math.max(...projectTasks.map((t) => new Date(t.updated_at).getTime()))).toLocaleDateString()}
          </div>
        )}

        {percent === 100 && projectTasks.length > 0 && (
          <div className="mt-3 rounded-lg bg-green-50 px-3 py-1.5 text-center text-xs font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
            Project Complete!
          </div>
        )}
      </Link>

      <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          aria-label={project.favorite ? `Unfavorite project ${project.name}` : `Favorite project ${project.name}`}
          title={project.favorite ? 'Unfavorite' : 'Favorite'}
          className="rounded p-1 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:hover:bg-yellow-900/20"
          onClick={() => updateProject.mutate({ id: project.id, favorite: !project.favorite })}
        >
          <Star className={`h-4 w-4 ${project.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-yellow-400'}`} />
        </button>
        <button
          aria-label={`Edit project ${project.name}`}
          title="Edit"
          className="rounded p-1 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:hover:bg-blue-900/20"
          onClick={() => {
            setEditName(project.name);
            setEditColor(project.color);
            setEditTags(project.tags ?? []);
            setEditOpen(true);
          }}
        >
          <Edit2 className="h-4 w-4 text-blue-400" />
        </button>
        <button
          aria-label={project.archived ? `Unarchive project ${project.name}` : `Archive project ${project.name}`}
          title={project.archived ? 'Unarchive' : 'Archive'}
          className="rounded p-1 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:hover:bg-slate-800/50"
          onClick={() => updateProject.mutate({ id: project.id, archived: !project.archived })}
        >
          <Archive className={`h-4 w-4 ${project.archived ? 'rotate-180 text-green-500' : 'text-slate-400'}`} />
        </button>
        <button
          onClick={() => setDeleteOpen(true)}
          aria-label={`Delete project ${project.name}`}
          title="Delete"
          className="rounded p-1 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4 text-red-400" />
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
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name *</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Project name" autoFocus />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Color</label>
              <input
                type="color"
                value={editColor}
                onChange={e => setEditColor(e.target.value)}
                className="h-8 w-16 border-none bg-transparent cursor-pointer"
                aria-label="Project color"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
              {/* Tag suggestions (chips) */}
              {allTags.filter(t => !editTags.includes(t) && (!editTagInput.trim() || t.toLowerCase().includes(editTagInput.trim().toLowerCase()))).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {allTags.filter(t => !editTags.includes(t) && (!editTagInput.trim() || t.toLowerCase().includes(editTagInput.trim().toLowerCase()))).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 border border-transparent hover:border-blue-400"
                      style={{ transition: 'border 0.2s' }}
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
                <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
              )}
              {/* Selected tags (chips) */}
              <div className="flex flex-wrap gap-2 mb-2">
                      {editTags.map((tag, i) => (
                        <span key={i} className="flex items-center px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600">
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
                  className="px-2 py-1 rounded bg-slate-500 text-white text-xs hover:bg-slate-600"
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
              <button type="button" className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800" onClick={() => setEditOpen(false)}>Cancel</button>
              <button type="submit" className="px-3 py-1 rounded bg-slate-500 text-white hover:bg-slate-600">Save</button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}

export const MemoizedProjectCard = memo(ProjectCard);
