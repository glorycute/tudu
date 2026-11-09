"use client";

import { Check } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/cn";
import { CATEGORY_COLORS } from "@/lib/categories";
import type { Category } from "@/lib/types";

/** Pick one category for a task, or none. */
export function CategoryDialog({
  open,
  current,
  categories,
  onClose,
  onSave,
}: {
  open: boolean;
  current: string | null;
  categories: Category[];
  onClose: () => void;
  onSave: (categoryId: string | null) => void;
}) {
  const options: Array<{ id: string | null; name: string; dot: string }> = [
    { id: null, name: "No category", dot: "border border-text-disabled" },
    ...categories.map((c) => ({ id: c.id, name: c.name, dot: CATEGORY_COLORS[c.color].dot })),
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Change category"
      description={categories.length === 0 ? "You have no categories yet. Create one on the Categories page." : undefined}
    >
      <div role="radiogroup" aria-label="Category" className="-mx-1 flex flex-col">
        {options.map((o) => {
          const selected = o.id === current;
          return (
            <button
              key={o.id ?? "none"}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSave(o.id)}
              className={cn(
                "flex min-h-touch items-center gap-3 rounded-md px-2 text-left text-body hover:bg-hover",
                selected && "font-medium",
              )}
            >
              <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", o.dot)} />
              <span className="flex-1 truncate">{o.name}</span>
              {selected && <Check className="size-4" aria-hidden />}
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}
