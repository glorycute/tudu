"use client";

import { useMemo } from "react";
import { CircleCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskListSkeleton } from "@/components/tasks/TaskListSkeleton";
import { useApp } from "@/lib/app-context";
import { useTasks } from "@/lib/use-tasks";

export function TodayView() {
  const { today } = useApp();
  const range = useMemo(() => ({ from: today, to: today }), [today]);
  const { tasks, loading, create, update, remove } = useTasks({ kind: "range", ...range });
  const openCount = tasks.filter((t) => !t.is_completed).length;

  return (
    <>
      <PageHeader
        title="Today"
        subtitle={
          !loading && (
            <>
              <CircleCheck className="size-4" aria-hidden />
              {openCount === 0 && tasks.length > 0
                ? "All done"
                : `${openCount} ${openCount === 1 ? "task" : "tasks"}`}
            </>
          )
        }
      />
      {loading ? (
        <TaskListSkeleton />
      ) : (
        <TaskList addTo={today} tasks={tasks} actions={{ create, update, remove }} />
      )}
    </>
  );
}
