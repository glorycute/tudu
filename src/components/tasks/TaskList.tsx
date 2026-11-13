"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Tag } from "lucide-react";
import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/cn";
import { TaskInput } from "@/components/ui/TaskInput";
import { TaskItem } from "@/components/ui/TaskItem";
import { useApp } from "@/lib/app-context";
import {
  formatDate,
  isLockedDate,
  shortDateLabel,
  type ISODate,
} from "@/lib/dates";
import type { Task } from "@/lib/types";
import { parseLeadingTime } from "@/lib/time";
import type { TaskActions } from "@/lib/use-tasks";
import { CategoryDialog } from "./CategoryDialog";
import { RescheduleDialog } from "./RescheduleDialog";

/**
 * One draggable row. Dragging starts after a long press on touch screens,
 * or after a small mouse movement, so taps and clicks still work as usual.
 */
function SortableRow({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled: boolean;
  children: ReactNode;
}) {
  const { setNodeRef, listeners, transform, transition, isDragging } =
    useSortable({ id, disabled });
  // Never start a drag from a text field or an open menu.
  const guarded = Object.fromEntries(
    Object.entries(listeners ?? {}).map(([name, handler]) => [
      name,
      (e: React.SyntheticEvent) => {
        if (
          (e.target as HTMLElement).closest(
            "input, select, textarea, [role=menu]",
          )
        )
          return;
        (handler as (e: React.SyntheticEvent) => void)(e);
      },
    ]),
  );
  return (
    <div
      ref={setNodeRef}
      {...guarded}
      style={{
        transform: transform
          ? `translate3d(0, ${Math.round(transform.y)}px, 0)`
          : undefined,
        transition,
      }}
      className={cn(
        "relative touch-manipulation select-none [-webkit-touch-callout:none]",
        isDragging && "z-20 -mx-2 rounded-md bg-bg px-2 shadow-popover",
      )}
    >
      {children}
    </div>
  );
}

