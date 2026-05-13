create index if not exists tasks_user_due_status_idx
  on public.tasks(user_id, due_date, status)
  where due_date is not null;

create index if not exists tasks_user_status_position_idx
  on public.tasks(user_id, status, position);

create index if not exists tasks_user_project_position_idx
  on public.tasks(user_id, project_id, position)
  where project_id is not null;

create index if not exists tasks_user_goal_position_idx
  on public.tasks(user_id, goal_id, position)
  where goal_id is not null;

create index if not exists subtasks_user_task_position_idx
  on public.subtasks(user_id, task_id, position);

create index if not exists projects_user_created_at_idx
  on public.projects(user_id, created_at);

create index if not exists goals_user_created_at_idx
  on public.goals(user_id, created_at);

create or replace function public.prune_operational_data(retain_days integer default 90)
returns table(deleted_analytics integer, deleted_app_errors integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  analytics_count integer;
  errors_count integer;
begin
  if retain_days < 7 then
    raise exception 'retain_days must be at least 7';
  end if;

  delete from public.analytics_events
  where created_at < now() - make_interval(days => retain_days);
  get diagnostics analytics_count = row_count;

  delete from public.app_errors
  where created_at < now() - make_interval(days => retain_days);
  get diagnostics errors_count = row_count;

  return query select analytics_count, errors_count;
end;
$$;

revoke all on function public.prune_operational_data(integer) from public;
revoke all on function public.prune_operational_data(integer) from anon;
revoke all on function public.prune_operational_data(integer) from authenticated;