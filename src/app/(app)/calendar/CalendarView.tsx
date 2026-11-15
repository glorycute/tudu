"use client";

import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarHeader, type CalendarViewName } from "@/components/calendar/CalendarHeader";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { MonthStrip } from "@/components/calendar/MonthStrip";
import { WeekStrip } from "@/components/calendar/WeekStrip";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskListSkeleton } from "@/components/tasks/TaskListSkeleton";
import { useApp } from "@/lib/app-context";
import {
  addDays,
  addMonths,
  dayLabel,
  endOfMonth,
  formatDate,
  isLockedDate,
  isValidISODate,
  startOfMonth,
  startOfWeek,
  type ISODate,
} from "@/lib/dates";
import { useTasks } from "@/lib/use-tasks";

const VIEWS: CalendarViewName[] = ["day", "week", "month"];

export function CalendarView() {
  const { today, profile } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const viewParam = params.get("view");
  const view: CalendarViewName = VIEWS.includes(viewParam as CalendarViewName) ? (viewParam as CalendarViewName) : "week";
  const dateParam = params.get("date");
  const date: ISODate = isValidISODate(dateParam) ? dateParam : today;
  const weekStartsOn = profile.week_starts_on;

  const go = (next: { view?: CalendarViewName; date?: ISODate }) => {
    const sp = new URLSearchParams(params);
    sp.set("view", next.view ?? view);
    sp.set("date", next.date ?? date);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const weekStart = startOfWeek(date, weekStartsOn);
  const monthStart = startOfMonth(date);
  const gridStart = startOfWeek(monthStart, weekStartsOn);

  const range = useMemo(() => {
    if (view === "day") return { from: date, to: date };
    if (view === "week") return { from: weekStart, to: addDays(weekStart, 6) };
    return { from: gridStart, to: addDays(startOfWeek(endOfMonth(monthStart), weekStartsOn), 6) };
  }, [view, date, weekStart, gridStart, monthStart, weekStartsOn]);

  const { tasks, loading, create, update, remove, reorder } = useTasks({ kind: "range", ...range });
  const actions = { create, update, remove, reorder };
  const tasksOn = (d: ISODate) => tasks.filter((t) => t.scheduled_date === d);

  const dayTasks = tasksOn(date);
  const dayDone = dayTasks.filter((t) => t.is_completed).length;

  const step = (dir: 1 | -1) => {
    if (view === "day") go({ date: addDays(date, dir) });
    else if (view === "week") go({ date: addDays(date, dir * 7) });
    else go({ date: addMonths(date, dir) });
  };

  const label =
    view === "day"
      ? formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : view === "week"
        ? formatDate(weekStart, { month: "long", year: "numeric" })
        : formatDate(monthStart, { month: "long", year: "numeric" });

  return (
    <>
      <PageHeader title="Calendar" />
      <CalendarHeader
        label={label}
        view={view}
        onViewChange={(v) => go({ view: v })}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onToday={() => go({ date: today })}
        onPrevYear={view === "month" ? () => go({ date: addMonths(date, -12) }) : undefined}
        onNextYear={view === "month" ? () => go({ date: addMonths(date, 12) }) : undefined}
      />

      {view === "week" && (
        <>
          <WeekStrip
            weekStart={weekStart}
            today={today}
            selected={date}
            onSelect={(d) => {
              go({ date: d });
              document.getElementById(`day-${d}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
          {loading ? (
            <TaskListSkeleton />
          ) : (
            Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d) => (
              <section key={d} id={`day-${d}`} aria-labelledby={`day-${d}-h`} className="mb-8 scroll-mt-16">
                <h3
                  id={`day-${d}-h`}
                  className={`border-b border-border pb-2 text-subheading ${isLockedDate(d, today) ? "text-text-disabled" : ""}`}
                >
                  {dayLabel(d, today)}
                </h3>
                <TaskList addTo={d} tasks={tasksOn(d)} actions={actions} emptyText={isLockedDate(d, today) ? "No tasks" : undefined} />
              </section>
            ))
          )}
        </>
      )}

      {view === "month" && (
        <>
          <MonthStrip date={date} today={today} onSelect={(d) => go({ date: d })} />
          <MonthGrid
            gridStart={gridStart}
            month={monthStart.slice(0, 7)}
            today={today}
            selected={date}
            tasks={tasks}
            // Tapping a date opens that day's schedule.
            onSelect={(d) => go({ view: "day", date: d })}
          />
          {loading && <TaskListSkeleton rows={2} />}
        </>
      )}

      {view === "day" && (
        <>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <button
              type="button"
              onClick={() => go({ view: "month" })}
              className="-ml-2 inline-flex h-9 items-center gap-1 rounded-md px-2 text-secondary font-medium text-text-secondary hover:bg-hover hover:text-text"
            >
              <ChevronLeft className="size-4" aria-hidden />
              Month
            </button>
            <p className="flex items-center gap-2 text-secondary text-text-secondary">
              {date === today && (
                <span className="rounded-sm bg-primary px-1.5 text-label text-on-primary">Today</span>
              )}
              {dayTasks.length === 0
                ? "Nothing scheduled"
                : `${dayTasks.length - dayDone} open · ${dayDone} done`}
            </p>
          </div>
          {loading ? (
            <TaskListSkeleton />
          ) : (
            <TaskList
              addTo={date}
              tasks={dayTasks}
              actions={actions}
              emptyText={isLockedDate(date, today) ? "No tasks" : "Nothing scheduled for this day. Add a task below."}
            />
          )}
        </>
      )}
    </>
  );
}
