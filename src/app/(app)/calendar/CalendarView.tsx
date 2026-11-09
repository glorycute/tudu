"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarHeader, type CalendarViewName } from "@/components/calendar/CalendarHeader";
import { MonthGrid } from "@/components/calendar/MonthGrid";
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

  const { tasks, loading, create, update, remove } = useTasks({ kind: "range", ...range });
  const actions = { create, update, remove };
  const tasksOn = (d: ISODate) => tasks.filter((t) => t.scheduled_date === d);

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
                  className={`border-b border-border pb-2 text-subheading ${d < today ? "text-text-secondary" : ""}`}
                >
                  {dayLabel(d, today)}
                </h3>
                <TaskList addTo={d} tasks={tasksOn(d)} actions={actions} emptyText={d < today ? "No tasks" : undefined} />
              </section>
            ))
          )}
        </>
      )}

      {view === "month" && (
        <>
          <MonthGrid
            gridStart={gridStart}
            month={monthStart.slice(0, 7)}
            today={today}
            selected={date}
            tasks={tasks}
            onSelect={(d) => go({ date: d })}
          />
          <h3 className="border-b border-border pb-2 text-subheading">{dayLabel(date, today)}</h3>
          {loading ? (
            <TaskListSkeleton rows={2} />
          ) : (
            <TaskList addTo={date} tasks={tasksOn(date)} actions={actions} emptyText={date < today ? "No tasks" : undefined} />
          )}
        </>
      )}

      {view === "day" && (
        <>
          <h3 className="border-b border-border pb-2 text-subheading">{dayLabel(date, today)}</h3>
          {loading ? (
            <TaskListSkeleton />
          ) : (
            <TaskList addTo={date} tasks={tasksOn(date)} actions={actions} emptyText={date < today ? "No tasks" : undefined} />
          )}
        </>
      )}
    </>
  );
}
