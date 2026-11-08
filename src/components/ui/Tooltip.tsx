import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Lightweight tooltip shown on hover and keyboard focus.
 * It is decorative: the wrapped control must carry its own accessible name.
 */
export function Tooltip({
  content,
  shortcut,
  side = "top",
  children,
}: {
  content: string;
  shortcut?: string;
  side?: "top" | "bottom";
  children: ReactNode;
}) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap",
          "rounded-sm bg-primary px-2 py-1 text-label text-on-primary opacity-0",
          "transition-opacity duration-100 ease-out",
          "pointer-fine:group-hover/tooltip:opacity-100 group-has-[:focus-visible]/tooltip:opacity-100",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
        )}
      >
        {content}
        {shortcut && <kbd className="ml-2 font-sans text-text-disabled">{shortcut}</kbd>}
      </span>
    </span>
  );
}
