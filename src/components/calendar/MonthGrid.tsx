"use client";

import { cn } from "@/lib/cn";
import { CATEGORY_COLORS } from "@/lib/categories";
import { addDays, formatDate, type ISODate } from "@/lib/dates";
import { formatTimeOfDay } from "@/lib/time";
import { useApp } from "@/lib/app-context";
import type { Category, Task } from "@/lib/types";

const MAX_CHIPS = 3;
const MAX_DOTS = 4;

function Dot({ category, className }: { category: Category | undefined; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block shrink-0 rounded-full",
        category ? CATEGORY_COLORS[category.color].dot : "border border-text-disabled",
        className,
      )}
    />
  );
}

/**
 * Full month grid. Each date shows its real tasks: color dots on phones,
 * labelled chips (time + title, colored by category) from tablet width up.
 * Selecting a date is handled by the parent, which opens the daily view.
 */
export function MonthGrid({
  gridStart,
  month,
  today,
  selected,
  tasks,
  onSelect,
}: {
  gridStart: ISODate;
  /** "YYYY-MM" of the month being shown. */
  month: string;
  today: ISODate;
  selected: ISODate;
  tasks: Task[];
  onSelect: (d: ISODate) => void;
}) {
  const { categories } = useApp();
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  // Drop a trailing week that is entirely in the next month.
  const visible = days.slice(35).every((d) => d.slice(0, 7) !== month) ? days.slice(0, 35) : days;

  // Group tasks by date: open ones first (already in time order), done ones last.
  const byDate = new Map<ISODate, Task[]>();
  for (const t of tasks) {
    if (!t.scheduled_date) continue;
    byDate.set(t.scheduled_date, [...(byDate.get(t.scheduled_date) ?? []), t]);
  }
  for (const [d, list] of byDate) {
    byDate.set(d, [...list.filter((t) => !t.is_completed), ...list.filter((t) => t.is_completed)]);
  }
  const categoryOf = (t: Task) => categories.find((c) => c.id === t.category_id);

  return (
    <div className="mb-6">
      <div className="grid grid-cols-7 pb-2" aria-hidden>
        {visible.slice(0, 7).map((d) => (
          <span key={d} className="text-center text-label text-text-secondary">
            {formatDate(d, { weekday: "short" })}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 overflow-hidden rounded-lg border-t border-l border-border">
        {visible.map((d) => {
          const inMonth = d.slice(0, 7) === month;
          const list = byDate.get(d) ?? [];
          const open = list.filter((t) => !t.is_completed).length;
          const done = list.length - open;
          const isToday = d === today;
          const isSelected = selected === d;
          const extra = list.length - MAX_CHIPS;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${formatDate(d, { weekday: "long", day: "numeric", month: "long" })}${
                list.length ? `, ${open} open, ${done} done` : ", no tasks"
              }`}
              className={cn(
                "flex min-h-16 min-w-0 flex-col items-stretch gap-1 border-r border-b border-border p-1 text-left",
                "sm:min-h-28 sm:p-1.5",
                "hover:bg-hover",
                !inMonth && "bg-surface",
                isSelected && "bg-primary-light shadow-[inset_0_0_0_2px_var(--color-primary)]",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center self-center rounded-full text-secondary sm:self-start",
                  !inMonth && "text-text-disabled",
                  isToday && "bg-primary font-semibold text-on-primary",
                  isSelected && !isToday && "font-semibold",
                )}
              >
                {formatDate(d, { day: "numeric" })}
              </span>

              {/* Phones: one dot per task, colored by category. */}
              {list.length > 0 && (
                <span aria-hidden className="flex flex-wrap justify-center gap-0.5 sm:hidden">
                  {list.slice(0, MAX_DOTS).map((t) => (
                    <Dot key={t.id} category={categoryOf(t)} className={cn("size-1.5", t.is_completed && "opacity-40")} />
                  ))}
                  {list.length > MAX_DOTS && (
                    <span className="text-label leading-none text-text-secondary">+</span>
                  )}
                </span>
              )}

              {/* Tablet and up: labelled chips. */}
              {list.length > 0 && (
                <span aria-hidden className="hidden min-w-0 flex-col gap-0.5 sm:flex">
                  {list.slice(0, MAX_CHIPS).map((t) => (
                    <span
                      key={t.id}
                      className={cn(
                        "flex min-w-0 items-center gap-1 rounded-sm bg-surface px-1 text-label",
                        t.is_completed ? "text-text-disabled line-through" : "text-text",
                      )}
                    >
                      <Dot category={categoryOf(t)} className="size-1.5" />
                      {t.start_time && (
                        <span className="shrink-0 text-text-secondary no-underline">{formatTimeOfDay(t.start_time)}</span>
                      )}
                      <span className="truncate">{t.title}</span>
                    </span>
                  ))}
                  {extra > 0 && <span className="px-1 text-label text-text-secondary">+{extra} more</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
