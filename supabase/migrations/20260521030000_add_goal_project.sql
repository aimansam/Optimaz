alter table public.goals
  add column if not exists project_id uuid references public.projects(id) on delete set null;

create index if not exists goals_user_project_idx
  on public.goals(user_id, project_id);