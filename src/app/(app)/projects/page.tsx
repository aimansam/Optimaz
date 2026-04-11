'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/use-projects';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import Link from 'next/link';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createProject.mutateAsync({ name: name.trim(), color });
    setName('');
    setColor(COLORS[0]);
    setAddOpen(false);
  };

  return (
    <>
      <Header
        title="Projects"
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : projects?.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <FolderOpen className="h-12 w-12" />
            <p>No projects yet</p>
            <Button onClick={() => setAddOpen(true)}>Create your first project</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <div
                key={project.id}
                className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-900"
              >
                <Link href={`/projects/${project.id}`} className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{project.name}</p>
                    {project.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{project.description}</p>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => { if (confirm('Delete this project?')) deleteProject.mutate(project.id); }}
                  className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
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
                />
              ))}
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
