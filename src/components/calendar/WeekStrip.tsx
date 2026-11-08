"use client";

import { cn } from "@/lib/cn";
import { addDays, formatDate, type ISODate } from "@/lib/dates";

/** Row of 7 days. Today is shown as a black badge. */
export function WeekStrip({
  weekStart,
  today,
  selected,
  onSelect,
}: {
  weekStart: ISODate;
  today: ISODate;
  selected?: ISODate;
  onSelect: (d: ISODate) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  return (
    <div className="mb-6 grid grid-cols-7 border-b border-border">
      {days.map((d) => {
        const isToday = d === today;
        const past = d < today;
        return (
          <button
            key={d}
            type="button"
            onClick={() => onSelect(d)}
            aria-label={formatDate(d, { weekday: "long", day: "numeric", month: "long" })}
            aria-current={isToday ? "date" : undefined}
            className={cn(
              "flex min-h-touch flex-col items-center justify-center gap-0.5 rounded-t-md pb-2 sm:flex-row sm:gap-1.5",
              "hover:bg-hover",
              selected === d && "shadow-[inset_0_-2px_0_var(--color-primary)]",
              past ? "text-text-disabled" : "text-text",
            )}
          >
            <span className={cn("text-label sm:text-body", isToday && "font-semibold")}>
              {formatDate(d, { weekday: "short" })}
            </span>
            <span
              className={cn(
                "inline-flex min-w-6 items-center justify-center rounded-sm px-1 text-secondary sm:text-body",
                isToday && "bg-primary font-semibold text-on-primary",
              )}
            >
              {formatDate(d, { day: "numeric" })}
            </span>
          </button>
        );
      })}
    </div>
  );
}
