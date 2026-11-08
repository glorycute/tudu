import Link from "next/link";
import type { ReactNode } from "react";
import { Settings } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-border bg-bg px-4 md:hidden">
          <span className="text-subheading tracking-tight">tudu</span>
          <Link
            href="/settings"
            aria-label="Settings"
            className="-mr-2 inline-flex size-touch items-center justify-center rounded-md text-text-secondary hover:bg-hover hover:text-text"
          >
            <Settings className="size-5" aria-hidden />
          </Link>
        </header>
        <main className="mx-auto w-full max-w-content flex-1 px-4 pt-6 pb-[calc(var(--spacing-bottom-nav)+2rem)] sm:px-8 md:pt-12 md:pb-16">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
