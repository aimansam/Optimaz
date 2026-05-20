
import React, { memo, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Star, Edit2, Archive, Trash2 } from 'lucide-react';

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
  linkedGoalCount?: number;
  subprojectCount?: number;
  updateProject: { mutate: (data: { id: string; color?: string; name?: string; favorite?: boolean; archived?: boolean; tags?: string[] }) => void };
  deleteProject: { mutate: (id: string) => void };
};

const ProjectCard = ({ project, allTasks, rollupProjectIds = [], linkedGoalCount = 0, subprojectCount = 0, updateProject, deleteProject }: ProjectCardProps) => {
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
      className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500"
      tabIndex={0}
      aria-label={`Project card for ${project.name}`}
    >
      <div className="flex items-center gap-3">
        <span
          className="h-4 w-4 rounded-full shrink-0"
          style={{ backgroundColor: project.color }}
        />
        <Link href={`/projects/${project.id}`} className="flex-1 min-w-0 focus:outline-none focus:underline">
          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{project.name}</p>
        </Link>
      </div>
      {project.description && (
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{project.description}</p>
      )}
      {project.parent_project_id && (
        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Subproject
        </span>
      )}
      {!project.parent_project_id && subprojectCount > 0 && (
        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Includes {subprojectCount} subproject{subprojectCount === 1 ? '' : 's'}
        </span>
      )}
      {project.tags && project.tags.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {project.tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-slate-200 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              {tag}
            </span>
          ))}
        </div>
      )}
      {projectTasks.length > 0 && (
        <div className="text-xs text-slate-400 mt-1">
          Last activity: {new Date(Math.max(...projectTasks.map((t) => new Date(t.updated_at).getTime()))).toLocaleDateString()}
        </div>
      )}
      <div className="mt-2 h-2 w-28 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
        <span>Total: {projectTasks.length}</span>
        <span>Completed: {completed}</span>
        <span>Overdue: {overdue}</span>
      </div>
      {linkedGoalCount > 0 && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Goals: {linkedGoalCount}</div>
      )}
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{percent}% complete</div>
      <div className="absolute right-4 top-4 z-10 flex gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        {/* Favorite button */}
        <button
          aria-label={project.favorite ? `Unfavorite project ${project.name}` : `Favorite project ${project.name}`}
          title={project.favorite ? "Unfavorite" : "Favorite"}
          className={`rounded p-1 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 focus:ring-2 focus:ring-yellow-400 focus:outline-none ${project.favorite ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400' : ''}`}
          onClick={() => updateProject.mutate({ id: project.id, favorite: !project.favorite })}
        >
          <Star className={`h-5 w-5 ${project.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400'}`} />
        </button>
        {/* Edit button opens dialog */}
        <button
          aria-label={`Edit project ${project.name}`}
          title="Edit"
          className="rounded p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          onClick={() => {
            setEditName(project.name);
            setEditColor(project.color);
            setEditTags(project.tags ?? []);
            setEditOpen(true);
          }}
        >
          <Edit2 className="h-5 w-5 text-blue-400" />
        </button>
        {/* Archive/Unarchive button */}
        {project.archived ? (
          <button
            aria-label={`Unarchive project ${project.name}`}
            title="Unarchive"
            className="rounded p-1 bg-green-50 dark:bg-green-900/20 border border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
            onClick={() => updateProject.mutate({ id: project.id, archived: false })}
          >
            <Archive className="h-5 w-5 text-green-500 rotate-180" />
          </button>
        ) : (
          <button
            aria-label={`Archive project ${project.name}`}
            title="Archive"
            className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800/50 focus:ring-2 focus:ring-slate-400 focus:outline-none"
            onClick={() => updateProject.mutate({ id: project.id, archived: true })}
          >
            <Archive className="h-5 w-5 text-slate-400" />
          </button>
        )}
        {/* Delete button */}
        <button
          onClick={() => setDeleteOpen(true)}
          aria-label={`Delete project ${project.name}`}
          title="Delete"
          className="rounded p-1 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-2 focus:ring-red-400 focus:outline-none"
        >
          <Trash2 className="h-5 w-5 text-red-400" />
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
