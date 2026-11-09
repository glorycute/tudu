import type { Metadata } from "next";
import { Suspense } from "react";
import { TaskListSkeleton } from "@/components/tasks/TaskListSkeleton";
import { CalendarView } from "./CalendarView";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <Suspense fallback={<TaskListSkeleton />}>
      <CalendarView />
    </Suspense>
  );
}
