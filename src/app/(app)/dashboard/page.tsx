

"use client";
import dynamic from 'next/dynamic';
const InstallPWAButton = dynamic(() => import('@/components/InstallPWAButton'), { ssr: false });

export default function DashboardPage() {
	const { data: todayTasks, isLoading: loadingToday } = useTodayTasks();
	const { data: overdueTasks, isLoading: loadingOverdue } = useOverdueTasks();
	const { data: user } = useUser();
	const [addOpen, setAddOpen] = useState(false);

	const hour = new Date().getHours();
	const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
	const firstName = user?.user_metadata?.full_name?.split(' ')[0]
		?? user?.user_metadata?.name?.split(' ')[0]
		?? user?.email?.split('@')[0]
		?? null;

	const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });
	const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

	const isLoading = loadingToday || loadingOverdue;
	const [filterQuery, setFilterQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [showAnalytics, setShowAnalytics] = useState(false);

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
			<Header
				title="Today"
			import dynamic from 'next/dynamic';
			const InstallPWAButton = dynamic(() => import('@/components/InstallPWAButton'), { ssr: false });
				actions={
					<Button size="sm" onClick={() => setAddOpen(true)}>
						<Plus className="h-4 w-4" />
						Add Task
					</Button>
				}
			/>
			<div className="flex-1 overflow-y-auto">
				<div className="mx-auto max-w-2xl px-6 py-8">


					{/* Date hero with icon toggle */}
					<div className="mb-8 flex items-center justify-between gap-4">
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{weekday} &middot; {dateStr}</p>
							<h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
								{greeting}{firstName ? `, ${firstName}` : ''}
									</div>
								</div>
								{/* ...rest of your dashboard code... */}
								<InstallPWAButton />
							return (
								<>
									<Header
										title="Today"
										actions={
											<Button size="sm" onClick={() => setAddOpen(true)}>
												<Plus className="h-4 w-4" />
												Add Task
											</Button>
										}
									/>
									<div className="flex-1 overflow-y-auto">
										<div className="mx-auto max-w-2xl px-6 py-8">
											{/* Date hero with icon toggle */}
											<div className="mb-8 flex items-center justify-between gap-4">
												<div>
													<p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{weekday} &middot; {dateStr}</p>
													<h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
														{greeting}{firstName ? `, ${firstName}` : ''}
													</h2>
												</div>
												<button
													type="button"
													aria-label={showAnalytics ? 'Hide Stats & Filter' : 'Show Stats & Filter'}
													className={`rounded-md border border-slate-800 bg-slate-900 p-2 text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800`}
													onClick={() => setShowAnalytics((v) => !v)}
												>
													<BarChart3 className="h-6 w-6" />
												</button>
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
												{isLoading ? (
													<TaskSkeleton />
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
										</div>
									</div>

									<Dialog open={addOpen} onClose={() => setAddOpen(false)} title="New Task">
										<TaskForm onClose={() => setAddOpen(false)} />
									</Dialog>
									<InstallPWAButton />
								</>
							);
			<Dialog open={addOpen} onClose={() => setAddOpen(false)} title="New Task">
