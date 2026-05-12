'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TaskList } from '@/components/tasks/task-list';
import { useTasks } from '@/hooks/use-tasks';
import { useDeleteProject, useProjects, useUpdateProject } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Archive, Edit2, FolderOpen, Star, Trash2 } from 'lucide-react';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: tasks, isLoading } = useTasks(id);
  const { data: projects } = useProjects();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const project = projects?.find((p) => p.id === id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#6366f1');
  const [editTags, setEditTags] = useState('');

  const total = tasks?.length ?? 0;
  const completed = tasks?.filter((task) => task.status === 'done').length ?? 0;
  const active = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  function openEdit() {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description ?? '');
    setEditColor(project.color);
    setEditTags((project.tags ?? []).join(', '));
    setEditOpen(true);
  }

  async function saveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!project || !editName.trim()) return;
    await updateProject.mutateAsync({
      id: project.id,
      name: editName.trim(),
      description: editDescription.trim() || null,
      color: editColor,
      tags: editTags.split(',').map((tag) => tag.trim()).filter(Boolean),
    });
    setEditOpen(false);
  }

  function handleDelete() {
    deleteProject.mutate(project!.id, {
      onSuccess: () => router.push('/projects'),
    });
  }

  return (
    <>

      <div className="flex-1 overflow-y-auto p-6">
        {project ? (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${project.color}20` }}
                >
                  <FolderOpen className="h-6 w-6" style={{ color: project.color }} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-xl font-bold text-slate-900 dark:text-slate-100">{project.name}</h2>
                    {project.favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                    {project.archived && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        Archived
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
                  )}
                  {(project.tags?.length ?? 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.tags?.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => updateProject.mutate({ id: project.id, favorite: !project.favorite })}
                >
                  <Star className="h-3.5 w-3.5" />
                  {project.favorite ? 'Unfavorite' : 'Favorite'}
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={openEdit}>
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => updateProject.mutate({ id: project.id, archived: !project.archived })}
                >
                  <Archive className="h-3.5 w-3.5" />
                  {project.archived ? 'Unarchive' : 'Archive'}
                </Button>
                <Button type="button" size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{total}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{active}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{percent}%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Complete</p>
              </div>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-2 rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: project.color }} />
            </div>
          </div>
        ) : projects ? (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Project not found.
          </div>
        ) : (
          <div className="mb-6 h-36 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        )}

        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Project Tasks</h3>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <TaskList
            tasks={tasks ?? []}
            emptyMessage="No tasks in this project yet"
            defaultProjectId={id}
          />
        )}
      </div>

      {project && (
        <>
          <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Project">
            <form onSubmit={saveProject} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name *</label>
                <Input value={editName} onChange={(event) => setEditName(event.target.value)} autoFocus />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <Textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={3} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
                <Input value={editTags} onChange={(event) => setEditTags(event.target.value)} placeholder="design, launch, admin" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Color</label>
                <Input type="color" value={editColor} onChange={(event) => setEditColor(event.target.value)} className="h-10 w-20 p-1" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!editName.trim() || updateProject.isPending}>
                  {updateProject.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Dialog>
          <ConfirmationDialog
            open={deleteOpen}
            title="Delete project"
            description={`Delete "${project.name}"? Tasks linked to this project will remain, but this action cannot be undone.`}
            pending={deleteProject.isPending}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDelete}
          />
        </>
      )}
    </>
  );
}
