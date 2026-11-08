"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { useToast } from "@/components/ui/Toast";
import type { ISODate } from "@/lib/dates";
import type { Task } from "@/lib/types";

export type TaskRange = { from: ISODate; to: ISODate };

const inRange = (t: Task, r: TaskRange) => t.scheduled_date !== null && t.scheduled_date >= r.from && t.scheduled_date <= r.to;

function friendlyError(err: { code?: string; message?: string } | null): string {
  // P0001 = our own task rules (locked day, past date); safe to show as-is.
  if (err?.code === "P0001" && err.message) return err.message;
  return "Couldn't save your change. Check your connection and try again.";
}

/**
 * Loads the user's scheduled tasks between two dates and exposes
 * optimistic create / update / delete actions. Refetches when the tab
 * regains focus so changes from other devices show up.
 */
export function useTasks(range: TaskRange) {
  const { supabase } = useApp();
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const rangeRef = useRef(range);
  rangeRef.current = range;
  // Bumped on every local change so a slower in-flight load can't overwrite it.
  const mutationsRef = useRef(0);

  const load = useCallback(async (): Promise<void> => {
    const r = rangeRef.current;
    const mutationsAtStart = mutationsRef.current;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .is("deleted_at", null)
      .gte("scheduled_date", r.from)
      .lte("scheduled_date", r.to)
      .order("created_at", { ascending: true });
    // Ignore stale responses if the range changed meanwhile.
    if (r !== rangeRef.current) return;
    // A change happened while loading: the result may be stale, so load again.
    if (mutationsAtStart !== mutationsRef.current) return load();
    if (error) toast({ message: "Couldn't load your tasks. Try refreshing.", tone: "error" });
    else setTasks(data as Task[]);
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [range.from, range.to, load]);

  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && void load();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  const replace = (id: string, next: Task | null) => {
    mutationsRef.current++;
    setTasks((ts) => {
      const without = ts.filter((t) => t.id !== id);
      return next && inRange(next, rangeRef.current) ? [...without, next].sort((a, b) => a.created_at.localeCompare(b.created_at)) : without;
    });
  };

  const create = async (title: string, date: ISODate, categoryId: string | null = null) => {
    const tempId = `temp-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const temp: Task = {
      id: tempId,
      user_id: "",
      category_id: categoryId,
      title,
      scheduled_date: date,
      is_completed: false,
      completed_at: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    mutationsRef.current++;
    setTasks((ts) => [...ts, temp]);
    const { data, error } = await supabase
      .from("tasks")
      .insert({ title, scheduled_date: date, category_id: categoryId })
      .select()
      .single();
    if (error) {
      replace(tempId, null);
      toast({ message: friendlyError(error), tone: "error" });
      return;
    }
    replace(tempId, data as Task);
  };

  const update = async (task: Task, patch: Partial<Pick<Task, "title" | "is_completed" | "scheduled_date" | "category_id">>) => {
    if (task.id.startsWith("temp-")) return;
    const optimistic: Task = {
      ...task,
      ...patch,
      completed_at:
        patch.is_completed === undefined ? task.completed_at : patch.is_completed ? new Date().toISOString() : null,
    };
    replace(task.id, optimistic);
    const { data, error } = await supabase.from("tasks").update(patch).eq("id", task.id).select().single();
    if (error) {
      replace(task.id, task);
      toast({ message: friendlyError(error), tone: "error" });
      return false;
    }
    replace(task.id, data as Task);
    return true;
  };

  const remove = async (task: Task) => {
    if (task.id.startsWith("temp-")) return;
    replace(task.id, null);
    const { error } = await supabase.from("tasks").update({ deleted_at: new Date().toISOString() }).eq("id", task.id);
    if (error) {
      replace(task.id, task);
      toast({ message: friendlyError(error), tone: "error" });
      return;
    }
    toast({
      message: "Task deleted",
      action: {
        label: "Undo",
        onClick: async () => {
          const { data, error: undoError } = await supabase
            .from("tasks")
            .update({ deleted_at: null })
            .eq("id", task.id)
            .select()
            .single();
          if (undoError) toast({ message: friendlyError(undoError), tone: "error" });
          else replace(task.id, data as Task);
        },
      },
    });
  };

  return { tasks, loading, create, update, remove, reload: load };
}
