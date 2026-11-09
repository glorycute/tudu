"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { CATEGORY_COLORS } from "@/lib/categories";
import type { Category } from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";

export type TaskSuggestion = { title: string; category_id: string | null };

const MAX_SUGGESTIONS = 8;

/**
 * Inline "Add task" row.
 * - Type and press Enter to save; the input stays open for the next task.
 * - Type "/" to search tasks you've added before and reuse one.
 * - Escape closes it.
 */
export function TaskInput({
  onCreate,
  categories = [],
  defaultCategoryId = null,
  loadSuggestions,
  placeholder,
}: {
  onCreate: (title: string, categoryId: string | null) => void | Promise<void>;
  categories?: Category[];
  defaultCategoryId?: string | null;
  loadSuggestions?: () => Promise<TaskSuggestion[]>;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(defaultCategoryId);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[] | null>(null);
  const [active, setActive] = useState(0);
  // True when the category was filled in by a "/" suggestion, so it applies to that task only.
  const [categoryFromSuggestion, setCategoryFromSuggestion] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const selectId = useId();

  const slashMode = !!loadSuggestions && value.startsWith("/");
  const filter = slashMode ? value.slice(1).trim().toLowerCase() : "";
  const matches = slashMode
    ? (suggestions ?? []).filter((s) => s.title.toLowerCase().includes(filter)).slice(0, MAX_SUGGESTIONS)
    : [];

  // Fetch saved tasks each time the slash menu opens, so it includes the latest ones.
  useEffect(() => {
    if (!slashMode || !loadSuggestions) {
      setSuggestions(null);
      return;
    }
    if (suggestions !== null) return;
    let cancelled = false;
    void loadSuggestions().then((s) => !cancelled && setSuggestions(s));
    return () => {
      cancelled = true;
    };
  }, [slashMode, loadSuggestions, suggestions]);

  useEffect(() => setActive(0), [filter]);

  // Keep the menu visible above the mobile bottom navigation.
  useEffect(() => {
    if (slashMode) menuRef.current?.scrollIntoView({ block: "nearest" });
  }, [slashMode, suggestions]);

  const findCategory = (id: string | null) => categories.find((c) => c.id === id);

  const submit = async () => {
    let title = (inputRef.current?.value ?? value).trim();
    if (title.startsWith("/")) title = title.slice(1).trim();
    if (!title) return;
    setValue("");
    if (categoryFromSuggestion) {
      setCategoryId(defaultCategoryId);
      setCategoryFromSuggestion(false);
    }
    await onCreate(title, categoryId);
    inputRef.current?.focus();
  };

  const pick = (s: TaskSuggestion) => {
    setValue(s.title);
    // Only reuse the category if it still exists.
    setCategoryId(s.category_id && findCategory(s.category_id) ? s.category_id : null);
    setCategoryFromSuggestion(true);
    inputRef.current?.focus();
  };

  const close = () => {
    setValue("");
    setCategoryId(defaultCategoryId);
    setCategoryFromSuggestion(false);
    setOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
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

  const selected = findCategory(categoryId);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="relative rounded-lg border border-border-strong p-2 focus-within:border-primary"
    >
      <input
        ref={inputRef}
        autoFocus
        role={loadSuggestions ? "combobox" : undefined}
        aria-label="New task"
        aria-autocomplete={loadSuggestions ? "list" : undefined}
        aria-expanded={loadSuggestions ? slashMode : undefined}
        aria-controls={slashMode ? listId : undefined}
        aria-activedescendant={slashMode && matches[active] ? `${listId}-${active}` : undefined}
        value={value}
        maxLength={500}
        placeholder={placeholder ?? (loadSuggestions ? "Task name, or / to reuse a task" : "Task name")}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (slashMode && matches.length > 0 && e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % matches.length);
          } else if (slashMode && matches.length > 0 && e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + matches.length) % matches.length);
          } else if (e.key === "Enter") {
            // Handle Enter directly instead of relying on implicit form submission,
            // which browsers skip while the submit button is still disabled.
            e.preventDefault();
            if (slashMode && matches[active]) pick(matches[active]);
            else void submit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            if (slashMode) setValue(value.slice(1));
            else close();
          }
        }}
        className="h-9 w-full bg-transparent px-1 text-body outline-none placeholder:text-text-disabled"
      />

      {slashMode && (
        <div
          ref={menuRef}
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-72 scroll-mb-[calc(var(--spacing-bottom-nav)+1rem)] overflow-y-auto rounded-lg bg-bg p-1 shadow-popover md:scroll-mb-4"
        >
          {suggestions === null ? (
            <p className="px-2 py-2 text-secondary text-text-secondary">Loading saved tasks…</p>
          ) : matches.length === 0 ? (
            <p className="px-2 py-2 text-secondary text-text-secondary">
              {filter
                ? `No saved task matches. Press Enter to add “${value.slice(1).trim()}”.`
                : "No saved tasks yet. Type a name and press Enter."}
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Saved tasks">
              {matches.map((s, i) => {
                const c = findCategory(s.category_id);
                return (
                  <li
                    key={`${s.title}-${i}`}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(s)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex min-h-9 cursor-pointer items-center justify-between gap-3 rounded-sm px-2 text-body",
                      i === active && "bg-hover",
                    )}
                  >
                    <span className="truncate">{s.title}</span>
                    {c && <CategoryBadge name={c.name} color={c.color} className="shrink-0" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        {categories.length > 0 ? (
          <div className="relative flex min-w-0 items-center">
            <label htmlFor={selectId} className="sr-only">
              Category
            </label>
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute left-2.5 size-2 rounded-full",
                selected ? CATEGORY_COLORS[selected.color].dot : "border border-text-disabled",
              )}
            />
            <select
              id={selectId}
              value={categoryId ?? ""}
              onChange={(e) => {
                setCategoryId(e.target.value || null);
                setCategoryFromSuggestion(false);
              }}
              className="h-8 max-w-44 truncate rounded-md border border-border bg-bg pr-2 pl-6 text-secondary text-text-secondary hover:border-border-strong focus:border-primary focus:outline-none"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span />
        )}
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={close}
            className="h-8 rounded-md px-3 text-secondary font-medium text-text hover:bg-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!value.replace(/^\//, "").trim()}
            className={cn(
              "h-8 rounded-md bg-primary px-3 text-secondary font-medium text-on-primary hover:bg-primary-hover",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            Add task
          </button>
        </div>
      </div>
    </form>
  );
}
