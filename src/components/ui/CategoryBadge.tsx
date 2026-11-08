import { cn } from "@/lib/cn";
import { CATEGORY_COLORS } from "@/lib/categories";
import type { CategoryColor } from "@/lib/types";

/** Category label with a colored dot. The name is always shown, so color is never the only signal. */
export function CategoryBadge({
  name,
  color,
  className,
}: {
  name: string;
  color: CategoryColor;
  className?: string;
}) {
  const c = CATEGORY_COLORS[color];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-secondary text-text-secondary", className)}>
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", c.dot)} />
      <span className="truncate">{name}</span>
    </span>
  );
}
