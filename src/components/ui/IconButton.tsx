import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Tooltip } from "./Tooltip";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  /** Required: used for the accessible name and the tooltip. */
  label: string;
  icon: ReactNode;
  /** Optional keyboard shortcut shown in the tooltip. */
  shortcut?: string;
  size?: "sm" | "md";
  tooltipSide?: "top" | "bottom";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, shortcut, size = "md", tooltipSide = "top", className, type = "button", ...props },
  ref,
) {
  return (
    <Tooltip content={label} shortcut={shortcut} side={tooltipSide}>
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md text-text-secondary",
          "transition-colors duration-150 ease-out hover:bg-hover hover:text-text",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Visual size stays compact; the hit area is at least 44px on touch screens.
          size === "sm" ? "size-7" : "size-9",
          "relative after:absolute after:-inset-2 after:content-[''] pointer-fine:after:hidden",
          className,
        )}
        {...props}
      >
        {icon}
      </button>
    </Tooltip>
  );
});
