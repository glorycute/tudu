-- tudu: habits. A habit is a reusable task with a category.
-- Type "/" when adding a task, pick a habit, and it is added to your list.
-- Run once in Supabase: Dashboard > SQL Editor > New query > paste > Run.

create table public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title       text not null check (char_length(btrim(title)) between 1 and 500),
  category_id uuid,
  created_at  timestamptz not null default now(),
  -- Deleting a category keeps the habit and clears its category.
  foreign key (user_id, category_id)
    references public.categories (user_id, id) on delete set null (category_id)
);

create unique index habits_user_title_key on public.habits (user_id, lower(btrim(title)));

alter table public.habits enable row level security;

create policy "Own habits: read"   on public.habits for select to authenticated using ((select auth.uid()) = user_id);
create policy "Own habits: insert" on public.habits for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Own habits: update" on public.habits for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own habits: delete" on public.habits for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.habits from anon;
grant select, insert, update, delete on public.habits to authenticated;
