-- tudu: lock tasks 48 hours after their scheduled day ends (instead of at midnight).
-- Run once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
--
-- Example: a task scheduled for Monday stays editable through Wednesday and
-- locks at midnight going into Thursday, in the user's timezone.

-- Number of days a finished day stays editable. Change it here only.
create or replace function public.lock_grace_days()
returns integer
language sql
immutable
set search_path = ''
as $$
  select 2;
$$;

-- True when a task scheduled on day d is read-only for this user.
create or replace function public.is_locked_date(d date, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select d is not null and d < public.user_today(uid) - public.lock_grace_days();
$$;

-- Same rules as before, with the new lock boundary:
-- 1. A locked task can't be edited, completed, rescheduled or deleted.
--    Exception: deleting a category may still move it to Uncategorized.
-- 2. New tasks can be added to any day that isn't locked.
-- 3. A task can't be moved to an earlier day than today.
-- 4. completed_at is set and cleared by the database; user_id and created_at never change.
create or replace function public.enforce_task_rules()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date;
begin
  if tg_op = 'DELETE' then
    if public.is_locked_date(old.scheduled_date, old.user_id) then
      raise exception 'This task is locked because its day ended more than 48 hours ago.' using errcode = 'P0001';
    end if;
    return old;
  end if;

  today := public.user_today(new.user_id);

  if tg_op = 'INSERT' then
    if public.is_locked_date(new.scheduled_date, new.user_id) then
      raise exception 'Tasks can''t be added to a day that is locked.' using errcode = 'P0001';
    end if;
    new.deleted_at := null;
    new.completed_at := case when new.is_completed then now() else null end;
    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;

  -- UPDATE
  new.user_id := old.user_id;
  new.created_at := old.created_at;

  if public.is_locked_date(old.scheduled_date, old.user_id) then
    -- Only allowed change: category removed because the category was deleted.
    if new.category_id is null
       and old.category_id is not null
       and new.title is not distinct from old.title
       and new.scheduled_date is not distinct from old.scheduled_date
       and new.is_completed is not distinct from old.is_completed
       and new.completed_at is not distinct from old.completed_at
       and new.deleted_at is not distinct from old.deleted_at
       and not exists (select 1 from public.categories c where c.id = old.category_id) then
      new.updated_at := now();
      return new;
    end if;
    raise exception 'This task is locked because its day ended more than 48 hours ago.' using errcode = 'P0001';
  end if;

  if new.scheduled_date is not null
     and new.scheduled_date is distinct from old.scheduled_date
     and new.scheduled_date < today then
    raise exception 'Tasks can''t be moved to a past day.' using errcode = 'P0001';
  end if;

  if new.is_completed and not old.is_completed then
    new.completed_at := now();
  elsif not new.is_completed then
    new.completed_at := null;
  else
    new.completed_at := old.completed_at;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.lock_grace_days() from public, anon, authenticated;
revoke execute on function public.is_locked_date(date, uuid) from public, anon, authenticated;
revoke execute on function public.enforce_task_rules() from public, anon, authenticated;
