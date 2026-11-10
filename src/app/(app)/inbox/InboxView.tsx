"use client";

import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskListSkeleton } from "@/components/tasks/TaskListSkeleton";
import { useTasks } from "@/lib/use-tasks";

const QUERY = { kind: "inbox" } as const;

/** Tasks with no date. They never lock, and can be scheduled at any time. */
export function InboxView() {
  const { tasks, loading, create, update, remove, reorder } = useTasks(QUERY);
  const open = tasks.filter((t) => !t.is_completed).length;

  return (
    <>
      <PageHeader
        title="Inbox"
        subtitle={
          !loading && (
            <>
              <Inbox className="size-4" aria-hidden />
              {open} undated {open === 1 ? "task" : "tasks"}
            </>
          )
        }
      />
      {loading ? (
        <TaskListSkeleton />
      ) : (
        <>
          {tasks.length === 0 && (
            <p className="mb-2 text-secondary text-text-secondary">
              Capture tasks here when you don&apos;t know when you&apos;ll do them yet. Schedule them later from the ⋯ menu.
            </p>
          )}
          <TaskList addTo={null} tasks={tasks} actions={{ create, update, remove, reorder }} />
        </>
      )}
    </>
  );
}
