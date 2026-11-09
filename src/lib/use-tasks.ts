"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { useToast } from "@/components/ui/Toast";
import type { ISODate } from "@/lib/dates";
import type { Task } from "@/lib/types";

/**
 * Which tasks a screen shows.
 * - range:  scheduled between two dates (Today, Calendar)
 * - inbox:  no scheduled date
 * - search: title text plus optional filters
 */
export type TaskQuery =
  | { kind: "range"; from: ISODate; to: ISODate }
  | { kind: "inbox" }
  /** Not done, and undated or not yet past (used by Categories). */
  | { kind: "open"; today: ISODate }
  | {
      kind: "search";
      text: string;
      /** category id, "none" for Uncategorized, or undefined for all */
      category?: string;
      status?: "open" | "done";
      when?: "undated" | "past" | "today" | "upcoming";
      today: ISODate;
    };

export type TaskPatch = Partial<Pick<Task, "title" | "is_completed" | "scheduled_date" | "category_id">>;

const SEARCH_LIMIT = 200;

/** Escape characters that have a special meaning in ILIKE patterns. */
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/** Same rules as the database query, used to keep the local list correct after edits. */
function matches(t: Task, q: TaskQuery): boolean {
  if (t.deleted_at) return false;
  if (q.kind === "inbox") return t.scheduled_date === null;
  if (q.kind === "open") return !t.is_completed && (t.scheduled_date === null || t.scheduled_date >= q.today);
  if (q.kind === "range") return t.scheduled_date !== null && t.scheduled_date >= q.from && t.scheduled_date <= q.to;
  if (q.text && !t.title.toLowerCase().includes(q.text.toLowerCase())) return false;
  if (q.category === "none" && t.category_id !== null) return false;
  if (q.category && q.category !== "none" && t.category_id !== q.category) return false;
  if (q.status === "open" && t.is_completed) return false;
  if (q.status === "done" && !t.is_completed) return false;
  const d = t.scheduled_date;
  if (q.when === "undated" && d !== null) return false;
  if (q.when === "past" && !(d !== null && d < q.today)) return false;
  if (q.when === "today" && d !== q.today) return false;
  if (q.when === "upcoming" && !(d !== null && d > q.today)) return false;
  return true;
}

function sortTasks(q: TaskQuery) {
  if (q.kind !== "search") return (a: Task, b: Task) => a.created_at.localeCompare(b.created_at);
  // Search: undated first, then newest date first.
  return (a: Task, b: Task) => {
    if (a.scheduled_date === b.scheduled_date) return b.created_at.localeCompare(a.created_at);
    if (a.scheduled_date === null) return -1;
    if (b.scheduled_date === null) return 1;
    return b.scheduled_date.localeCompare(a.scheduled_date);
  };
}

export function friendlyError(err: { code?: string; message?: string } | null): string {
  // P0001 = our own task rules (locked day, past date); safe to show as-is.
  if (err?.code === "P0001" && err.message) return err.message;
  return "Couldn't save your change. Check your connection and try again.";
}

/**
 * Loads the user's tasks for a query and exposes optimistic
 * create / update / delete actions. Refetches when the tab regains focus
 * so changes from other devices show up.
 */
export function useTasks(query: TaskQuery, options: { enabled?: boolean } = {}) {
  const enabled = options.enabled ?? true;
  const { supabase } = useApp();
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(enabled);
  const queryRef = useRef(query);
  queryRef.current = query;
  // Bumped on every local change so a slower in-flight load can't overwrite it.
  const mutationsRef = useRef(0);
  const key = JSON.stringify(query);

  const load = useCallback(async (): Promise<void> => {
    const q = queryRef.current;
    const keyAtStart = JSON.stringify(q);
    const mutationsAtStart = mutationsRef.current;

    let req = supabase.from("tasks").select("*").is("deleted_at", null);
    if (q.kind === "range") {
      req = req.gte("scheduled_date", q.from).lte("scheduled_date", q.to).order("created_at", { ascending: true });
    } else if (q.kind === "inbox") {
      req = req.is("scheduled_date", null).order("created_at", { ascending: true });
    } else if (q.kind === "open") {
      req = req
        .eq("is_completed", false)
        .or(`scheduled_date.is.null,scheduled_date.gte.${q.today}`)
        .order("created_at", { ascending: true });
    } else {
      if (q.text.trim()) req = req.ilike("title", `%${escapeLike(q.text.trim())}%`);
      if (q.category === "none") req = req.is("category_id", null);
      else if (q.category) req = req.eq("category_id", q.category);
      if (q.status) req = req.eq("is_completed", q.status === "done");
      if (q.when === "undated") req = req.is("scheduled_date", null);
      if (q.when === "past") req = req.lt("scheduled_date", q.today);
      if (q.when === "today") req = req.eq("scheduled_date", q.today);
      if (q.when === "upcoming") req = req.gt("scheduled_date", q.today);
      req = req
        .order("scheduled_date", { ascending: false, nullsFirst: true })
        .order("created_at", { ascending: false })
        .limit(SEARCH_LIMIT);
    }

    const { data, error } = await req;
    // Ignore stale responses if the query changed meanwhile.
    if (keyAtStart !== JSON.stringify(queryRef.current)) return;
    // A change happened while loading: the result may be stale, so load again.
    if (mutationsAtStart !== mutationsRef.current) return load();
    if (error) toast({ message: "Couldn't load your tasks. Try refreshing.", tone: "error" });
    else setTasks(data as Task[]);
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    if (!enabled) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    void load();
  }, [key, enabled, load]);

  useEffect(() => {
    if (!enabled) return;
    const onVisible = () => document.visibilityState === "visible" && void load();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load, enabled]);

  const replace = (id: string, next: Task | null) => {
    mutationsRef.current++;
    setTasks((ts) => {
      const without = ts.filter((t) => t.id !== id);
      return next && matches(next, queryRef.current) ? [...without, next].sort(sortTasks(queryRef.current)) : without;
    });
  };

  const create = async (title: string, date: ISODate | null, categoryId: string | null = null) => {
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
    replace(tempId, temp);
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

  const update = async (task: Task, patch: TaskPatch) => {
    if (task.id.startsWith("temp-")) return false;
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

export type TaskActions = Pick<ReturnType<typeof useTasks>, "create" | "update" | "remove">;
