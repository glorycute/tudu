"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastInput = {
  message: string;
  tone?: "default" | "error";
  action?: { label: string; onClick: () => void };
  durationMs?: number;
};
type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (t: ToastInput) => {
      const id = nextId.current++;
      setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
      setTimeout(() => dismiss(id), t.durationMs ?? (t.action ? 6000 : 4000));
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--spacing-bottom-nav)+1rem)] z-50 flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg px-4 py-2.5 text-body shadow-popover",
              t.tone === "error" ? "bg-error text-white" : "bg-primary text-on-primary",
            )}
          >
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action!.onClick();
                  dismiss(t.id);
                }}
                className="rounded-sm px-2 py-1 font-semibold underline-offset-2 hover:underline"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              className="inline-flex size-6 items-center justify-center rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
