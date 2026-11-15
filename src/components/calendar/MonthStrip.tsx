"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import type { ISODate } from "@/lib/dates";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Scrollable row of the 12 months of the shown year. Tap one to jump to it. */
export function MonthStrip({
  date,
  today,
  onSelect,
}: {
  date: ISODate;
  today: ISODate;
  onSelect: (d: ISODate) => void;
}) {
  const year = date.slice(0, 4);
  const month = Number(date.slice(5, 7));
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Keep the selected month in view when the strip scrolls sideways.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [year, month]);

  return (
    <div
      role="group"
      aria-label={`Months of ${year}`}
      className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-8 sm:px-8 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
    >
      <span className="flex shrink-0 items-center px-1 text-secondary font-medium text-text-secondary">{year}</span>
      {MONTHS.map((name, i) => {
        const m = i + 1;
        const selected = m === month;
        const first = `${year}-${String(m).padStart(2, "0")}-01`;
        // The current month opens on today instead of the 1st.
        const target = first.slice(0, 7) === today.slice(0, 7) ? today : first;
        return (
          <button
            key={name}
            ref={selected ? selectedRef : undefined}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(target)}
            className={cn(
              "h-9 shrink-0 rounded-md border px-3 text-secondary font-medium",
              selected
                ? "border-primary bg-primary text-on-primary"
                : "border-border text-text-secondary hover:bg-hover hover:text-text",
            )}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
