"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type MenuItem = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

/**
 * Small dropdown menu. Opens from a trigger, supports arrow keys, Enter, Escape,
 * and returns focus to the trigger on close.
 */
export function Menu({
  trigger,
  items,
  align = "end",
}: {
  trigger: (props: {
    ref: React.Ref<HTMLButtonElement>;
    onClick: () => void;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    "aria-controls": string;
  }) => ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLButtonElement>("[role=menuitem]:not(:disabled)")?.focus();
    const onPointer = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const buttons = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]:not(:disabled)") ?? [],
    );
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      buttons[(i + 1) % buttons.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      buttons[(i - 1 + buttons.length) % buttons.length]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  return (
    <div className="relative inline-flex">
      {trigger({
        ref: triggerRef,
        onClick: () => setOpen((o) => !o),
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": id,
      })}
      {open && (
        <div
          ref={menuRef}
          id={id}
          role="menu"
          onKeyDown={onKeyDown}
          className={cn(
            "absolute top-full z-40 mt-1 min-w-44 rounded-lg bg-bg p-1 shadow-popover",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                close();
                item.onSelect();
              }}
              className={cn(
                "flex min-h-9 w-full items-center gap-2 rounded-sm px-2 text-left text-body",
                "hover:bg-hover focus-visible:bg-hover focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:text-text-disabled",
                item.destructive ? "text-error" : "text-text",
              )}
            >
              {item.icon && <span aria-hidden className="inline-flex size-4 items-center justify-center">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
