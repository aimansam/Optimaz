'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TaskList } from '@/components/tasks/task-list';
import { TaskQuestionFlow } from '@/components/tasks/task-question-flow';
import { useTasks } from '@/hooks/use-tasks';
import { useDeleteProject, useProjects, useUpdateProject } from '@/hooks/use-projects';
import { MemoizedProjectCard } from '@/components/projects/project-card';
import { ProjectQuestionFlow } from '@/components/projects/project-question-flow';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Archive, CheckCircle2, ChevronRight, Edit2, FolderOpen, Plus, Star, Trash2 } from 'lucide-react';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: tasks, isLoading, error: tasksError } = useTasks(id);
  const { data: allTasks } = useTasks();
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const project = projects?.find((p) => p.id === id);
  const parentProject = project?.parent_project_id ? projects?.find((item) => item.id === project.parent_project_id) : undefined;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#6366f1');
  const [editTags, setEditTags] = useState('');
  const [editParentProjectId, setEditParentProjectId] = useState('');
  const [addSubprojectOpen, setAddSubprojectOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  const subprojects = projects?.filter((item) => item.parent_project_id === id && !item.archived) ?? [];
  const projectFamilyIds = [id, ...subprojects.map((item) => item.id)];
  const canCreateSubprojects = !project?.parent_project_id;
  const parentOptions = projects?.filter((item) => !item.archived && !item.parent_project_id && item.id !== id) ?? [];
  const rollupTasks = allTasks?.filter((task) => task.project_id && projectFamilyIds.includes(task.project_id)) ?? [];

  const total = rollupTasks.length;
  const completed = rollupTasks.filter((task) => task.status === 'done').length;
  const inProgress = rollupTasks.filter((task) => task.status === 'in_progress').length;
  const todo = rollupTasks.filter((task) => task.status === 'todo').length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  function openEdit() {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description ?? '');
    setEditColor(project.color);
    setEditTags((project.tags ?? []).join(', '));
    setEditParentProjectId(project.parent_project_id ?? '');
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
      parent_project_id: subprojects.length > 0 ? null : editParentProjectId || null,
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
        {projectsError ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            <p className="font-semibold">Failed to load project</p>
            <p className="mt-1 opacity-80">{projectsError.message}</p>
          </div>
        ) : project ? (
          <div
            className="mb-6 rounded-xl border p-5"
            style={{ borderColor: project.color + '40', backgroundColor: project.color + '08' }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex min-w-0 flex-1 gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${project.color}20` }}
                >
                  <FolderOpen className="h-6 w-6" style={{ color: project.color }} />
                </div>
                <div className="min-w-0">
                  {parentProject && (
                    <nav aria-label="Project breadcrumb" className="mb-1 flex min-w-0 items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <Link href="/projects" className="shrink-0 hover:text-slate-700 dark:hover:text-slate-200">
                        Projects
                      </Link>
                      <ChevronRight className="h-3 w-3 shrink-0" />
                      <Link href={`/projects/${parentProject.id}`} className="truncate hover:text-slate-700 dark:hover:text-slate-200">
                        {parentProject.name}
                      </Link>
                    </nav>
                  )}
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
                  {subprojects.length > 0 && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Includes this project and {subprojects.length} direct subproject{subprojects.length === 1 ? '' : 's'}.
                    </p>
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
              <div className="shrink-0 text-left md:text-right">
                <p className="text-3xl font-bold" style={{ color: project.color }}>{percent}%</p>
                <p className="flex items-center gap-1 text-xs text-slate-400 md:justify-end">
                  <CheckCircle2 className="h-3 w-3" />
                  {completed}/{total} tasks
                </p>
                <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="gap-1"
                    onClick={() => updateProject.mutate({ id: project.id, favorite: !project.favorite })}
                  >
                    <Star className="h-3.5 w-3.5" />
                    {project.favorite ? 'Unfavorite' : 'Favorite'}
                  </Button>
                  <Button type="button" size="sm" variant="secondary" className="gap-1" onClick={openEdit}>
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="gap-1"
                    onClick={() => updateProject.mutate({ id: project.id, archived: !project.archived })}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    {project.archived ? 'Unarchive' : 'Archive'}
                  </Button>
                  <Button type="button" size="sm" variant="danger" className="gap-1" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${percent}%`, backgroundColor: project.color }} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-center sm:grid-cols-3">
              <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/60">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{todo}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">To Do</p>
              </div>
              <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/60">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{inProgress}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">In Progress</p>
              </div>
              <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/60">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{completed}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Done</p>
              </div>
            </div>
          </div>
        ) : projects && !projectsLoading ? (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Project not found.
          </div>
        ) : (
          <div className="mb-6 h-36 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        )}

        {project && canCreateSubprojects && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subprojects</h3>
              <Button type="button" size="sm" variant="secondary" onClick={() => setAddSubprojectOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add subproject
              </Button>
            </div>
            {subprojects.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subprojects.map((subproject) => (
                  <MemoizedProjectCard
                    key={subproject.id}
                    project={subproject}
                    allTasks={allTasks ?? []}
                    updateProject={updateProject}
                    deleteProject={deleteProject}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                Break this project into smaller parts when it starts to feel broad.
              </div>
            )}
          </div>
        )}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Project Tasks</h3>
          <Button type="button" size="sm" onClick={() => setAddTaskOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : tasksError ? (
          <p className="text-sm text-red-500">{tasksError.message}</p>
        ) : (
          <TaskList
            tasks={tasks ?? []}
            emptyMessage="No tasks in this project yet"
            defaultProjectId={id}
            showAddButton={false}
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
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Parent project</label>
                <Select
                  value={subprojects.length > 0 ? '' : editParentProjectId}
                  onChange={(event) => setEditParentProjectId(event.target.value)}
                  disabled={subprojects.length > 0}
                >
                  <option value="">Top-level project</option>
                  {parentOptions.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
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
          <Dialog open={addSubprojectOpen} onClose={() => setAddSubprojectOpen(false)} title="Add Subproject" className="min-h-0 sm:max-w-lg">
            <ProjectQuestionFlow defaultParentProjectId={project.id} onClose={() => setAddSubprojectOpen(false)} />
          </Dialog>
          <Dialog open={addTaskOpen} onClose={() => setAddTaskOpen(false)} title="Add Task" className="min-h-0 sm:max-w-lg">
            <TaskQuestionFlow defaultProjectId={id} onClose={() => setAddTaskOpen(false)} />
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
