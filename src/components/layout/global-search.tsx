'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { FolderOpen, Search, Target, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type SearchResult =
  | { type: 'task'; id: string; title: string; status: string; project_id?: string | null; project_name?: string | null }
  | { type: 'project'; id: string; name: string; color: string }
  | { type: 'goal'; id: string; title: string; color: string };

const supabase = createClient();

async function search(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const q = `%${query.trim()}%`;

  const [tasks, projects, goals] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, status, project_id, project:projects(name)')
      .ilike('title', q)
      .is('archived_at', null)
      .limit(5),
    supabase
      .from('projects')
      .select('id, name, color')
      .ilike('name', q)
      .eq('archived', false)
      .limit(4),
    supabase
      .from('goals')
      .select('id, title, color')
      .ilike('title', q)
      .limit(4),
  ]);

  const results: SearchResult[] = [];

  for (const t of tasks.data ?? []) {
    const proj = t.project as { name: string } | null;
    results.push({ type: 'task', id: t.id, title: t.title, status: t.status, project_id: t.project_id ?? null, project_name: proj?.name });
  }
  for (const p of projects.data ?? []) {
    results.push({ type: 'project', id: p.id, name: p.name, color: p.color });
  }
  for (const g of goals.data ?? []) {
    results.push({ type: 'goal', id: g.id, title: g.title, color: g.color });
  }

  return results;
}

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 200);

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setActive(0);
    }
  }, [open]);

  // Search when query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    setLoading(true);
    search(debouncedQuery).then((r) => { setResults(r); setActive(0); setLoading(false); });
  }, [debouncedQuery]);

  function navigate(result: SearchResult) {
    if (result.type === 'task') {
      if (result.project_id) router.push(`/projects/${result.project_id}`);
      else router.push(`/kanban`);
    } else if (result.type === 'project') {
      router.push(`/projects/${result.id}`);
    } else if (result.type === 'goal') {
      router.push(`/goals/${result.id}`);
    }
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((v) => Math.min(v + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((v) => Math.max(v - 1, 0)); }
    if (e.key === 'Enter' && results[active]) navigate(results[active]);
  }

  const grouped = {
    task: results.filter((r) => r.type === 'task') as Extract<SearchResult, { type: 'task' }>[],
    project: results.filter((r) => r.type === 'project') as Extract<SearchResult, { type: 'project' }>[],
    goal: results.filter((r) => r.type === 'goal') as Extract<SearchResult, { type: 'goal' }>[],
  };

  let cursor = 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-400 shadow-sm hover:border-slate-300 hover:text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:text-slate-300"
        aria-label="Search (Ctrl+K)"
        title="Search (Ctrl+K)"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-slate-200 bg-slate-100 px-1 text-[10px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800 sm:inline">⌘K</kbd>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4" onClick={() => setOpen(false)}>
          <div className="pointer-events-none fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search tasks, projects, goals..."
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800">Esc</kbd>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-2">
              {!query.trim() && (
                <p className="py-8 text-center text-sm text-slate-400">Type to search tasks, projects, and goals</p>
              )}
              {query.trim() && loading && (
                <p className="py-8 text-center text-sm text-slate-400">Searching...</p>
              )}
              {query.trim() && !loading && results.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">No results for <span className="font-medium">"{query}"</span></p>
              )}

              {grouped.task.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tasks</p>
                  {grouped.task.map((r) => {
                    const idx = cursor++;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => navigate(r)}
                        onMouseEnter={() => setActive(idx)}
                        className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors', active === idx ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60')}
                      >
                        <span className={cn('h-2 w-2 shrink-0 rounded-full', r.status === 'done' ? 'bg-emerald-500' : r.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300')} />
                        <span className="min-w-0 flex-1">
                          <span className={cn('block truncate font-medium text-slate-800 dark:text-slate-100', r.status === 'done' && 'line-through text-slate-400')}>{r.title}</span>
                          {r.project_name && <span className="truncate text-xs text-slate-400">{r.project_name}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {grouped.project.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Projects</p>
                  {grouped.project.map((r) => {
                    const idx = cursor++;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => navigate(r)}
                        onMouseEnter={() => setActive(idx)}
                        className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors', active === idx ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60')}
                      >
                        <FolderOpen className="h-4 w-4 shrink-0" style={{ color: r.color }} />
                        <span className="truncate font-medium text-slate-800 dark:text-slate-100">{r.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {grouped.goal.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Goals</p>
                  {grouped.goal.map((r) => {
                    const idx = cursor++;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => navigate(r)}
                        onMouseEnter={() => setActive(idx)}
                        className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors', active === idx ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60')}
                      >
                        <Target className="h-4 w-4 shrink-0" style={{ color: r.color }} />
                        <span className="truncate font-medium text-slate-800 dark:text-slate-100">{r.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400 dark:border-slate-800">
                <span><kbd className="rounded border border-slate-200 bg-slate-100 px-1 dark:border-slate-700 dark:bg-slate-800">↑↓</kbd> navigate</span>
                <span><kbd className="rounded border border-slate-200 bg-slate-100 px-1 dark:border-slate-700 dark:bg-slate-800">↵</kbd> open</span>
              </div>
            )}
          </div>
        </div>
      , document.body)}
    </>
  );
}
