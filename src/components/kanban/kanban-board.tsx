'use client';

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  rectIntersection,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
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
  // Track which column is currently being hovered (for visual highlight only — no task mutation)
  const [overColumnId, setOverColumnId] = useState<TaskStatus | null>(null);
  const updateTask = useUpdateTask();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  // Only track which column is over — do NOT mutate task list mid-drag
  // (Mutating SortableContext items during drag confuses @dnd-kit's collision tracking)
  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) { setOverColumnId(null); return; }

    const overId = over.id as string;
    const column = COLUMNS.find((c) => c.id === overId);
    if (column) { setOverColumnId(column.id); return; }

    // Over a task card — derive its column
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) setOverColumnId(overTask.status);
    else setOverColumnId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    setOverColumnId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    // ── Dropped directly onto a column droppable ──────────────────────
    const targetColumn = COLUMNS.find((c) => c.id === overId);
    if (targetColumn) {
      if (task.status !== targetColumn.id) {
        const newPos = tasks.filter((t) => t.status === targetColumn.id).length;
        updateTask.mutate({ id: activeId, status: targetColumn.id, position: newPos });
      }
      return;
    }

    // ── Dropped onto another card ─────────────────────────────────────
    const overTask = tasks.find((t) => t.id === overId);
    if (!overTask) return;

    if (task.status !== overTask.status) {
      // Cross-column: insert at the overTask's position in the new column
      updateTask.mutate({
        id: activeId,
        status: overTask.status,
        position: overTask.position,
      });
    } else {
      // Within-column reorder
      const columnTasks = tasks
        .filter((t) => t.status === task.status)
        .sort((a, b) => a.position - b.position);
      const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
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

  function handleDragCancel() {
    setActiveTask(null);
    setOverColumnId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col md:flex-row md:items-start md:min-w-max h-full gap-2 sm:gap-3 md:gap-4">
        {COLUMNS.map(({ id, label }) => (
          <KanbanColumn
            key={id}
            id={id}
            label={label}
            tasks={getTasksByStatus(id)}
            totalTasks={tasks.length}
            isDragOver={overColumnId === id}
          />
        ))}
      </div>

      {/* Floating card — snapped to cursor center via modifier, shadow via isOverlay card style */}
      <DragOverlay
        modifiers={[snapCenterToCursor]}
        dropAnimation={{ duration: 160, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}
      >
        {activeTask && <KanbanCard task={activeTask} isOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
