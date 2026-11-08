import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Calendar" };

export default function Page() {
  return (
    <>
      <PageHeader title="Calendar" />
      <EmptyState
        icon={<CalendarDays className="size-8" />}
        title="Today, This Week and This Month views"
        description="Coming in step 1."
      />
    </>
  );
}
