"use client";

import { useState } from "react";
import { ChevronDown, Ellipsis, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskListSkeleton } from "@/components/tasks/TaskListSkeleton";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Menu } from "@/components/ui/Menu";
import { useToast } from "@/components/ui/Toast";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/cn";
import { CATEGORY_COLORS } from "@/lib/categories";
import type { Category, CategoryColor, Task } from "@/lib/types";
import { useTasks, type TaskActions } from "@/lib/use-tasks";
import { CategoryFormDialog } from "./CategoryFormDialog";

const sortByName = (cs: Category[]) => [...cs].sort((a, b) => a.name.localeCompare(b.name));

function Section({
  id,
  name,
  dot,
  tasks,
  actions,
  menu,
}: {
  id: string;
  name: string;
  dot: string;
  tasks: Task[];
  actions: TaskActions;
  menu?: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const panelId = `cat-${id}`;
  return (
    <section className="mb-6">
      <div className="flex items-center gap-1 border-b border-border">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-touch flex-1 items-center gap-2 rounded-md text-left"
        >
          <ChevronDown
            aria-hidden
            className={cn("size-4 text-text-secondary transition-transform duration-150", !open && "-rotate-90")}
          />
          <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", dot)} />
          <h2 className="truncate text-subheading">{name}</h2>
          <span className="text-secondary text-text-secondary">{tasks.length}</span>
        </button>
        {menu}
      </div>
      {open && (
        <div id={panelId}>
          <TaskList tasks={tasks} actions={actions} showDate emptyText="No open tasks" />
        </div>
      )}
    </section>
  );
}

/**
 * Manage categories and see open tasks (today, upcoming and undated) grouped by category.
 * Past tasks are not shown here; find them in Search.
 */
export function CategoriesView() {
  const { supabase, categories, setCategories, today } = useApp();
  const toast = useToast();
  const { tasks, loading, create, update, remove, reload } = useTasks({ kind: "open", today });
  const actions = { create, update, remove };

  const [editing, setEditing] = useState<Category | null | undefined>(undefined); // undefined = closed, null = new
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const saveCategory = async (name: string, color: CategoryColor): Promise<string | null> => {
    const req = editing
      ? supabase.from("categories").update({ name, color }).eq("id", editing.id).select().single()
      : supabase.from("categories").insert({ name, color }).select().single();
    const { data, error } = await req;
    if (error) {
      return error.code === "23505"
        ? "You already have a category with that name."
        : "Couldn't save the category. Try again.";
    }
    const saved = data as Category;
    setCategories(sortByName([...categories.filter((c) => c.id !== saved.id), saved]));
    toast({ message: editing ? "Category updated" : `Created "${saved.name}"` });
    setEditing(undefined);
    return null;
  };

  const deleteCategory = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    const { error } = await supabase.from("categories").delete().eq("id", deleting.id);
    setDeleteBusy(false);
    if (error) {
      toast({ message: "Couldn't delete the category. Try again.", tone: "error" });
      return;
    }
    setCategories(categories.filter((c) => c.id !== deleting.id));
    toast({ message: `Deleted "${deleting.name}". Its tasks are now uncategorized.` });
    setDeleting(null);
    void reload();
  };

  const inCategory = (id: string | null) => tasks.filter((t) => t.category_id === id);
  const deletingCount = deleting ? inCategory(deleting.id).length : 0;

  return (
    <>
      <PageHeader
        title="Categories"
        actions={
          <Button variant="primary" size="sm" onClick={() => setEditing(null)}>
            <Plus className="size-4" aria-hidden />
            New category
          </Button>
        }
      />

      {loading ? (
        <TaskListSkeleton />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Tag className="size-8" />}
          title="No categories yet"
          description="Create categories like Work, Personal or Health, then pick one when you add a task."
          action={
            <Button variant="primary" onClick={() => setEditing(null)}>
              Create a category
            </Button>
          }
        />
      ) : (
        <>
          <p className="mb-6 text-secondary text-text-secondary">
            Open tasks for today, upcoming days and the Inbox. Past tasks are in Search.
          </p>
          {categories.map((c) => (
            <Section
              key={c.id}
              id={c.id}
              name={c.name}
              dot={CATEGORY_COLORS[c.color].dot}
              tasks={inCategory(c.id)}
              actions={actions}
              menu={
                <Menu
                  items={[
                    { label: "Edit name and color", icon: <Pencil className="size-4" />, onSelect: () => setEditing(c) },
                    { label: "Delete category", icon: <Trash2 className="size-4" />, destructive: true, onSelect: () => setDeleting(c) },
                  ]}
                  trigger={(p) => (
                    <button
                      {...p}
                      type="button"
                      aria-label={`Actions for category "${c.name}"`}
                      className="inline-flex size-9 items-center justify-center rounded-md text-text-secondary hover:bg-hover hover:text-text"
                    >
                      <Ellipsis className="size-4" aria-hidden />
                    </button>
                  )}
                />
              }
            />
          ))}
          <Section
            id="none"
            name="Uncategorized"
            dot="border border-text-disabled"
            tasks={inCategory(null)}
            actions={actions}
          />
        </>
      )}

      <CategoryFormDialog
        open={editing !== undefined}
        category={editing ?? null}
        onClose={() => setEditing(undefined)}
        onSave={saveCategory}
      />

      <Dialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Delete "${deleting?.name ?? ""}"?`}
        description={
          deletingCount > 0
            ? `Its ${deletingCount} open ${deletingCount === 1 ? "task moves" : "tasks move"} to Uncategorized, along with any past ones. No tasks are deleted.`
            : "Any tasks in it move to Uncategorized. No tasks are deleted."
        }
        footer={
          <>
            <Button onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteBusy} onClick={deleteCategory}>
              Delete category
            </Button>
          </>
        }
      />
    </>
  );
}
