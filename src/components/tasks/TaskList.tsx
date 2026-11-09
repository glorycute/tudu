"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import { TaskInput } from "@/components/ui/TaskInput";
import { TaskItem } from "@/components/ui/TaskItem";
import { useApp } from "@/lib/app-context";
import { formatDate, shortDateLabel, type ISODate } from "@/lib/dates";
import type { Task } from "@/lib/types";
import type { TaskActions } from "@/lib/use-tasks";
import { CategoryDialog } from "./CategoryDialog";
import { RescheduleDialog } from "./RescheduleDialog";

/**
 * Flat list of tasks: open tasks first, then completed ones.
 * A task whose day has passed is read-only.
 */
export function TaskList({
  tasks,
  actions,
  addTo,
  defaultCategoryId = null,
  showDate = false,
  keepOrder = false,
  emptyText,
}: {
  tasks: Task[];
  actions: TaskActions;
  /** Where new tasks go: a date, null for the Inbox, or undefined for no "Add task" row. */
  addTo?: ISODate | null;
  defaultCategoryId?: string | null;
  /** Show each task's date (or "Undated") under its title. */
  showDate?: boolean;
  /** Keep the given order instead of moving completed tasks to the end. */
  keepOrder?: boolean;
  emptyText?: string;
}) {
  const { today, categories, loadSuggestions } = useApp();
  const [rescheduling, setRescheduling] = useState<Task | null>(null);
  const [categorizing, setCategorizing] = useState<Task | null>(null);

  const isLocked = (t: Task) => t.scheduled_date !== null && t.scheduled_date < today;
  const canAdd = addTo !== undefined && (addTo === null || addTo >= today);
  const ordered = keepOrder
    ? tasks
    : [...tasks.filter((t) => !t.is_completed), ...tasks.filter((t) => t.is_completed)];
  const categoryFor = (t: Task) => categories.find((c) => c.id === t.category_id) ?? null;

  const metaFor = (t: Task) => {
    const parts: string[] = [];
    if (showDate) parts.push(t.scheduled_date ? shortDateLabel(t.scheduled_date, today) : "Undated");
    if (showDate && t.is_completed && t.completed_at) {
      parts.push(`Done ${formatDate(t.completed_at.slice(0, 10), { day: "numeric", month: "short" })}`);
    }
    return parts.join(" · ") || undefined;
  };

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
          meta={metaFor(t)}
          locked={isLocked(t)}
          onToggle={(is_completed) => actions.update(t, { is_completed })}
          onRename={(title) => actions.update(t, { title })}
          onReschedule={() => setRescheduling(t)}
          rescheduleLabel={t.scheduled_date === null ? "Schedule" : "Reschedule"}
          onDelete={() => actions.remove(t)}
          menuItems={[{ label: "Change category", icon: <Tag className="size-4" />, onSelect: () => setCategorizing(t) }]}
        />
      ))}

      {canAdd && (
        <div className="pt-2">
          <TaskInput
            categories={categories}
            defaultCategoryId={defaultCategoryId}
            loadSuggestions={loadSuggestions}
            onCreate={(title, categoryId) => actions.create(title, addTo, categoryId)}
          />
        </div>
      )}

      <RescheduleDialog
        open={rescheduling !== null}
        current={rescheduling?.scheduled_date ?? null}
        today={today}
        onClose={() => setRescheduling(null)}
        onSave={(scheduled_date) => {
          if (rescheduling) void actions.update(rescheduling, { scheduled_date });
          setRescheduling(null);
        }}
      />
      <CategoryDialog
        open={categorizing !== null}
        current={categorizing?.category_id ?? null}
        categories={categories}
        onClose={() => setCategorizing(null)}
        onSave={(category_id) => {
          if (categorizing && category_id !== categorizing.category_id) void actions.update(categorizing, { category_id });
          setCategorizing(null);
        }}
      />
    </div>
  );
}
