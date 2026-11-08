import type { Metadata } from "next";
import { Tag } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Categories" };

export default function Page() {
  return (
    <>
      <PageHeader title="Categories" />
      <EmptyState
        icon={<Tag className="size-8" />}
        title="Create categories to organize your tasks"
        description="Coming in step 2."
      />
    </>
  );
}
