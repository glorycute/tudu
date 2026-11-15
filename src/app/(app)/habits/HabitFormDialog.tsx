"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { Category, Habit } from "@/lib/types";

/** Create a habit, or edit an existing one. */
export function HabitFormDialog({
  open,
  habit,
  categories,
  onClose,
  onSave,
}: {
  open: boolean;
  /** null = create a new habit */
  habit: Habit | null;
  categories: Category[];
  onClose: () => void;
  /** Returns an error message to show, or null on success. */
  onSave: (title: string, categoryId: string | null) => Promise<string | null>;
}) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const titleId = useId();
  const categoryFieldId = useId();
  const errorId = useId();

  useEffect(() => {
    if (!open) return;
    setTitle(habit?.title ?? "");
    setCategoryId(habit?.category_id ?? null);
    setError(null);
  }, [open, habit]);

  const save = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Give the habit a name.");
      return;
    }
    setSaving(true);
    const err = await onSave(trimmed, categoryId);
    setSaving(false);
    if (err) setError(err);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={habit ? "Edit habit" : "New habit"}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={save}>
            {habit ? "Save changes" : "Create habit"}
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
        <label htmlFor={titleId} className="block text-label text-text-secondary">
          Name
        </label>
        <input
          id={titleId}
          autoFocus
          value={title}
          maxLength={500}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          className="mt-1 h-10 w-full rounded-md border border-border-strong bg-bg px-3 text-body focus:border-primary focus:outline-none aria-invalid:border-error"
        />
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-secondary text-error">
            {error}
          </p>
        )}

        <label htmlFor={categoryFieldId} className="mt-4 block text-label text-text-secondary">
          Category
        </label>
        <select
          id={categoryFieldId}
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(e.target.value || null)}
          className="mt-1 h-10 w-full rounded-md border border-border-strong bg-bg px-3 text-body focus:border-primary focus:outline-none"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </form>
    </Dialog>
  );
}
