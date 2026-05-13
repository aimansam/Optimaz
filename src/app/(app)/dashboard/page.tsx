



"use client";
import dynamic from 'next/dynamic';
import { useState, useSyncExternalStore } from 'react';
const InstallPWAButton = dynamic(() => import('@/components/InstallPWAButton'), { ssr: false });



import { Plus, BarChart3 } from 'lucide-react';
import { DashboardAnalytics } from '@/components/dashboard/dashboard-analytics';
import { DashboardWidget } from '@/components/dashboard/dashboard-widgets';
import { TaskList } from '@/components/tasks/task-list';
import { TaskForm } from '@/components/tasks/task-form';
import { Dialog } from '@/components/ui/dialog';
import { UpcomingTasks } from '@/components/tasks/upcoming-tasks';
import { TaskFilterBar } from '@/components/tasks/task-filter-bar';
import { OnboardingPanel } from '@/components/onboarding/onboarding-panel';

import { useTodayTasks, useOverdueTasks, useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { useGoals } from '@/hooks/use-goals';
import { useUser } from '@/hooks/use-user';
import { useUpdateUser } from '@/hooks/use-update-user';
import type { TaskStatus } from '@/lib/types';

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
	const [filterQuery, setFilterQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState<TaskStatus | "">("");
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
	const showOnboarding = Boolean(
		user
		&& !user.user_metadata?.onboarding_completed
		&& !isOnboardingSnoozed(user.user_metadata?.onboarding_deferred_until, currentTime)
	);

	function handleFilter(query: string, status: string) {
		setFilterQuery(query);
		setFilterStatus(status as TaskStatus | "");
	}

	function filterTasks(tasks: import('@/lib/types').Task[] = []) {
		return tasks.filter(t =>
			(!filterQuery || t.title.toLowerCase().includes(filterQuery.toLowerCase())) &&
			(!filterStatus || t.status === filterStatus)
		);
	}

	function dismissOnboarding() {
		updateOnboarding.mutate({ metadata: { onboarding_completed: true } });
	}

	function snoozeOnboarding() {
		updateOnboarding.mutate({ metadata: { onboarding_deferred_until: getTomorrowIso() } });
	}

	return (
		<>
			<div className="flex-1 overflow-y-auto">
				<div className="mx-auto w-full max-w-3xl px-3 sm:px-4 md:px-6 py-3 md:py-8">
					{/* Date hero and actions */}
					<div className="mb-4 sm:mb-8 flex items-center justify-between gap-2 sm:gap-4">
						<div>
							<p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{weekday} &middot; {dateStr}</p>
							<h2 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
								{greeting}{firstName ? `, ${firstName}` : ''}
							</h2>
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								aria-label="Add Task"
								title="Add Task"
								onClick={() => setAddOpen(true)}
								className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
							>
								<Plus className="h-4 w-4" />
								<span className="hidden sm:inline">Add Task</span>
							</button>
							<button
								type="button"
								aria-label={showAnalytics ? 'Hide Stats & Filter' : 'Show Stats & Filter'}
								className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
								onClick={() => setShowAnalytics((v) => !v)}
							>
								<BarChart3 className="h-5 w-5" />
							</button>
						</div>
					</div>

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

					{showAnalytics && (
						<div className="mb-5">
							<DashboardAnalytics />
							<TaskFilterBar onFilter={handleFilter} />
						</div>
					)}

					{/* Upcoming deadlines section */}
					<DashboardWidget title="Upcoming Deadlines">
						<UpcomingTasks
							days={7}
							filterQuery={filterQuery}
							filterStatus={filterStatus}
							showHeading={false}
						/>
					</DashboardWidget>

					{/* Overdue section */}
					{!isLoading && overdueTasks && overdueTasks.length > 0 && (
						<DashboardWidget title={`Overdue (${overdueTasks.length})`}>
							<TaskList tasks={filterTasks(overdueTasks)} showAddButton={false} />
						</DashboardWidget>
					)}

					{/* Today section */}
					<DashboardWidget title="Today">
						{isLoading ? null : (
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
				</div>
			</div>

			<Dialog open={addOpen} onClose={() => setAddOpen(false)} title="New Task">
				<TaskForm onClose={() => setAddOpen(false)} />
			</Dialog>
				<InstallPWAButton />
		</>
	);
}

