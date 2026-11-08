# tudu

A minimal, distraction-free daily to-do app. Built with Next.js, Supabase and Vercel.

## Project layout

| Path | What it is |
|---|---|
| `src/app/globals.css` | Design tokens: colors, type scale, radius, spacing. The only place styles are defined. |
| `src/components/ui/` | Shared components (TaskItem, TaskInput, Button, Menu, Dialog, Toast, ...) |
| `src/components/layout/` | App shell: sidebar (desktop), compact rail (tablet), bottom nav (mobile) |
| `src/app/(app)/` | Screens: Today, Inbox, Calendar, Categories, Search, Settings, Design |
| `supabase/migrations/` | Database schema, security rules and task locking |

Visit `/design` to see every token and component in one place.

## Database setup (one time)

1. Open your Supabase project, then **SQL Editor > New query**.
2. Paste the contents of `supabase/migrations/0001_init.sql` and click **Run**.

This creates the `profiles`, `categories` and `tasks` tables, turns on Row Level Security,
and adds the rule that locks a task once its scheduled day has ended in the user's timezone.

## Environment variables

Set these in Vercel (**Project > Settings > Environment Variables**), and in `.env.local` for local work:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Local development

```bash
npm install
npm run dev
```
