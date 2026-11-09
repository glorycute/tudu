"use client";

import { useEffect, useId, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskListSkeleton } from "@/components/tasks/TaskListSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { useApp } from "@/lib/app-context";
import { useTasks, type TaskQuery } from "@/lib/use-tasks";

type When = "" | "undated" | "past" | "today" | "upcoming";
type Status = "" | "open" | "done";

const selectClass =
  "h-9 w-full rounded-md border border-border bg-bg px-2 text-secondary hover:border-border-strong focus:border-primary focus:outline-none";

function Filter({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-label text-text-secondary">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {children}
      </select>
    </div>
  );
}

/** Find any task, past or present, by title, category, date and status. */
export function SearchView() {
  const { categories, today } = useApp();
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("");
  const [when, setWhen] = useState<When>("");
  const [status, setStatus] = useState<Status>("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(text), 250);
    return () => clearTimeout(id);
  }, [text]);

  const active = debounced.trim() !== "" || category !== "" || when !== "" || status !== "";
  const query: TaskQuery = {
    kind: "search",
    text: debounced,
    category: category || undefined,
    when: when || undefined,
    status: status || undefined,
    today,
  };
  const { tasks, loading, create, update, remove } = useTasks(query, { enabled: active });

  return (
    <>
      <PageHeader title="Search" />
      <SearchInput value={text} onValueChange={setText} placeholder="Search task titles" autoFocus />
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Filter label="Category" value={category} onChange={setCategory}>
          <option value="">All categories</option>
          <option value="none">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Filter>
        <Filter label="Date" value={when} onChange={(v) => setWhen(v as When)}>
          <option value="">Any date</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="undated">Undated (Inbox)</option>
        </Filter>
        <Filter label="Status" value={status} onChange={(v) => setStatus(v as Status)}>
          <option value="">Any status</option>
          <option value="open">Not done</option>
          <option value="done">Done</option>
        </Filter>
      </div>

      <div className="mt-6" aria-live="polite">
        {!active ? (
          <EmptyState
            icon={<Search className="size-8" />}
            title="Search all your tasks"
            description="Type part of a title, or pick a filter. Past tasks stay searchable forever."
          />
        ) : loading ? (
          <TaskListSkeleton />
        ) : tasks.length === 0 ? (
          <EmptyState title="No tasks found" description="Try fewer words or a different filter." />
        ) : (
          <>
            <p className="mb-1 text-secondary text-text-secondary">
              {tasks.length >= 200 ? "Showing the first 200 tasks" : `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`}
            </p>
            <TaskList tasks={tasks} actions={{ create, update, remove }} showDate keepOrder />
          </>
        )}
      </div>
    </>
  );
}
