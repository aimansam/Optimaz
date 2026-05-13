import type { Priority } from '@/lib/types';

export function getPromptLines(prompt: string) {
  return prompt
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

export function getFirstPromptLine(prompt: string) {
  return getPromptLines(prompt)[0] ?? prompt.trim();
}

export function getPromptDetails(prompt: string) {
  const lines = getPromptLines(prompt);
  return lines.slice(1).join('\n');
}

export function detectPriority(prompt: string): Priority {
  const lowerPrompt = prompt.toLowerCase();

  if (/\b(urgent|asap|critical)\b/.test(lowerPrompt)) return 'urgent';
  if (/\b(high|important)\b/.test(lowerPrompt)) return 'high';
  if (/\b(low|later|someday)\b/.test(lowerPrompt)) return 'low';
  return 'medium';
}

export function detectDueDate(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();
  const explicitDate = lowerPrompt.match(/\b(20\d{2}-\d{2}-\d{2})\b/);

  if (explicitDate) return explicitDate[1];

  const dueDate = new Date();
  if (/\btomorrow\b/.test(lowerPrompt)) {
    dueDate.setDate(dueDate.getDate() + 1);
    return dueDate.toISOString().split('T')[0];
  }

  if (/\btoday\b/.test(lowerPrompt)) {
    return dueDate.toISOString().split('T')[0];
  }

  if (/\bnext week\b/.test(lowerPrompt)) {
    dueDate.setDate(dueDate.getDate() + 7);
    return dueDate.toISOString().split('T')[0];
  }

  return undefined;
}

export function extractTags(prompt: string) {
  return Array.from(new Set((prompt.match(/#[\w-]+/g) ?? []).map(tag => tag.slice(1))));
}