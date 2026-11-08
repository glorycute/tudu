"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type CalendarViewName = "day" | "week" | "month";

const VIEWS: Array<[CalendarViewName, string]> = [
  ["day", "Day"],
  ["week", "Week"],
  ["month", "Month"],
];

/** Title, view switcher, and previous / today / next navigation. */
export function CalendarHeader({
  label,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
}: {
  label: string;
  view: CalendarViewName;
  onViewChange: (v: CalendarViewName) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const unit = view === "day" ? "day" : view === "week" ? "week" : "month";
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-subheading" aria-live="polite">{label}</h2>
      <div className="flex items-center gap-2">
        <div role="group" aria-label="Calendar view" className="flex rounded-md border border-border p-0.5">
          {VIEWS.map(([v, text]) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => onViewChange(v)}
              className={cn(
                "h-8 rounded-sm px-3 text-secondary font-medium",
                view === v ? "bg-primary text-on-primary" : "text-text-secondary hover:bg-hover hover:text-text",
              )}
            >
              {text}
            </button>
          ))}
        </div>
        <div className="flex items-center rounded-md border border-border">
          <button
            type="button"
            onClick={onPrev}
            aria-label={`Previous ${unit}`}
            className="inline-flex size-9 items-center justify-center rounded-l-md text-text-secondary hover:bg-hover hover:text-text"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="h-9 border-x border-border px-3 text-secondary font-medium hover:bg-hover"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label={`Next ${unit}`}
            className="inline-flex size-9 items-center justify-center rounded-r-md text-text-secondary hover:bg-hover hover:text-text"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
