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
		<div
			className="shrink-0 px-4 py-4 sm:px-6"
			style={{ borderBottom: '1px solid var(--card-border)' }}
		>
			<div className="flex items-start justify-between gap-4">
				{/* Left: date, greeting + streak pill, quote */}
				<div className="min-w-0">
					<p
						className="text-xs font-semibold uppercase tracking-widest"
						style={{ color: 'var(--muted-fg)', opacity: 0.7 }}
					>
						{weekday} &middot; {dateStr}
					</p>
					<div className="mt-1 flex flex-wrap items-center gap-2">
						<h2
							className="text-lg font-bold tracking-tight sm:text-xl"
							style={{
								background: 'linear-gradient(135deg, var(--foreground) 0%, rgb(var(--accent)) 100%)',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								backgroundClip: 'text',
							}}
						>
							{greeting}{firstName ? `, ${firstName}` : ''}
						</h2>
						<TaskStreak tasks={allTasks ?? []} inline />
					</div>
					<div className="hidden sm:block">
					<MotivationQuote inline />
				</div>
				</div>
				{/* Right: action buttons */}
				<div className="flex shrink-0 items-center gap-2 pt-0.5">
					<DailySummary tasks={allTasks ?? []} goals={goals ?? []} />
					<button
						type="button"
						aria-label="Add Task"
						onClick={() => setAddOpen(true)}
						className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-white transition-all duration-200 focus:outline-none"
						style={{
							background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.8))',
							boxShadow: '0 2px 12px var(--glow)',
						}}
						onMouseEnter={e => {
							(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
							(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 18px var(--glow)';
						}}
						onMouseLeave={e => {
							(e.currentTarget as HTMLButtonElement).style.transform = '';
							(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px var(--glow)';
						}}
					>
						<Plus className="h-4 w-4" />
						<span className="hidden sm:inline">Add Task</span>
					</button>
					<button
						type="button"
						aria-label={showAnalytics ? 'Hide Filter' : 'Show Filter'}
						onClick={() => setShowAnalytics(v => !v)}
						className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-all duration-200 focus:outline-none"
						style={showAnalytics ? {
							background: 'rgb(var(--accent) / 0.15)',
							color: 'rgb(var(--accent))',
							border: '1px solid rgb(var(--accent) / 0.3)',
						} : {
							background: 'var(--card-bg)',
							color: 'var(--muted-fg)',
							border: '1px solid var(--card-border)',
						}}
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
			<p
				className="text-[10px] font-semibold uppercase tracking-widest"
				style={{ color: 'var(--muted-fg)', opacity: 0.7 }}
			>
				Goal Focus
			</p>
			<div className="grid grid-cols-3 gap-2">
				{/* Active */}
				<div
					className="rounded-xl p-2.5"
					style={{
						background: 'var(--card-bg)',
						border: '1px solid var(--card-border)',
						backdropFilter: 'blur(12px)',
					}}
				>
					<div className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'rgb(var(--accent))' }}>
						<Target className="h-3 w-3" />
						Active
					</div>
					<p className="mt-1 text-lg font-bold" style={{ color: 'var(--foreground)' }}>{activeGoals.length}</p>
					<p className="text-[10px]" style={{ color: 'var(--muted-fg)' }}>Goals in motion</p>
				</div>
				{/* At risk */}
				<div
					className="rounded-xl p-2.5"
					style={{
						background: 'rgba(239,68,68,0.06)',
						border: '1px solid rgba(239,68,68,0.15)',
						backdropFilter: 'blur(12px)',
					}}
				>
					<div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#ef4444' }}>
						<AlertTriangle className="h-3 w-3" />
						At risk
					</div>
					<p className="mt-1 text-lg font-bold" style={{ color: '#ef4444' }}>{atRiskGoals.length}</p>
					<p className="text-[10px]" style={{ color: 'var(--muted-fg)' }}>Past target</p>
				</div>
				{/* Urgent */}
				<div
					className="rounded-xl p-2.5"
					style={{
						background: 'rgba(245,158,11,0.06)',
						border: '1px solid rgba(245,158,11,0.15)',
						backdropFilter: 'blur(12px)',
					}}
				>
					<div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#d97706' }}>
						<AlertTriangle className="h-3 w-3" />
						Urgent
					</div>
					<p className="mt-1 text-lg font-bold" style={{ color: '#d97706' }}>{urgentGoalTasks.length}</p>
					<p className="text-[10px]" style={{ color: 'var(--muted-fg)' }}>Urgent tasks</p>
				</div>
			</div>
			{nextGoals.length > 0 && (
				<div
					className="rounded-xl p-3"
					style={{
						background: 'var(--card-bg)',
						border: '1px solid var(--card-border)',
						backdropFilter: 'blur(12px)',
					}}
				>
					<p
						className="mb-2 text-[10px] font-semibold uppercase tracking-widest"
						style={{ color: 'var(--muted-fg)', opacity: 0.7 }}
					>
						Next outcomes
					</p>
					<div className="space-y-1">
						{nextGoals.map((goal) => {
							const total = goal.tasks?.length ?? 0;
							const completed = goal.tasks?.filter(t => t.status === 'done').length ?? 0;
							const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
							return (
								<Link
									key={goal.id}
									href={`/goals/${goal.id}`}
									className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-all duration-150"
									onMouseEnter={e => {
										(e.currentTarget as HTMLAnchorElement).style.background = 'rgb(var(--accent) / 0.07)';
									}}
									onMouseLeave={e => {
										(e.currentTarget as HTMLAnchorElement).style.background = '';
									}}
								>
									<span className="h-2 w-2 shrink-0 rounded-full ring-1 ring-white/20" style={{ backgroundColor: goal.color }} />
									<span className="min-w-0 flex-1">
										<span className="block truncate text-xs font-medium" style={{ color: 'var(--foreground)' }}>{goal.title}</span>
										<span className="block truncate text-[10px]" style={{ color: 'var(--muted-fg)' }}>{goal.due_date ? `Target ${goal.due_date}` : 'No target date'}</span>
									</span>
									<span
										className="shrink-0 text-[10px] font-bold"
										style={{ color: 'rgb(var(--accent))' }}
									>
										{percent}%
									</span>
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
			<div className="flex-1 overflow-y-auto overscroll-y-contain lg:hidden" style={{ background: 'var(--background)' }}>
				<div className="px-4 py-4 space-y-4 sm:px-6" style={{ paddingBottom: 'max(6rem, calc(5.5rem + env(safe-area-inset-bottom, 0px)))' }}>
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
				<aside
				className="shrink-0 w-64 xl:w-72 flex flex-col overflow-y-auto overscroll-y-contain px-4 py-4"
				style={{
					background: 'var(--sidebar-bg)',
					borderRight: '1px solid var(--card-border)',
					backdropFilter: 'blur(12px)',
					WebkitBackdropFilter: 'blur(12px)',
				}}
			>
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
						<div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-6" style={{ background: 'var(--background)', paddingBottom: 'max(6rem, calc(5.5rem + env(safe-area-inset-bottom, 0px)))' }}>
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
