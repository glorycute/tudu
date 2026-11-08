-- tudu: initial schema
-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
--
-- Tables: profiles, categories, tasks
-- Security: RLS on every table, explicit grants (new tables are not auto-exposed),
--           and a trigger that locks tasks once their scheduled day has ended
--           in the user's timezone.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          text,
  full_name      text,
  avatar_url     text,
  timezone       text not null default 'UTC',
  week_starts_on smallint not null default 1 check (week_starts_on in (0, 1)), -- 0 = Sunday, 1 = Monday
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Reject unknown IANA timezone names.
create or replace function public.validate_profile_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'Unknown timezone: %', new.timezone using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger profiles_validate_timezone
  before insert or update of timezone on public.profiles
  for each row execute function public.validate_profile_timezone();

-- Create a profile automatically when someone signs up (e.g. with Google).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 50),
  color      text not null default 'gray'
             check (color in ('gray', 'blue', 'green', 'pink', 'orange', 'purple', 'red', 'yellow')),
  created_at timestamptz not null default now(),
  unique (user_id, id)
);

create unique index categories_user_name_key on public.categories (user_id, lower(name));

-- ---------------------------------------------------------------------------
-- Tasks
-- ---------------------------------------------------------------------------
create table public.tasks (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  category_id    uuid,
  title          text not null check (char_length(btrim(title)) between 1 and 500),
  scheduled_date date,                 -- NULL means the task lives in the Inbox
  is_completed   boolean not null default false,
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,          -- soft delete (supports Undo)
  -- A task can only point at a category owned by the same user.
  -- Deleting a category moves its tasks to Uncategorized.
  foreign key (user_id, category_id)
    references public.categories (user_id, id) on delete set null (category_id),
  check (is_completed = (completed_at is not null))
);

create index tasks_user_date_idx     on public.tasks (user_id, scheduled_date) where deleted_at is null;
create index tasks_user_inbox_idx    on public.tasks (user_id, created_at) where scheduled_date is null and deleted_at is null;
create index tasks_user_category_idx on public.tasks (user_id, category_id) where deleted_at is null;
create index tasks_title_trgm_idx    on public.tasks using gin (title extensions.gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- "Today" for a given user, in that user's timezone.
create or replace function public.user_today(uid uuid)
returns date
language sql
stable
security definer
set search_path = ''
as $$
  select (now() at time zone coalesce(
    (select p.timezone from public.profiles p where p.id = uid),
    'UTC'
  ))::date;
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Task rules (enforced in the database, not just the UI)
-- ---------------------------------------------------------------------------
-- 1. A task whose scheduled day has passed is locked: no edits, no completion
--    changes, no rescheduling, no deletes.
--    Exception: deleting a category may still move a locked task to Uncategorized.
-- 2. Tasks cannot be created in, or moved into, the past.
-- 3. completed_at is set and cleared by the database.
-- 4. user_id and created_at never change.
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
    today := public.user_today(old.user_id);
    if old.scheduled_date is not null and old.scheduled_date < today then
      raise exception 'This task is locked because its day has ended.' using errcode = 'P0001';
    end if;
    return old;
  end if;

  today := public.user_today(new.user_id);

  if tg_op = 'INSERT' then
    if new.scheduled_date is not null and new.scheduled_date < today then
      raise exception 'Tasks cannot be scheduled in the past.' using errcode = 'P0001';
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

  if old.scheduled_date is not null and old.scheduled_date < today then
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
    raise exception 'This task is locked because its day has ended.' using errcode = 'P0001';
  end if;

  if new.scheduled_date is not null
     and new.scheduled_date is distinct from old.scheduled_date
     and new.scheduled_date < today then
    raise exception 'Tasks cannot be scheduled in the past.' using errcode = 'P0001';
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

create trigger tasks_enforce_rules
  before insert or update or delete on public.tasks
  for each row execute function public.enforce_task_rules();

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: users can only see and change their own rows
-- ---------------------------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.tasks      enable row level security;

create policy "Own profile: read"   on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Own profile: update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Own categories: read"   on public.categories for select to authenticated using ((select auth.uid()) = user_id);
create policy "Own categories: insert" on public.categories for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Own categories: update" on public.categories for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own categories: delete" on public.categories for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Own tasks: read"   on public.tasks for select to authenticated using ((select auth.uid()) = user_id);
create policy "Own tasks: insert" on public.tasks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Own tasks: update" on public.tasks for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own tasks: delete" on public.tasks for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Grants (the project does not auto-expose new tables, so grant explicitly)
-- ---------------------------------------------------------------------------
revoke all on public.profiles, public.categories, public.tasks from anon;

grant select, update (full_name, timezone, week_starts_on) on public.profiles to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;

revoke execute on function public.user_today(uuid) from public, anon, authenticated;
revoke execute on function public.enforce_task_rules() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
