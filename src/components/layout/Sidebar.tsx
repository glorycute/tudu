"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "./nav";

/** Desktop: full sidebar. Tablet: compact icon rail. Hidden on mobile. */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="sticky top-0 hidden h-dvh self-start w-sidebar-compact shrink-0 flex-col border-r border-border bg-surface md:flex lg:w-sidebar"
    >
      <div className="flex h-14 items-center justify-center px-3 lg:justify-start lg:px-5">
        <span className="text-subheading tracking-tight">
          <span className="lg:hidden" aria-hidden>t</span>
          <span className="max-lg:sr-only">tudu</span>
        </span>
      </div>
      <ul className="flex flex-1 flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className={href === "/settings" ? "mt-auto mb-3" : undefined}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                title={label}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-md px-2.5 text-body max-lg:justify-center",
                  "transition-colors duration-150 ease-out",
                  active ? "bg-active font-medium text-text" : "text-text-secondary hover:bg-hover hover:text-text",
                )}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                <span className="max-lg:sr-only">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
