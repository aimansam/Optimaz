



"use client";
import dynamic from 'next/dynamic';
const InstallPWAButton = dynamic(() => import('@/components/InstallPWAButton'), { ssr: false });



import { Plus, BarChart3 } from 'lucide-react';

	const { data: todayTasks, isLoading: loadingToday } = useTodayTasks();
	const { data: overdueTasks, isLoading: loadingOverdue } = useOverdueTasks();
	const { data: user } = useUser();
	const [addOpen, setAddOpen] = useState(false);
	const [filterQuery, setFilterQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [showAnalytics, setShowAnalytics] = useState(false);

	const hour = new Date().getHours();
	const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
	const firstName = user?.user_metadata?.full_name?.split(' ')[0]
		?? user?.user_metadata?.name?.split(' ')[0]
		?? user?.email?.split('@')[0]
		?? null;
	const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });
	const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	const isLoading = loadingToday || loadingOverdue;

	function handleFilter(query: string, status: string) {
		setFilterQuery(query);
		setFilterStatus(status);
	}

	function filterTasks(tasks: import('@/lib/types').Task[] = []) {
		return tasks.filter(t =>
			(!filterQuery || t.title.toLowerCase().includes(filterQuery.toLowerCase())) &&
			(!filterStatus || t.status === filterStatus)
		);
	}

	return (
		<>
			<div className="flex-1 overflow-y-auto">
				<div className="mx-auto w-full max-w-2xl px-2 sm:px-4 md:px-6 py-3 md:py-8">
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
								aria-label={showAnalytics ? 'Hide Stats & Filter' : 'Show Stats & Filter'}
								className="rounded-md border border-slate-800 bg-slate-900 p-1.5 sm:p-2 text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
								onClick={() => setShowAnalytics((v) => !v)}
							>
								<BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
							</button>
							<button
								type="button"
								aria-label="Add Task"
								className="rounded-md border border-slate-800 bg-slate-900 p-1.5 sm:p-2 text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
								onClick={() => setAddOpen(true)}
							>
								<Plus className="h-5 w-5 sm:h-6 sm:w-6" />
							</button>
						</div>
					</div>

					{/* Collapsible Markdown-style section for Analytics and Filter */}
					<details className="mb-4" open={showAnalytics}>
						<summary className="hidden" />
						<div className="mt-4">
							<DashboardAnalytics />
							<TaskFilterBar onFilter={handleFilter} />
						</div>
					</details>

					{/* Upcoming deadlines section */}
					<DashboardWidget title="Upcoming Deadlines">
						<UpcomingTasks days={7} showHeading={false} />
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
import { useState } from 'react';
import { useTodayTasks, useOverdueTasks } from '@/hooks/use-tasks';
import { useUser } from '@/hooks/use-user';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3 } from 'lucide-react';
import { DashboardAnalytics } from '@/components/dashboard/dashboard-analytics';
import { TaskFilterBar } from '@/components/tasks/task-filter-bar';
import { DashboardWidget } from '@/components/dashboard/dashboard-widgets';
import { UpcomingTasks } from '@/components/tasks/upcoming-tasks';
import { TaskList } from '@/components/tasks/task-list';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
// TaskSkeleton is referenced but missing, so comment it out for now
// import { TaskSkeleton } from '@/components/tasks/task-skeleton';
