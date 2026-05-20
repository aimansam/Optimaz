import type { RecurrenceRule } from '@/lib/types';

export const WEEKDAYS = [
  { value: 0, short: 'Sun', label: 'Sunday' },
  { value: 1, short: 'Mon', label: 'Monday' },
  { value: 2, short: 'Tue', label: 'Tuesday' },
  { value: 3, short: 'Wed', label: 'Wednesday' },
  { value: 4, short: 'Thu', label: 'Thursday' },
  { value: 5, short: 'Fri', label: 'Friday' },
  { value: 6, short: 'Sat', label: 'Saturday' },
] as const;

export function normalizeWeekdays(days: number[] | null | undefined) {
  return [...new Set(days ?? [])]
    .filter(day => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((a, b) => a - b);
}

export function getWeekdayLabel(days: number[] | null | undefined) {
  const weekdays = normalizeWeekdays(days);
  if (weekdays.length === 0) return '';
  if (weekdays.length === 7) return 'Sun-Sat';
  return weekdays.map(day => WEEKDAYS.find(item => item.value === day)?.short).filter(Boolean).join(', ');
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNextRecurringDueDate(dueDate: string | null, rule: RecurrenceRule, weekdays?: number[] | null) {
  if (!dueDate) return null;

  const nextDate = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(nextDate.getTime())) return null;

  if (rule === 'weekly') {
    const selectedWeekdays = normalizeWeekdays(weekdays);

    if (selectedWeekdays.length > 0) {
      for (let offset = 1; offset <= 7; offset += 1) {
        const candidate = new Date(nextDate);
        candidate.setDate(nextDate.getDate() + offset);
        if (selectedWeekdays.includes(candidate.getDay())) return toDateInputValue(candidate);
      }
    }

    nextDate.setDate(nextDate.getDate() + 7);
    return toDateInputValue(nextDate);
  }

  if (rule === 'daily') nextDate.setDate(nextDate.getDate() + 1);
  if (rule === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

  return toDateInputValue(nextDate);
}
