"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Inline "Add task" row. Type and press Enter to save; the input stays open
 * and empty for the next task. Escape closes it.
 */
export function TaskInput({
  onCreate,
  placeholder = "Task name",
}: {
  onCreate: (title: string) => void | Promise<void>;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const submit = async () => {
    const title = value.trim();
    if (!title) return;
    setValue("");
    await onCreate(title);
    inputRef.current?.focus();
  };

  if (!open) {
    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        className="group/add flex min-h-touch w-full items-center gap-3 rounded-md text-left text-body text-text-secondary hover:text-text"
      >
        <span className="inline-flex size-5 items-center justify-center rounded-full text-text group-hover/add:bg-primary group-hover/add:text-on-primary">
          <Plus className="size-4" aria-hidden />
        </span>
        Add task
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="rounded-lg border border-border-strong p-2 focus-within:border-primary"
    >
      <input
        ref={inputRef}
        autoFocus
        aria-label="New task"
        value={value}
        maxLength={500}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setValue("");
            setOpen(false);
            requestAnimationFrame(() => buttonRef.current?.focus());
          }
        }}
        className="h-9 w-full bg-transparent px-1 text-body outline-none placeholder:text-text-disabled"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setValue("");
            setOpen(false);
          }}
          className="h-8 rounded-md px-3 text-secondary font-medium text-text hover:bg-hover"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!value.trim()}
          className={cn(
            "h-8 rounded-md bg-primary px-3 text-secondary font-medium text-on-primary hover:bg-primary-hover",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          Add task
        </button>
      </div>
    </form>
  );
}
