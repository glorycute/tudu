import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AppProvider } from "@/lib/app-context";
import { createClient } from "@/lib/supabase/server";
import type { Category, Profile } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: categories }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!profile) {
    // The profile is created by a database trigger on sign-up. If it is
    // missing, the migration has not been run.
    throw new Error("Your profile could not be loaded. Make sure the database setup has been run.");
  }

  return (
    <AppProvider initialProfile={profile as Profile} initialCategories={(categories ?? []) as Category[]}>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
