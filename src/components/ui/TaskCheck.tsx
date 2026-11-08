"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/** Circular checkbox for tasks. Status is shown by shape (empty vs. check), not color alone. */
export function TaskCheck({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Accessible label, e.g. the task title. */
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? `Mark "${label}" as not done` : `Mark "${label}" as done`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "group/check relative inline-flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px]",
        "transition-colors duration-150 ease-out",
        "after:absolute after:-inset-3 after:content-['']", // 44px hit area
        checked
          ? "border-primary bg-primary text-on-primary"
          : "border-text-secondary text-transparent pointer-fine:hover:text-text-secondary",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <Check className="size-3" strokeWidth={3} aria-hidden />
    </button>
  );
}
