import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      {icon && <div className="mb-3 text-text-disabled" aria-hidden>{icon}</div>}
      <p className="text-subheading">{title}</p>
      {description && <p className="mt-1 max-w-sm text-secondary text-text-secondary">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
