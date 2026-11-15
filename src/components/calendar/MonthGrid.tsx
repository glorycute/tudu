"use client";

import { cn } from "@/lib/cn";
import { CATEGORY_COLORS } from "@/lib/categories";
import { addDays, formatDate, type ISODate } from "@/lib/dates";
import { formatTimeOfDay } from "@/lib/time";
import { useApp } from "@/lib/app-context";
import type { Category, Task } from "@/lib/types";

const MAX_CHIPS = 3;

/** Chip colors: filled with the category color, or neutral when uncategorized. */
const chipColor = (c: Category | undefined) => (c ? `${CATEGORY_COLORS[c.color].fill} text-text` : "bg-active text-text");

/**
 * Full month grid. Each date shows its real tasks as filled chips colored by
 * category (title on phones, time + title from tablet width up).
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
            <span className="sm:hidden">{formatDate(d, { weekday: "narrow" })}</span>
            <span className="hidden sm:inline">{formatDate(d, { weekday: "short" })}</span>
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
                "flex min-h-24 min-w-0 flex-col items-stretch gap-1 overflow-hidden border-r border-b border-border p-0.5 text-left",
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

              {list.length > 0 && (
                <span aria-hidden className="flex min-w-0 flex-col gap-0.5">
                  {list.slice(0, MAX_CHIPS).map((t) => (
                    <span
                      key={t.id}
                      className={cn(
                        "flex min-w-0 items-center gap-1 rounded-sm px-1 text-label",
                        chipColor(categoryOf(t)),
                        t.is_completed && "line-through opacity-50",
                      )}
                    >
                      {t.start_time && (
                        <span className="hidden shrink-0 sm:inline">{formatTimeOfDay(t.start_time)}</span>
                      )}
                      <span className="truncate">{t.title}</span>
                    </span>
                  ))}
                  {extra > 0 && <span className="px-1 text-label text-text-secondary">+{extra}</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
