import type { Metadata } from "next";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Search" };

export default function Page() {
  return (
    <>
      <PageHeader title="Search" />
      <EmptyState
        icon={<Search className="size-8" />}
        title="Search all your tasks, past and present"
        description="Coming in step 2."
      />
    </>
  );
}
