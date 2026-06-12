"use client";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';
const InstallPWAButton = dynamic(() => import('@/components/InstallPWAButton'), { ssr: false });

import { AlertTriangle, BarChart3, Plus, Target } from 'lucide-react';
import { DashboardAnalytics, DashboardStatsStrip } from '@/components/dashboard/dashboard-analytics';
import { DashboardWidget } from '@/components/dashboard/dashboard-widgets';
import { MotivationQuote } from '@/components/dashboard/motivation-quote';
import { TaskStreak } from '@/components/dashboard/task-streak';
import { DailySummary } from '@/components/dashboard/daily-summary';
import { TaskList } from '@/components/tasks/task-list';
import { TaskQuestionFlow } from '@/components/tasks/task-question-flow';
import { Dialog } from '@/components/ui/dialog';
import { UpcomingTasks } from '@/components/tasks/upcoming-tasks';
import { TaskFilterBar, DEFAULT_TASK_FILTERS, type TaskFilters } from '@/components/tasks/task-filter-bar';
import { OnboardingPanel } from '@/components/onboarding/onboarding-panel';

import { useTodayTasks, useOverdueTasks, useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { useGoals } from '@/hooks/use-goals';
import { useUser } from '@/hooks/use-user';
import { useUpdateUser } from '@/hooks/use-update-user';
import { isOverdue } from '@/lib/utils';

let hydratedDate: Date | null = null;

function getHydratedDate() {
	if (!hydratedDate) hydratedDate = new Date();
	return hydratedDate;
}

function getServerDateSnapshot() {
	return null;
}

function subscribeToDate() {
	return () => {};
}

function isOnboardingSnoozed(value: unknown, nowMs: number) {
	return typeof value === 'string' && Date.parse(value) > nowMs;
}

function getTomorrowIso() {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	return tomorrow.toISOString();
}

export default function DashboardPage() {
	const { data: todayTasks, isLoading: loadingToday } = useTodayTasks();
	const { data: overdueTasks, isLoading: loadingOverdue } = useOverdueTasks();
	const { data: allTasks } = useTasks();
	const { data: projects } = useProjects();
	const { data: goals } = useGoals();
	const { data: user } = useUser();
	const updateOnboarding = useUpdateUser();
	const [addOpen, setAddOpen] = useState(false);
	const [filters, setFilters] = useState<TaskFilters>(DEFAULT_TASK_FILTERS);
	const [showAnalytics, setShowAnalytics] = useState(false);
	const currentDate = useSyncExternalStore(subscribeToDate, getHydratedDate, getServerDateSnapshot);
	const currentTime = currentDate?.getTime() ?? 0;

	const hour = currentDate?.getHours() ?? 12;
	const greeting = !currentDate ? 'Hello' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
	const firstName = user?.user_metadata?.full_name?.split(' ')[0]
		?? user?.user_metadata?.name?.split(' ')[0]
		?? user?.email?.split('@')[0]
		?? null;
	const weekday = currentDate?.toLocaleDateString('en-US', { weekday: 'long' }) ?? 'Today';
	const dateStr = currentDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) ?? '';
	const isLoading = loadingToday || loadingOverdue;
	// Use local date (not UTC) to avoid timezone-shifted overdue classifications
	const todayKey = currentDate
		? `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(currentDate.getDate()).padStart(2,'0')}`
		: new Date().toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD in local tz

	const activeGoals = (goals ?? []).filter((goal) => {
		const total = goal.tasks?.length ?? 0;
		const completed = goal.tasks?.filter((task) => task.status === 'done').length ?? 0;
		return total === 0 || completed < total;
	});
	const atRiskGoals = activeGoals.filter((goal) => goal.due_date !== null && goal.due_date < todayKey);
	const urgentGoalTasks = (allTasks ?? []).filter((task) => task.goal_id && task.priority === 'urgent' && task.status !== 'done');
	const nextGoals = [...activeGoals]
		.sort((a, b) => {
			if (!a.due_date && !b.due_date) return a.title.localeCompare(b.title);
			if (!a.due_date) return 1;
			if (!b.due_date) return -1;
			return a.due_date.localeCompare(b.due_date);
		})
		.slice(0, 3);
	const showOnboarding = Boolean(
		user
		&& !user.user_metadata?.onboarding_completed
		&& !isOnboardingSnoozed(user.user_metadata?.onboarding_deferred_until, currentTime)
	);

	function filterTasks(tasks: import('@/lib/types').Task[] = []) {
		const todayStr = new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD
		const weekEnd = new Date();
		weekEnd.setDate(weekEnd.getDate() + 7);
		const weekEndStr = weekEnd.toLocaleDateString('en-CA');
		return tasks.filter(t => {
			if (filters.query && !t.title.toLowerCase().includes(filters.query.toLowerCase())) return false;
			if (filters.status && t.status !== filters.status) return false;
			if (filters.priority && t.priority !== filters.priority) return false;
			if (filters.projectId && t.project_id !== filters.projectId) return false;
			if (filters.dueFilter === 'today' && t.due_date !== todayStr) return false;
			if (filters.dueFilter === 'this_week' && t.due_date && t.due_date > weekEndStr) return false;
			if (filters.dueFilter === 'overdue' && !isOverdue(t.due_date, t.due_time)) return false;
			if (filters.dueFilter === 'no_date' && t.due_date) return false;
			return true;
		});
	}

	function dismissOnboarding() {
		updateOnboarding.mutate({ metadata: { onboarding_completed: true } });
	}

	function snoozeOnboarding() {
		updateOnboarding.mutate({ metadata: { onboarding_deferred_until: getTomorrowIso() } });
	}

	// ── Shared sub-components rendered in both layouts ──────────

	const topBar = (
		<div className="shrink-0 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-6">
			<div className="flex items-start justify-between gap-4">
				{/* Left: date, greeting + streak pill, quote */}
				<div className="min-w-0">
				<p className="text-xs font-semibold uppercase tracking-widest text-slate-400 sm:text-sm">
					{weekday} &middot; {dateStr}
				</p>
					<div className="mt-0.5 flex flex-wrap items-center gap-2">
						<h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-xl">
							{greeting}{firstName ? `, ${firstName}` : ''}
						</h2>
						<TaskStreak tasks={allTasks ?? []} inline />
					</div>
					<MotivationQuote inline />
				</div>
				{/* Right: action buttons */}
				<div className="flex shrink-0 items-center gap-2 pt-0.5">
					<DailySummary tasks={allTasks ?? []} todayTasks={todayTasks ?? []} goals={goals ?? []} />
					<button
						type="button"
						aria-label="Add Task"
						onClick={() => setAddOpen(true)}
						className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
						style={{ background: 'rgb(var(--accent))' }}
					>
						<Plus className="h-4 w-4" />
						<span className="hidden sm:inline">Add Task</span>
					</button>
					<button
						type="button"
						aria-label={showAnalytics ? 'Hide Filter' : 'Show Filter'}
						onClick={() => setShowAnalytics(v => !v)}
						className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 ${showAnalytics ? 'border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'}`}
					>
						<BarChart3 className="h-4 w-4" />
						<span className="hidden sm:inline">Filter</span>
					</button>
				</div>
			</div>
		</div>
	);

	const goalFocusPanel = (
		<div className="mt-4 space-y-3">
			<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Goal Focus</p>
			<div className="grid grid-cols-3 gap-2">
				<div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
				<div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
					<Target className="h-3 w-3 text-slate-400" />
					Active
				</div>
				<p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{activeGoals.length}</p>
				<p className="text-xs text-slate-400">Goals in motion</p>
				</div>
				<div className="rounded-xl border border-red-200 bg-red-50 p-2.5 dark:border-red-900/50 dark:bg-red-950/20">
				<div className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-300">
					<AlertTriangle className="h-3 w-3" />
					At risk
				</div>
				<p className="mt-1 text-lg font-bold text-red-600 dark:text-red-300">{atRiskGoals.length}</p>
				<p className="text-xs text-red-500/80 dark:text-red-300/80">Past target</p>
				</div>
				<div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/20">
				<div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
					<AlertTriangle className="h-3 w-3" />
					Urgent
				</div>
				<p className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-300">{urgentGoalTasks.length}</p>
				<p className="text-xs text-amber-600/80 dark:text-amber-300/80">Urgent tasks</p>
				</div>
			</div>
			{nextGoals.length > 0 && (
				<div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
					<p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Next outcomes</p>
					<div className="space-y-1">
						{nextGoals.map((goal) => {
							const total = goal.tasks?.length ?? 0;
							const completed = goal.tasks?.filter(t => t.status === 'done').length ?? 0;
							const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
							return (
								<Link key={goal.id} href={`/goals/${goal.id}`} className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60">
									<span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: goal.color }} />
									<span className="min-w-0 flex-1">
										<span className="block truncate text-xs font-medium text-slate-800 dark:text-slate-100">{goal.title}</span>
										<span className="block truncate text-xs text-slate-400">{goal.due_date ? `Target ${goal.due_date}` : 'No target date'}</span>
									</span>
									<span className="shrink-0 text-xs font-semibold text-slate-400">{percent}%</span>
								</Link>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);

	const taskFeeds = (
		<>
			{!isLoading && overdueTasks && overdueTasks.length > 0 && (
				<DashboardWidget title={`Overdue (${overdueTasks.length})`}>
					<TaskList tasks={filterTasks(overdueTasks)} showAddButton={false} />
				</DashboardWidget>
			)}
			<DashboardWidget title="Today">
				{isLoading ? (
					<div className="space-y-2">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
						))}
					</div>
				) : (
					<TaskList
						tasks={filterTasks(todayTasks)}
						emptyMessage={
							(overdueTasks?.length ?? 0) > 0
								? 'No additional tasks due today.'
								: 'Nothing due today — great job!'
						}
						showAddButton={false}
					/>
				)}
			</DashboardWidget>
			<DashboardWidget title="Upcoming Deadlines">
				<UpcomingTasks days={7} filters={filters} showHeading={false} />
			</DashboardWidget>
		</>
	);

	return (
		<>
			{/* Full-height, no-scroll container */}
			<div className="flex h-full flex-col overflow-hidden">
				{topBar}

				{/* ═══════════════════════════════════════════════════════
				    MOBILE layout (< lg): single natural scroll column
				    ═══════════════════════════════════════════════════════ */}
				<div className="flex-1 overflow-y-auto lg:hidden">
					<div className="px-4 py-4 space-y-4 sm:px-6">
					{/* Stats + chart */}
					<DashboardStatsStrip compact />
					<DashboardAnalytics />

					{/* Goal focus — compact 3-col grid */}
					{goalFocusPanel}

						{/* Onboarding */}
						{showOnboarding && (
							<OnboardingPanel
								taskCount={allTasks?.length ?? 0}
								projectCount={projects?.length ?? 0}
								goalCount={goals?.length ?? 0}
								onCreateTask={() => setAddOpen(true)}
								onSnooze={snoozeOnboarding}
								onComplete={dismissOnboarding}
								completing={updateOnboarding.isPending}
							/>
						)}

						{/* Filter bar */}
						{showAnalytics && (
							<TaskFilterBar filters={filters} onChange={setFilters} />
						)}

						{/* Task feeds */}
						{taskFeeds}
					</div>
				</div>

				{/* ═══════════════════════════════════════════════════════
				    DESKTOP layout (≥ lg): 2-col viewport-fit
				    ═══════════════════════════════════════════════════════ */}
				<div className="hidden flex-1 min-h-0 lg:flex lg:flex-row lg:overflow-hidden">

					{/* Left panel — stats, chart, streak, quote, goal focus */}
				<aside className="shrink-0 w-64 xl:w-72 flex flex-col border-r border-slate-100 dark:border-slate-800 overflow-y-auto px-4 py-4">
					<DashboardStatsStrip compact />
					<DashboardAnalytics />
					{goalFocusPanel}
				</aside>

					{/* Right panel — task feeds */}
					<div className="flex-1 min-h-0 flex flex-col overflow-hidden">
						{/* Onboarding + filter bar are shrink-0 so task list isn't pushed off-screen */}
						{showOnboarding && (
							<div className="shrink-0 px-4 pt-4 sm:px-6">
								<OnboardingPanel
									taskCount={allTasks?.length ?? 0}
									projectCount={projects?.length ?? 0}
									goalCount={goals?.length ?? 0}
									onCreateTask={() => setAddOpen(true)}
									onSnooze={snoozeOnboarding}
									onComplete={dismissOnboarding}
									completing={updateOnboarding.isPending}
								/>
							</div>
						)}
						{showAnalytics && (
							<div className="shrink-0 px-4 pt-3 sm:px-6">
								<TaskFilterBar filters={filters} onChange={setFilters} />
							</div>
						)}
						<div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6">
							{taskFeeds}
						</div>
					</div>
				</div>
			</div>

			<Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Task" className="min-h-0 sm:max-w-lg">
				<TaskQuestionFlow onClose={() => setAddOpen(false)} />
			</Dialog>
			<InstallPWAButton />
		</>
	);
}
