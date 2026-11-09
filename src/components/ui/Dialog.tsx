"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

/**
 * Modal dialog built on the native <dialog> element, which handles focus
 * trapping, Escape to close, and focus return.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby={titleId}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg bg-bg p-0 text-text shadow-popover backdrop:bg-black/30"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-subheading">{title}</h2>
          <IconButton label="Close" size="sm" icon={<X className="size-4" />} onClick={onClose} />
        </div>
        {description && <p className="mt-1 text-secondary text-text-secondary">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </dialog>
  );
}
