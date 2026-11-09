"use client";

import { useState } from "react";
import { TaskInput } from "@/components/ui/TaskInput";
import { TaskItem } from "@/components/ui/TaskItem";
import { useApp } from "@/lib/app-context";
import type { ISODate } from "@/lib/dates";
import type { Task } from "@/lib/types";
import { RescheduleDialog } from "./RescheduleDialog";

type Actions = {
  create: (title: string, date: ISODate) => void;
  update: (task: Task, patch: Partial<Pick<Task, "title" | "is_completed" | "scheduled_date">>) => void;
  remove: (task: Task) => void;
};

/**
 * Flat list of tasks for one day: open tasks first, then completed ones.
 * Past days are read-only.
 */
export function TaskList({
  date,
  tasks,
  actions,
  emptyText,
}: {
  date: ISODate;
  tasks: Task[];
  actions: Actions;
  emptyText?: string;
}) {
  const { today, categories } = useApp();
  const [rescheduling, setRescheduling] = useState<Task | null>(null);
  const locked = date < today;

  const ordered = [...tasks.filter((t) => !t.is_completed), ...tasks.filter((t) => t.is_completed)];
  const categoryFor = (t: Task) => categories.find((c) => c.id === t.category_id) ?? null;

  return (
    <div>
      {ordered.length === 0 && emptyText && (
        <p className="border-b border-border py-3 text-secondary text-text-secondary">{emptyText}</p>
      )}

      {ordered.map((t) => (
        <TaskItem
          key={t.id}
          title={t.title}
          completed={t.is_completed}
          category={categoryFor(t)}
          locked={locked}
          onToggle={(is_completed) => actions.update(t, { is_completed })}
          onRename={(title) => actions.update(t, { title })}
          onReschedule={() => setRescheduling(t)}
          onDelete={() => actions.remove(t)}
        />
      ))}

      {!locked && (
        <div className="pt-2">
          <TaskInput onCreate={(title) => actions.create(title, date)} />
        </div>
      )}

      <RescheduleDialog
        open={rescheduling !== null}
        current={rescheduling?.scheduled_date ?? null}
        today={today}
        onClose={() => setRescheduling(null)}
        onSave={(scheduled_date) => {
          if (rescheduling) actions.update(rescheduling, { scheduled_date });
          setRescheduling(null);
        }}
      />
    </div>
  );
}