/**
 * Flat list of tasks: open tasks first, then completed ones.
 * Open tasks can be dragged into any order when `actions.reorder` is given.
 * A task whose day ended more than 48 hours ago is read-only.
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
  const { today, categories, habits, loadSuggestions } = useApp();
  const [rescheduling, setRescheduling] = useState<Task | null>(null);
  const [categorizing, setCategorizing] = useState<Task | null>(null);

  const isLocked = (t: Task) => isLockedDate(t.scheduled_date, today);
  const canAdd = addTo !== undefined && !isLockedDate(addTo, today);
  const openTasks = tasks.filter((t) => !t.is_completed);
  const ordered = keepOrder
    ? tasks
    : [...openTasks, ...tasks.filter((t) => t.is_completed)];
  const sortable = !keepOrder && !!actions.reorder;
  // Tasks with a time sit in time order; only the others can be dragged.
  const movable = openTasks.filter((t) => !t.start_time);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
  );
  // A drag ends with a click on the row; swallow it so it doesn't open editing.
  const justDragged = useRef(false);

  const moveTo = (task: Task, newIndex: number) => {
    const oldIndex = movable.findIndex((t) => t.id === task.id);
    if (
      oldIndex < 0 ||
      newIndex < 0 ||
      newIndex >= movable.length ||
      newIndex === oldIndex
    )
      return;
    const moved = arrayMove(movable, oldIndex, newIndex);
    void actions.reorder?.(
      task,
      moved[newIndex - 1] ?? null,
      moved[newIndex + 1] ?? null,
    );
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setTimeout(() => (justDragged.current = false), 0);
    if (!over || active.id === over.id) return;
    const task = movable.find((t) => t.id === active.id);
    if (task)
      moveTo(
        task,
        movable.findIndex((t) => t.id === over.id),
      );
  };
  const categoryFor = (t: Task) =>
    categories.find((c) => c.id === t.category_id) ?? null;

  const metaFor = (t: Task) => {
    const parts: string[] = [];
    if (showDate)
      parts.push(
        t.scheduled_date ? shortDateLabel(t.scheduled_date, today) : "Undated",
      );
    if (showDate && t.is_completed && t.completed_at) {
      parts.push(
        `Done ${formatDate(t.completed_at.slice(0, 10), { day: "numeric", month: "short" })}`,
      );
    }
    return parts.join(" · ") || undefined;
  };

  return (
    <div>
      {ordered.length === 0 && emptyText && (
        <p className="border-b border-border py-3 text-secondary text-text-secondary">
          {emptyText}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={() => {
          justDragged.current = true;
          navigator.vibrate?.(10);
        }}
        onDragEnd={onDragEnd}
        onDragCancel={() => setTimeout(() => (justDragged.current = false), 0)}
      >
        <SortableContext
          items={sortable ? movable.map((t) => t.id) : []}
          strategy={verticalListSortingStrategy}
        >
          <div
            onClickCapture={(e) => {
              if (justDragged.current) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            {ordered.map((t) => {
              const openIndex = movable.indexOf(t);
              const canMove =
                sortable &&
                openIndex >= 0 &&
                !isLocked(t) &&
                !t.id.startsWith("temp-");
              const moveItems = canMove
                ? [
                    ...(openIndex > 0
                      ? [
                          {
                            label: "Move up",
                            icon: <ArrowUp className="size-4" />,
                            onSelect: () => moveTo(t, openIndex - 1),
                          },
                        ]
                      : []),
                    ...(openIndex < movable.length - 1
                      ? [
                          {
                            label: "Move down",
                            icon: <ArrowDown className="size-4" />,
                            onSelect: () => moveTo(t, openIndex + 1),
                          },
                        ]
                      : []),
                  ]
                : [];
              const item = (
                <TaskItem
                  key={t.id}
                  title={t.title}
                  time={t.start_time}
                  completed={t.is_completed}
                  category={categoryFor(t)}
                  meta={metaFor(t)}
                  locked={isLocked(t)}
                  onToggle={(is_completed) =>
                    actions.update(t, { is_completed })
                  }
                  onRename={(title) => {
                    // Typing "9am gym" while renaming sets the time too.
                    const parsed = parseLeadingTime(title);
                    void actions.update(
                      t,
                      parsed
                        ? { title: parsed.title, start_time: parsed.time }
                        : { title },
                    );
                  }}
                  onReschedule={() => setRescheduling(t)}
                  rescheduleLabel={
                    t.scheduled_date === null ? "Schedule" : "Reschedule"
                  }
                  onDelete={() => actions.remove(t)}
                  menuItems={[
                    {
                      label: "Change category",
                      icon: <Tag className="size-4" />,
                      onSelect: () => setCategorizing(t),
                    },
                    ...moveItems,
                  ]}
                />
              );
              return canMove ? (
                <SortableRow key={t.id} id={t.id} disabled={false}>
                  {item}
                </SortableRow>
              ) : (
                item
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {canAdd && (
        <div className="pt-2">
          <TaskInput
            categories={categories}
            habits={habits}
            defaultCategoryId={defaultCategoryId}
            loadSuggestions={loadSuggestions}
            onCreate={(title, categoryId) =>
              actions.create(title, addTo, categoryId)
            }
          />
        </div>
      )}

      <RescheduleDialog
        open={rescheduling !== null}
        current={rescheduling?.scheduled_date ?? null}
        today={today}
        onClose={() => setRescheduling(null)}
        onSave={(scheduled_date) => {
          if (rescheduling)
            void actions.update(rescheduling, { scheduled_date });
          setRescheduling(null);
        }}
      />
      <CategoryDialog
        open={categorizing !== null}
        current={categorizing?.category_id ?? null}
        categories={categories}
        onClose={() => setCategorizing(null)}
        onSave={(category_id) => {
          if (categorizing && category_id !== categorizing.category_id)
            void actions.update(categorizing, { category_id });
          setCategorizing(null);
        }}
      />
    </div>
  );
}
