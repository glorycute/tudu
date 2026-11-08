"use client";

import { Search, X } from "lucide-react";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const SearchInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> & {
    value: string;
    onValueChange: (value: string) => void;
    label?: string;
  }
>(function SearchInput({ value, onValueChange, label = "Search tasks", className, ...props }, ref) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search aria-hidden className="pointer-events-none absolute left-3 size-4 text-text-secondary" />
      <input
        ref={ref}
        type="search"
        aria-label={label}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "h-10 w-full rounded-md border border-border bg-bg pr-9 pl-9 text-body",
          "placeholder:text-text-disabled hover:border-border-strong focus:border-primary focus:outline-none",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onValueChange("")}
          className="absolute right-2 inline-flex size-6 items-center justify-center rounded-sm text-text-secondary hover:bg-hover hover:text-text"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
});
