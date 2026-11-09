"use client";

import { useEffect, useId, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/cn";
import { CATEGORY_COLORS } from "@/lib/categories";
import type { Category, CategoryColor } from "@/lib/types";

const COLORS = Object.keys(CATEGORY_COLORS) as CategoryColor[];

/** Create a category, or rename / recolor an existing one. */
export function CategoryFormDialog({
  open,
  category,
  onClose,
  onSave,
}: {
  open: boolean;
  /** null = create a new category */
  category: Category | null;
  onClose: () => void;
  /** Returns an error message to show, or null on success. */
  onSave: (name: string, color: CategoryColor) => Promise<string | null>;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<CategoryColor>("blue");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const nameId = useId();
  const errorId = useId();

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setColor(category?.color ?? "blue");
    setError(null);
  }, [open, category]);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the category a name.");
      return;
    }
    setSaving(true);
    const err = await onSave(trimmed, color);
    setSaving(false);
    if (err) setError(err);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={category ? "Edit category" : "New category"}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={save}>
            {category ? "Save changes" : "Create category"}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label htmlFor={nameId} className="block text-label text-text-secondary">
          Name
        </label>
        <input
          id={nameId}
          autoFocus
          value={name}
          maxLength={50}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          className="mt-1 h-10 w-full rounded-md border border-border-strong bg-bg px-3 text-body focus:border-primary focus:outline-none aria-invalid:border-error"
        />
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-secondary text-error">
            {error}
          </p>
        )}

        <p className="mt-4 text-label text-text-secondary" id={`${nameId}-color`}>
          Color
        </p>
        <div role="radiogroup" aria-labelledby={`${nameId}-color`} className="mt-2 flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={CATEGORY_COLORS[c].label}
              onClick={() => setColor(c)}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full border-2",
                color === c ? "border-primary" : "border-transparent hover:border-border-strong",
              )}
            >
              <span className={cn("inline-flex size-6 items-center justify-center rounded-full text-white", CATEGORY_COLORS[c].dot)}>
                {color === c && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
              </span>
            </button>
          ))}
        </div>
      </form>
    </Dialog>
  );
}
