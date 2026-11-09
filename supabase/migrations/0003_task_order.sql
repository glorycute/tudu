-- tudu: let people put tasks in their own order (drag to rearrange).
-- Run once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
--
-- sort_order is a number; lower comes first. New tasks go to the end.
-- Moving a task between two others gives it a value halfway between theirs.

alter table public.tasks add column if not exists sort_order double precision;

-- Existing tasks keep the order they were created in.
-- (The locking trigger is paused only for this one-time fill.)
alter table public.tasks disable trigger tasks_enforce_rules;
update public.tasks set sort_order = extract(epoch from created_at) * 1000 where sort_order is null;
alter table public.tasks enable trigger tasks_enforce_rules;

alter table public.tasks alter column sort_order set default (extract(epoch from clock_timestamp()) * 1000);
alter table public.tasks alter column sort_order set not null;

create index if not exists tasks_user_date_order_idx
  on public.tasks (user_id, scheduled_date, sort_order)
  where deleted_at is null;
