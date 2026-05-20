export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type RecurrenceRule = 'daily' | 'weekly' | 'monthly';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  color: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  favorite?: boolean;
  archived?: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  goal_id: string | null;
  title: string;
  notes: string | null;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;
  position: number;
  completed_at: string | null;
  archived_at: string | null;
  is_recurring: boolean;
  recurrence_rule: RecurrenceRule | null;
  created_at: string;
  updated_at: string;
  subtasks?: Subtask[];
  project?: Project | null;
  goal?: Goal | null;
}

export interface Subtask {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  label: string;
  tasks: Task[];
}
