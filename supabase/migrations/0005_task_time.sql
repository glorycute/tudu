-- tudu: optional time of day on a task ("8am gym" -> 08:00 + "gym").
-- Run once in Supabase: Dashboard > SQL Editor > New query > paste > Run.

alter table public.tasks add column if not exists start_time time;
