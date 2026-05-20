drop index if exists public.goals_user_project_idx;

alter table public.goals
  drop column if exists project_id;