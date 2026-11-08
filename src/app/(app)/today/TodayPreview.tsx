"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskInput, TaskItem, useToast } from "@/components/ui";
import type { Category } from "@/lib/types";

type DemoTask = { id: number; title: string; completed: boolean; category: Pick<Category, "name" | "color"> | null };

/**
 * Step 0 preview of the Today screen using local state only.
 * Step 1 replaces this with real Supabase data.
 */
export function TodayPreview() {
  const toast = useToast();
  const [tasks, setTasks] = useState<DemoTask[]>([
    { id: 1, title: "Matcha", completed: false, category: { name: "Personal", color: "green" } },
    { id: 2, title: "Pickleball training", completed: false, category: { name: "Health", color: "pink" } },
  ]);

  const update = (id: number, patch: Partial<DemoTask>) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const remove = (task: DemoTask) => {
    setTasks((ts) => ts.filter((t) => t.id !== task.id));
    toast({
      message: "Task deleted",
      action: { label: "Undo", onClick: () => setTasks((ts) => [...ts, task].sort((a, b) => a.id - b.id)) },
    });
  };

  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <>
      <PageHeader
        title="Today"
        subtitle={
          <>
            <CircleCheck className="size-4" aria-hidden />
            {open.length} {open.length === 1 ? "task" : "tasks"}
          </>
        }
      />
      <p className="mb-4 rounded-md bg-surface px-3 py-2 text-secondary text-text-secondary">
        Preview: changes here are not saved yet. Saving arrives with Google sign-in in step 1.
      </p>

      <div>
        {[...open, ...done].map((t) => (
          <TaskItem
            key={t.id}
            title={t.title}
            completed={t.completed}
            category={t.category}
            onToggle={(completed) => update(t.id, { completed })}
            onRename={(title) => update(t.id, { title })}
            onDelete={() => remove(t)}
          />
        ))}
        <div className="pt-2">
          <TaskInput
            onCreate={(title) =>
              setTasks((ts) => [...ts, { id: Date.now(), title, completed: false, category: null }])
            }
          />
        </div>
      </div>
    </>
  );
}
