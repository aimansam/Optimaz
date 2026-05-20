import type { Task } from "./types";

export type NotificationLeadTimeMinutes = 0 | 15 | 60 | 1440;

export function normalizeNotificationLeadTime(value: unknown): NotificationLeadTimeMinutes {
  return value === 0 || value === 15 || value === 60 || value === 1440 ? value : 60;
}

export function getTaskReminderDate(task: Pick<Task, "due_date" | "due_time">, leadTimeMinutes: NotificationLeadTimeMinutes = 60) {
  if (!task.due_date) {
    return null;
  }

  const dueDate = new Date(`${task.due_date}T${task.due_time?.slice(0, 5) || '09:00'}:00`);

  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  return new Date(dueDate.getTime() - leadTimeMinutes * 60 * 1000);
}

export async function scheduleTaskNotification(task: Task, type: "due" | "overdue" = "due", leadTimeMinutes: NotificationLeadTimeMinutes = 60) {
  const reminderDate = getTaskReminderDate(task, leadTimeMinutes);
  console.log(`Schedule notification for task ${task.title} (${type})`, { reminder_at: reminderDate?.toISOString() ?? null });
}
