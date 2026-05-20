alter table public.tasks
  add column if not exists recurrence_weekdays integer[],
  add constraint tasks_recurrence_weekdays_valid
    check (recurrence_weekdays is null or recurrence_weekdays <@ array[0,1,2,3,4,5,6])
    not valid;

alter table public.tasks
  validate constraint tasks_recurrence_weekdays_valid;
