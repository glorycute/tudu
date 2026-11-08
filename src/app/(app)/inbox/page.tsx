import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Inbox" };

export default function Page() {
  return (
    <>
      <PageHeader title="Inbox" />
      <EmptyState
        icon={<Inbox className="size-8" />}
        title="Tasks without a date will live here"
        description="Coming in step 2."
      />
    </>
  );
}
