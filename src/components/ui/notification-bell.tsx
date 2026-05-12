"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Bell, CalendarClock, CheckCircle2 } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { cn, formatDate } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  href: string;
  tone: "danger" | "warning" | "info" | "success";
  read?: boolean;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  const dueDate = new Date(`${dateStr}T00:00:00`);
  return Math.round((dueDate.getTime() - startOfToday().getTime()) / (1000 * 60 * 60 * 24));
}

function taskHref(task: Task) {
  if (task.project_id) return `/projects/${task.project_id}`;
  if (task.goal_id) return `/goals/${task.goal_id}`;
  return "/dashboard";
}

function buildNotifications(tasks: Task[] = []): NotificationItem[] {
  const recentThreshold = new Date();
  recentThreshold.setDate(recentThreshold.getDate() - 2);

  return tasks
    .flatMap((task) => {
      const dueIn = daysUntil(task.due_date);
      const href = taskHref(task);
      const items: NotificationItem[] = [];

      if (task.status !== "done" && dueIn !== null && dueIn < 0) {
        items.push({
          id: `overdue-${task.id}`,
          title: "Overdue",
          message: `${task.title} was due ${formatDate(task.due_date)}`,
          href,
          tone: "danger",
        });
      } else if (task.status !== "done" && dueIn === 0) {
        items.push({
          id: `today-${task.id}`,
          title: "Due today",
          message: task.title,
          href,
          tone: "warning",
        });
      } else if (task.status !== "done" && dueIn !== null && dueIn > 0 && dueIn <= 7) {
        items.push({
          id: `upcoming-${task.id}`,
          title: `Due in ${dueIn} day${dueIn === 1 ? "" : "s"}`,
          message: task.title,
          href,
          tone: "info",
        });
      }

      if (task.status === "done" && new Date(task.updated_at) >= recentThreshold) {
        items.push({
          id: `done-${task.id}`,
          title: "Completed",
          message: task.title,
          href,
          tone: "success",
          read: true,
        });
      }

      return items;
    })
    .sort((a, b) => {
      const rank = { danger: 0, warning: 1, info: 2, success: 3 };
      return rank[a.tone] - rank[b.tone];
    })
    .slice(0, 12);
}

const TONE_STYLES: Record<NotificationItem["tone"], string> = {
  danger: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  info: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300",
  success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300",
};

const TONE_ICONS = {
  danger: AlertTriangle,
  warning: CalendarClock,
  info: CalendarClock,
  success: CheckCircle2,
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: tasks, isLoading } = useTasks();
  const notifications = useMemo(() => buildNotifications(tasks), [tasks]);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative inline-block">
      <button
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm shadow-red-500/30">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Task alerts and recent progress</p>
            </div>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-300">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto py-1">
            {isLoading && <div className="px-4 py-6 text-sm text-slate-400">Loading notifications...</div>}
            {!isLoading && notifications.length === 0 && (
              <div className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500">No active task alerts.</div>
            )}
            {notifications.map(n => (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => setOpen(false)}
                className="flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70"
              >
                <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", TONE_STYLES[n.tone])}>
                  {(() => {
                    const Icon = TONE_ICONS[n.tone];
                    return <Icon className="h-4 w-4" />;
                  })()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{n.title}</span>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-red-500" />}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-medium text-slate-800 dark:text-slate-100">{n.message}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
