'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUpDown, CheckCircle2, GripVertical, Plus } from 'lucide-react';
import { TaskCard } from './task-card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { TaskQuestionFlow } from './task-question-flow';
import { useDeleteTask, useUpdateTask } from '@/hooks/use-tasks';
import type { Task, TaskStatus, Priority } from '@/lib/types';

const PRIORITY_ORDER: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };

interface TaskListProps {
  tasks: Task[];
  emptyMessage?: string;
  defaultStatus?: TaskStatus;
  defaultProjectId?: string;
  defaultGoalId?: string;
  showAddButton?: boolean;
}

function SortableTaskItem({
  task,
  selectionMode,
  selected,
  onToggle,
}: {
  task: Task;
  selectionMode: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center gap-1.5"
    >
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab touch-none rounded px-0.5 py-1 text-slate-300 hover:text-slate-400 active:cursor-grabbing dark:text-slate-700 dark:hover:text-slate-500"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {selectionMode && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Select ${task.title}`}
          className="h-4 w-4 rounded border-slate-300 accent-emerald-500 dark:border-slate-700"
        />
      )}
      <div className="min-w-0 flex-1">
        <TaskCard task={task} />
      </div>
    </div>
  );
}

export function TaskList({
  tasks,
  emptyMessage = 'No tasks yet',
  defaultStatus = 'todo',
  defaultProjectId,
  defaultGoalId,
  showAddButton = true,
}: TaskListProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(() =>
    [...tasks].sort((a, b) => a.position - b.position)
  );

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const bulkPending = updateTask.isPending || deleteTask.isPending;

  // Keep local tasks in sync with server data (but not during active drag)
  useEffect(() => {
    if (!activeTask) {
      setLocalTasks([...tasks].sort((a, b) => a.position - b.position));
    }
  }, [tasks, activeTask]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function clearSelected() {
    setSelected([]);
    setSelectionMode(false);
  }

  async function bulkDelete() {
    await Promise.all(selected.map((id) => deleteTask.mutateAsync(id)));
    clearSelected();
    setDeleteConfirmOpen(false);
  }

  async function bulkComplete() {
    await Promise.all(selected.map((id) => updateTask.mutateAsync({ id, status: 'done' })));
    clearSelected();
  }

  function handleDragStart(event: DragStartEvent) {
    const task = localTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const oldIndex = localTasks.findIndex((t) => t.id === active.id);
    const newIndex = localTasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(localTasks, oldIndex, newIndex);

    // Optimistic update
    setLocalTasks(reordered);

    // Assign positions as (index + 1) * 1000 and only persist changed tasks
    const updates = reordered
      .map((task, index) => ({ id: task.id, position: (index + 1) * 1000 }))
      .filter(({ id, position }) => {
        const original = tasks.find((t) => t.id === id);
        return original && original.position !== position;
      });

    for (const { id, position } of updates) {
      updateTask.mutate({ id, position });
    }
  }

  const taskIds = localTasks.map((t) => t.id);

  return (
    <div className="space-y-2">
      {localTasks.length > 0 && !selectionMode && (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            title="Sort by priority (Urgent → High → Medium → Low)"
            onClick={() => {
              const sorted = [...localTasks].sort(
                (a, b) => (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0)
              );
              setLocalTasks(sorted);
              const updates = sorted
                .map((task, index) => ({ id: task.id, position: (index + 1) * 1000 }))
                .filter(({ id, position }) => {
                  const original = localTasks.find(t => t.id === id);
                  return original && original.position !== position;
                });
              for (const { id, position } of updates) {
                updateTask.mutate({ id, position });
              }
            }}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sort by priority</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectionMode(true)}>Select tasks</Button>
        </div>
      )}

      {selectionMode && (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/70">
          <span className="mr-auto text-xs font-semibold text-slate-600 dark:text-slate-300">
            {selected.length > 0 ? `${selected.length} selected` : 'Select tasks'}
          </span>
          <Button size="sm" variant="secondary" onClick={bulkComplete} disabled={bulkPending || selected.length === 0}>Mark Complete</Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteConfirmOpen(true)} disabled={bulkPending || selected.length === 0}>Delete</Button>
          <Button size="sm" variant="ghost" onClick={clearSelected} disabled={bulkPending}>Done</Button>
        </div>
      )}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {localTasks.map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                selectionMode={selectionMode}
                selected={selected.includes(task.id)}
                onToggle={() => toggleSelect(task.id)}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-1 scale-[1.02] opacity-90 shadow-lg rounded-xl">
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {localTasks.length === 0 && (
        <EmptyState
          icon={<CheckCircle2 className="h-6 w-6" />}
          title={emptyMessage}
          description={showAddButton ? 'Create a task here when you are ready to plan the next step.' : 'No matching tasks need your attention right now.'}
          action={showAddButton ? <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Add Task</Button> : undefined}
        />
      )}

      {showAddButton && localTasks.length > 0 && (
        <button
          onClick={() => setAddOpen(true)}
          className="group flex w-full items-center gap-2.5 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all dark:border-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-800/40 dark:hover:text-slate-300"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
          Add task
        </button>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Task" className="min-h-0 sm:max-w-lg">
        <TaskQuestionFlow
          defaultStatus={defaultStatus}
          defaultProjectId={defaultProjectId}
          defaultGoalId={defaultGoalId}
          onClose={() => setAddOpen(false)}
        />
      </Dialog>
      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Delete selected tasks"
        description={`Delete ${selected.length} selected task${selected.length === 1 ? '' : 's'}? This action cannot be undone.`}
        pending={deleteTask.isPending}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={bulkDelete}
      />
    </div>
  );
}
