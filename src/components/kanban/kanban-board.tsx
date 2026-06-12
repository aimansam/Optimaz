'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { useUpdateTask } from '@/hooks/use-tasks';
import type { Task, TaskStatus } from '@/lib/types';

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

interface KanbanBoardProps {
  tasks: Task[];
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const updateTask = useUpdateTask();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a column (status)
    const targetColumn = COLUMNS.find((c) => c.id === overId);
    if (targetColumn) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== targetColumn.id) {
        updateTask.mutate({ id: taskId, status: targetColumn.id as TaskStatus });
      }
      return;
    }

    // Dropped over another task — find that task's column
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      if (task.status !== overTask.status) {
        // Cross-column move
        updateTask.mutate({ id: taskId, status: overTask.status, position: overTask.position });
      } else {
        // Within-column reorder: update all affected positions
        const columnTasks = tasks
          .filter((t) => t.status === task.status)
          .sort((a, b) => a.position - b.position);
        const oldIndex = columnTasks.findIndex((t) => t.id === taskId);
        const newIndex = columnTasks.findIndex((t) => t.id === overId);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(columnTasks, oldIndex, newIndex);
          reordered.forEach((t, i) => {
            if (t.position !== i) {
              updateTask.mutate({ id: t.id, position: i });
            }
          });
        }
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className="flex flex-col md:flex-row md:items-start md:min-w-max h-full gap-2 sm:gap-3 md:gap-4"
      >
        {COLUMNS.map(({ id, label }) => (
          <KanbanColumn key={id} id={id} label={label} tasks={getTasksByStatus(id)} />
        ))}
      </div>
      <DragOverlay>
        {activeTask && <KanbanCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}
