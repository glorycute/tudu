"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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
  onPrevYear,
  onNextYear,
}: {
  label: string;
  view: CalendarViewName;
  onViewChange: (v: CalendarViewName) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  /** Month view only: jump a whole year. */
  onPrevYear?: () => void;
  onNextYear?: () => void;
}) {
  const unit = view === "day" ? "day" : view === "week" ? "week" : "month";
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-subheading" aria-live="polite">{label}</h2>
      <div className="flex flex-wrap items-center gap-2">
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
          {onPrevYear && (
            <button
              type="button"
              onClick={onPrevYear}
              aria-label="Previous year"
              className="inline-flex size-9 items-center justify-center rounded-l-md border-r border-border text-text-secondary hover:bg-hover hover:text-text"
            >
              <ChevronsLeft className="size-4" aria-hidden />
            </button>
          )}
          <button
            type="button"
            onClick={onPrev}
            aria-label={`Previous ${unit}`}
            className={cn(
              "inline-flex size-9 items-center justify-center text-text-secondary hover:bg-hover hover:text-text",
              !onPrevYear && "rounded-l-md",
            )}
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
            className={cn(
              "inline-flex size-9 items-center justify-center text-text-secondary hover:bg-hover hover:text-text",
              !onNextYear && "rounded-r-md",
            )}
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
          {onNextYear && (
            <button
              type="button"
              onClick={onNextYear}
              aria-label="Next year"
              className="inline-flex size-9 items-center justify-center rounded-r-md border-l border-border text-text-secondary hover:bg-hover hover:text-text"
            >
              <ChevronsRight className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
