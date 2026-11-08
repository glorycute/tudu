import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <>
      <PageHeader title="Settings" />
      <EmptyState
        icon={<Settings className="size-8" />}
        title="Account, timezone and week start"
        description="Coming in step 1."
      />
    </>
  );
}
