alter table public.projects
  add column if not exists parent_project_id uuid references public.projects(id) on delete set null;

create index if not exists projects_parent_project_id_idx
  on public.projects(parent_project_id);

create index if not exists projects_user_parent_idx
  on public.projects(user_id, parent_project_id, archived);