"use client";

import { useState, type ReactNode } from "react";
import { Inbox, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Button,
  CategoryBadge,
  Dialog,
  EmptyState,
  IconButton,
  SearchInput,
  Spinner,
  TaskCheck,
  TaskInput,
  TaskItem,
  useToast,
} from "@/components/ui";
import { CATEGORY_COLORS } from "@/lib/categories";
import type { CategoryColor } from "@/lib/types";

const COLORS = [
  ["bg", "Background"],
  ["surface", "Surface"],
  ["hover", "Hover"],
  ["active", "Active"],
  ["border", "Border"],
  ["border-strong", "Border strong"],
  ["text", "Text"],
  ["text-secondary", "Text secondary"],
  ["text-disabled", "Text disabled"],
  ["primary", "Primary"],
  ["success", "Success"],
  ["error", "Error"],
  ["warning", "Warning"],
] as const;

const TYPE = [
  ["text-title", "Page title", "30 / 600"],
  ["text-heading", "Section heading", "20 / 600"],
  ["text-subheading", "Subheading", "16 / 600"],
  ["text-body", "Body text", "15 / 400"],
  ["text-secondary", "Secondary text", "13 / 400"],
  ["text-label", "Supporting label", "12 / 500"],
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-heading">{title}</h2>
      {children}
    </section>
  );
}

export function DesignSystem() {
  const toast = useToast();
  const [checked, setChecked] = useState(false);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <PageHeader title="Design system" subtitle="Shared tokens and components used on every screen." />

      <Section title="Colors">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {COLORS.map(([token, label]) => (
            <div key={token} className="flex items-center gap-3">
              <span
                className="size-8 shrink-0 rounded-md border border-border"
                style={{ background: `var(--color-${token})` }}
              />
              <span className="min-w-0">
                <span className="block truncate text-secondary font-medium">{label}</span>
                <span className="block text-label text-text-secondary">{token}</span>
              </span>
            </div>
          ))}
        </div>
        <h3 className="mt-6 mb-3 text-subheading">Category colors</h3>
        <div className="flex flex-wrap gap-4">
          {(Object.keys(CATEGORY_COLORS) as CategoryColor[]).map((c) => (
            <CategoryBadge key={c} name={CATEGORY_COLORS[c].label} color={c} />
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-3">
          {TYPE.map(([cls, label, spec]) => (
            <div key={cls} className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
              <span className={cls}>{label}</span>
              <span className="shrink-0 text-label text-text-secondary">{spec}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary">Add task</Button>
          <Button>Cancel</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="primary" loading>Saving</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm" variant="primary">Small</Button>
          <IconButton label="Add task" shortcut="Q" icon={<Plus className="size-4" />} />
          <IconButton label="Delete" icon={<Trash2 className="size-4" />} />
          <Spinner label="Loading" />
        </div>
      </Section>

      <Section title="Task check">
        <div className="flex items-center gap-6">
          <TaskCheck checked={checked} onChange={setChecked} label="Demo task" />
          <TaskCheck checked label="Done task" onChange={() => {}} />
          <TaskCheck checked={false} disabled label="Locked task" onChange={() => {}} />
        </div>
      </Section>

      <Section title="Task items">
        <TaskItem title="Matcha" completed={false} category={{ name: "Personal", color: "green" }} onToggle={() => {}} onRename={() => {}} onDelete={() => {}} />
        <TaskItem title="Send invoice" completed category={{ name: "Work", color: "blue" }} meta="Completed 9:41 AM" onToggle={() => {}} onRename={() => {}} />
        <TaskItem title="Pay rent" completed={false} meta="Mon, 2 Nov" locked category={{ name: "Personal", color: "green" }} />
        <TaskItem title="Read a chapter" completed={false} meta="Undated" onToggle={() => {}} onRename={() => {}} onDelete={() => {}} />
        <div className="pt-2">
          <TaskInput onCreate={(t) => toast({ message: `Created "${t}"` })} />
        </div>
      </Section>

      <Section title="Search">
        <SearchInput value={query} onValueChange={setQuery} placeholder="Search tasks" />
      </Section>

      <Section title="Dialog and toast">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
          <Button onClick={() => toast({ message: "Task deleted", action: { label: "Undo", onClick: () => {} } })}>
            Show toast
          </Button>
          <Button onClick={() => toast({ message: "Couldn't save. Check your connection and try again.", tone: "error" })}>
            Show error toast
          </Button>
        </div>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Delete category?"
          description="Its tasks will move to Uncategorized. This can't be undone."
          footer={
            <>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => setDialogOpen(false)}>Delete category</Button>
            </>
          }
        />
      </Section>

      <Section title="Empty state">
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={<Inbox className="size-8" />}
            title="Inbox is empty"
            description="Capture tasks here when you don't know when you'll do them yet."
            action={<Button variant="primary">Add task</Button>}
          />
        </div>
      </Section>
    </>
  );
}
