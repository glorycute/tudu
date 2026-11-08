"use client";

import { cn } from "@/lib/cn";
import { addDays, formatDate, type ISODate } from "@/lib/dates";
import type { Task } from "@/lib/types";

/** Full month grid with a count of open tasks on each date. */
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
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  // Drop a trailing week that is entirely in the next month.
  const visible = days.slice(35).every((d) => d.slice(0, 7) !== month) ? days.slice(0, 35) : days;

  const counts = new Map<ISODate, { open: number; done: number }>();
  for (const t of tasks) {
    if (!t.scheduled_date) continue;
    const c = counts.get(t.scheduled_date) ?? { open: 0, done: 0 };
    if (t.is_completed) c.done++;
    else c.open++;
    counts.set(t.scheduled_date, c);
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-7 border-b border-border pb-2" aria-hidden>
        {visible.slice(0, 7).map((d) => (
          <span key={d} className="text-center text-label text-text-secondary">
            {formatDate(d, { weekday: "short" })}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {visible.map((d) => {
          const inMonth = d.slice(0, 7) === month;
          const c = counts.get(d);
          const total = (c?.open ?? 0) + (c?.done ?? 0);
          const isToday = d === today;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              aria-pressed={selected === d}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${formatDate(d, { weekday: "long", day: "numeric", month: "long" })}${
                total ? `, ${c!.open} open, ${c!.done} done` : ", no tasks"
              }`}
              className={cn(
                "flex min-h-14 flex-col items-center gap-1 border-b border-border pt-2 pb-1.5 sm:min-h-20",
                "hover:bg-hover",
                selected === d && "bg-primary-light",
                !inMonth && "text-text-disabled",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-full text-secondary",
                  isToday && "bg-primary font-semibold text-on-primary",
                  selected === d && !isToday && "font-semibold",
                )}
              >
                {formatDate(d, { day: "numeric" })}
              </span>
              {total > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    "text-label",
                    c!.open > 0 ? "text-text" : "text-text-disabled line-through",
                  )}
                >
                  {c!.open > 0 ? c!.open : total}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
