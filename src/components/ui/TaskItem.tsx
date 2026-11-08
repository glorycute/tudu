"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Ellipsis, Lock, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";
import { TaskCheck } from "./TaskCheck";
import { CategoryBadge } from "./CategoryBadge";
import { Menu, type MenuItem } from "./Menu";

export type TaskItemProps = {
  title: string;
  completed: boolean;
  category?: Pick<Category, "name" | "color"> | null;
  /** Optional meta shown on the left of the bottom line, e.g. a date. */
  meta?: string;
  /** Locked tasks are read-only (their day has ended). */
  locked?: boolean;
  onToggle?: (completed: boolean) => void;
  onRename?: (title: string) => void;
  onReschedule?: () => void;
  onDelete?: () => void;
  /** Extra menu items (e.g. "Change category"). */
  menuItems?: MenuItem[];
};

/**
 * One row in a task list: circle check, title (click to edit), and the
 * category label on the right of the second line.
 */
export function TaskItem({
  title,
  completed,
  category,
  meta,
  locked = false,
  onToggle,
  onRename,
  onReschedule,
  onDelete,
  menuItems = [],
}: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEditing = () => {
    if (locked || !onRename) return;
    setDraft(title);
    setEditing(true);
  };

  const save = () => {
    const next = draft.trim();
    setEditing(false);
    if (next && next !== title) onRename?.(next);
  };

  const items: MenuItem[] = [
    ...(onReschedule
      ? [
          {
            label: "Reschedule",
            icon: <CalendarDays className="size-4" />,
            onSelect: onReschedule,
          },
        ]
      : []),
    ...menuItems,
    ...(onDelete
      ? [
          {
            label: "Delete",
            icon: <Trash2 className="size-4" />,
            onSelect: onDelete,
            destructive: true,
          },
        ]
      : []),
  ];

  return (
    <div className="group/task flex gap-3 border-b border-border py-3 pointer-fine:hover:bg-surface/60">
      <div className="pt-0.5">
        <TaskCheck
          checked={completed}
          onChange={(c) => onToggle?.(c)}
          disabled={locked || !onToggle}
          label={title}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                ref={inputRef}
                aria-label="Task title"
                value={draft}
                maxLength={500}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={save}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    save();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setDraft(title);
                    setEditing(false);
                  }
                }}
                className="-mx-1 w-full rounded-sm bg-transparent px-1 text-body outline-none ring-1 ring-border-strong focus:ring-primary"
              />
            ) : (
              <button
                type="button"
                onClick={startEditing}
                disabled={locked || !onRename}
                aria-label={locked ? `${title} (locked)` : `Edit "${title}"`}
                className={cn(
                  "-mx-1 block w-full rounded-sm px-1 text-left text-body break-words",
                  "disabled:cursor-default",
                  completed ? "text-text-disabled line-through" : "text-text",
                )}
              >
                {title}
              </button>
            )}
          </div>
          {!locked && items.length > 0 && (
            <Menu
              items={items}
              trigger={(p) => (
                <button
                  {...p}
                  type="button"
                  aria-label={`Actions for "${title}"`}
                  className={cn(
                    "relative inline-flex size-7 shrink-0 items-center justify-center rounded-md text-text-secondary",
                    "hover:bg-hover hover:text-text after:absolute after:-inset-2 after:content-['']",
                    // Always visible on touch; fades in on hover/focus with a mouse.
                    "pointer-fine:opacity-0 pointer-fine:group-hover/task:opacity-100 pointer-fine:focus-visible:opacity-100",
                    "pointer-fine:aria-expanded:opacity-100",
                  )}
                >
                  <Ellipsis className="size-4" aria-hidden />
                </button>
              )}
            />
          )}
        </div>

        <div className="mt-1 flex min-h-5 items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-secondary text-text-secondary">
            {locked && <Lock className="size-3.5" aria-label="Locked" />}
            {meta}
          </span>
          {category && (
            <CategoryBadge name={category.name} color={category.color} />
          )}
        </div>
      </div>
    </div>
  );
}
