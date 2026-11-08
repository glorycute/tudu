import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-title">{title}</h1>
        {subtitle && (
          <div className="mt-2 flex items-center gap-1.5 text-body text-text-secondary">{subtitle}</div>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  );
}
