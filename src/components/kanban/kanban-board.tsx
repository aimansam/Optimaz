'use client';

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
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
  // Local optimistic task list — mutated on drag-over for live cross-column preview
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const updateTask = useUpdateTask();

  // Sync with server state whenever tasks prop changes (but not mid-drag)
  useEffect(() => {
    if (!activeTask) setLocalTasks(tasks);
  }, [tasks, activeTask]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  const getTasksByStatus = (status: TaskStatus) =>
    localTasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  function handleDragStart(event: DragStartEvent) {
    const task = localTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    // Determine target column (over a column header or over a task inside a column)
    const overColumn = COLUMNS.find((c) => c.id === overId);
    const overTask = localTasks.find((t) => t.id === overId);
    const targetStatus: TaskStatus | undefined = overColumn?.id ?? overTask?.status;

    if (!targetStatus) return;

    const dragged = localTasks.find((t) => t.id === activeId);
    if (!dragged || dragged.status === targetStatus) return;

    // Optimistically move the card to the target column (insert at end)
    const targetCount = localTasks.filter((t) => t.status === targetStatus && t.id !== activeId).length;
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, status: targetStatus, position: targetCount } : t))
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const dragged = localTasks.find((t) => t.id === active.id);
    setActiveTask(null);

    if (!over || !dragged) {
      // Drag cancelled / dropped nowhere — revert to server state
      setLocalTasks(tasks);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const originalTask = tasks.find((t) => t.id === activeId);
    if (!originalTask) return;

    const overColumn = COLUMNS.find((c) => c.id === overId);

    // ── Dropped onto a column header ──────────────────────────────────
    if (overColumn) {
      if (originalTask.status !== overColumn.id) {
        const targetCount = tasks.filter((t) => t.status === overColumn.id).length;
        updateTask.mutate({ id: activeId, status: overColumn.id, position: targetCount });
      }
      return;
    }

    // ── Dropped onto another task ─────────────────────────────────────
    const overTask = tasks.find((t) => t.id === overId);
    if (!overTask) return;

    if (originalTask.status !== overTask.status) {
      // Cross-column drop: place after overTask in the target column
      updateTask.mutate({
        id: activeId,
        status: overTask.status,
        position: overTask.position,
      });
    } else {
      // Within-column reorder
      const columnTasks = localTasks
        .filter((t) => t.status === dragged.status)
        .sort((a, b) => a.position - b.position);
      const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
      const newIndex = columnTasks.findIndex((t) => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        // Update local state immediately for snappy feel
        setLocalTasks((prev) => {
          const others = prev.filter((t) => t.status !== dragged.status);
          return [...others, ...reordered.map((t, i) => ({ ...t, position: i }))];
        });
        // Persist only changed positions
        reordered.forEach((t, i) => {
          const original = tasks.find((o) => o.id === t.id);
          if (original && original.position !== i) {
            updateTask.mutate({ id: t.id, position: i });
          }
        });
      }
    }
  }

  function handleDragCancel() {
    setActiveTask(null);
    setLocalTasks(tasks); // Revert all optimistic changes
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
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
            totalTasks={localTasks.length}
          />
        ))}
      </div>

      {/* Floating card that follows the cursor — lifted + rotated */}
      <DragOverlay
        dropAnimation={{
          duration: 160,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        {activeTask && (
          <div
            style={{
              transform: 'rotate(2.5deg)',
              cursor: 'grabbing',
              boxShadow: '0 24px 56px rgba(0,0,0,0.22), 0 8px 18px rgba(0,0,0,0.12)',
              borderRadius: 12,
              pointerEvents: 'none',
            }}
          >
            <KanbanCard task={activeTask} isOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
